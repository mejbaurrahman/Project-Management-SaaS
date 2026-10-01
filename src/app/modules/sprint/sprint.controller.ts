import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { SprintService } from "./sprint.service.js";

const createSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await SprintService.createSprint(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Sprint created successfully",
    data: result,
  });
});

const getSprints = catchAsync(async (req: Request, res: Response) => {
  const result = await SprintService.getSprints(req.user!.userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprints retrieved successfully",
    data: result,
  });
});

const getSprintById = catchAsync(async (req: Request, res: Response) => {
  const result = await SprintService.getSprintById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint retrieved successfully",
    data: result,
  });
});

const updateSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await SprintService.updateSprint(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint updated successfully",
    data: result,
  });
});

const updateSprintStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await SprintService.updateSprintStatus(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint status updated successfully",
    data: result,
  });
});

export const SprintController = {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  updateSprintStatus,
};
