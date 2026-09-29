import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { UserService } from "./user.service.js";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile updated successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUserRole(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User role updated successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUserStatus(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.softDeleteUser(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  softDeleteUser,
};
