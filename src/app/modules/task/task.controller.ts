import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { TaskService } from "./task.service.js";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.createTask(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const getTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getTasks(
    req.user!.userId,
    req.query as unknown as {
      page?: string;
      limit?: string;
      projectId?: string;
      sprintId?: string;
      assigneeId?: string;
      status?: string;
      priority?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getTaskById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task retrieved successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.updateTask(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.updateTaskStatus(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task status updated successfully",
    data: result,
  });
});

const softDeleteTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.softDeleteTask(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted successfully",
    data: result,
  });
});

export const TaskController = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  softDeleteTask,
};
