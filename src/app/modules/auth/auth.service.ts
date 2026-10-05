import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import config from "../../config/index.js";
import { EmailUtils } from "../../lib/email.js";
import { prisma } from "../../lib/prisma.js";
import { redisClient } from "../../lib/redis.js";

import { AppError } from "../../utils/AppError.js";
import { JwtUtils } from "../../utils/jwt.js";
import { OtpUtils } from "../../utils/otp.js";

import type {
  TLoginPayload,
  TPendingRegistration,
  TRegisterPayload,
  TVerifyOtpPayload,
} from "./auth.interface";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  profilePhoto: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const registerUser = async (payload: TRegisterPayload) => {
  const email = payload.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds,
  );

  const otp = OtpUtils.generateOtp();

  const pendingRegistration: TPendingRegistration = {
    name: payload.name.trim(),
    email,
    password: hashedPassword,
  };

  const otpKey = `register:otp:${email}`;

  const dataKey = `register:data:${email}`;

  await redisClient.set(otpKey, otp, {
    EX: config.otp_expires_in,
  });

  await redisClient.set(dataKey, JSON.stringify(pendingRegistration), {
    EX: config.otp_expires_in,
  });

  try {
    await EmailUtils.sendOtpEmail(email, otp, "REGISTER");
  } catch {
    await redisClient.del([otpKey, dataKey]);

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send registration OTP",
    );
  }

  return {
    email,
    expiresIn: config.otp_expires_in,
  };
};

const verifyRegisterOtp = async (payload: TVerifyOtpPayload) => {
  const email = payload.email.trim().toLowerCase();

  const otpKey = `register:otp:${email}`;

  const dataKey = `register:data:${email}`;

  const savedOtp = await redisClient.get(otpKey);

  if (!savedOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired or not found");
  }

  if (savedOtp !== payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  const pendingData = await redisClient.get(dataKey);

  if (!pendingData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Registration session expired");
  }

  const registrationData = JSON.parse(pendingData) as TPendingRegistration;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    await redisClient.del([otpKey, dataKey]);

    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  const user = await prisma.user.create({
    data: {
      name: registrationData.name,

      email: registrationData.email,

      password: registrationData.password,
    },

    select: publicUserSelect,
  });

  await redisClient.del([otpKey, dataKey]);

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = JwtUtils.createAccessToken(jwtPayload);

  const refreshToken = JwtUtils.createRefreshToken(jwtPayload);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: TLoginPayload) => {
  const email = payload.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || user.deletedAt) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(403, "Your account is blocked");
  }

  if (!user.password) {
    throw new AppError(401, "Please login using Google");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = JwtUtils.createAccessToken(jwtPayload);

  const refreshToken = JwtUtils.createRefreshToken(jwtPayload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

const verifyLoginOtp = async (payload: TVerifyOtpPayload) => {
  const email = payload.email.trim().toLowerCase();

  const otpKey = `login:otp:${email}`;

  const savedOtp = await redisClient.get(otpKey);

  if (!savedOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired or not found");
  }

  if (savedOtp !== payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.deletedAt) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deleted");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }

  await redisClient.del(otpKey);

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = JwtUtils.createAccessToken(jwtPayload);

  const refreshToken = JwtUtils.createRefreshToken(jwtPayload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      role: user.role,
      status: user.status,
    },

    accessToken,
    refreshToken,
  };
};

// ========================================
// GET ME
// ========================================

const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },

    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

// ========================================
// REFRESH TOKEN
// ========================================

const refreshToken = async (refreshToken: string) => {
  let decoded;

  try {
    decoded = JwtUtils.verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
  }

  if (user.deletedAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User account is deleted");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }

  const accessToken = JwtUtils.createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
  };
};

export const AuthService = {
  registerUser,
  verifyRegisterOtp,

  loginUser,
  verifyLoginOtp,

  getMe,
  refreshToken,
};
