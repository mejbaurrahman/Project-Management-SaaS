import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { AuthService } from "./auth.service.js";

// ========================================
// REGISTER USER
// Send registration OTP
// ========================================

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Registration OTP sent successfully",
    data: result,
  });
});

// ========================================
// VERIFY REGISTER OTP
// Create user + generate tokens
// ========================================

const verifyRegisterOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyRegisterOtp(req.body);

  const { accessToken, refreshToken, user } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// ========================================
// LOGIN USER
// Check password + send login OTP
// ========================================

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login OTP sent successfully",
    data: result,
  });
});

// ========================================
// VERIFY LOGIN OTP
// Generate tokens + set cookies
// ========================================

const verifyLoginOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyLoginOtp(req.body);

  const { accessToken, refreshToken, user } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// ========================================
// GET CURRENT USER
// ========================================

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getMe(req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// ========================================
// REFRESH ACCESS TOKEN
// ========================================

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  const result = await AuthService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token generated successfully",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  verifyRegisterOtp,

  loginUser,
  verifyLoginOtp,

  getMe,
  refreshToken,
};
