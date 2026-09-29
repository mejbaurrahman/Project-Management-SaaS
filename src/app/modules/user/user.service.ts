import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TUpdateProfilePayload,
  TUpdateRolePayload,
  TUpdateStatusPayload,
} from "./user.interface.js";

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

const getMyProfile = async (userId: string) => {
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

const updateMyProfile = async (
  userId: string,
  payload: TUpdateProfilePayload,
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: payload,

    select: publicUserSelect,
  });

  return updatedUser;
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },

    select: publicUserSelect,

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const updateUserRole = async (
  adminUserId: string,
  targetUserId: string,
  payload: TUpdateRolePayload,
) => {
  if (adminUserId === targetUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own role",
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: targetUserId,
    },

    data: {
      role: payload.role,
    },

    select: publicUserSelect,
  });

  return updatedUser;
};

const updateUserStatus = async (
  adminUserId: string,
  targetUserId: string,
  payload: TUpdateStatusPayload,
) => {
  if (adminUserId === targetUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own status",
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: targetUserId,
    },

    data: {
      status: payload.status,
    },

    select: publicUserSelect,
  });

  return updatedUser;
};

const softDeleteUser = async (adminUserId: string, targetUserId: string) => {
  if (adminUserId === targetUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot delete your own account",
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  await prisma.user.update({
    where: {
      id: targetUserId,
    },

    data: {
      deletedAt: new Date(),
      status: "BLOCKED",
    },
  });

  return null;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  softDeleteUser,
};
