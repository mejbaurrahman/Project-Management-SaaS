import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { TeamService } from "./team.service.js";

const createTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.createTeam(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Team created successfully",
    data: result,
  });
});

const getMyTeams = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.getMyTeams(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teams retrieved successfully",
    data: result,
  });
});

const getTeamById = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.getTeamById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team retrieved successfully",
    data: result,
  });
});

const updateTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.updateTeam(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team updated successfully",
    data: result,
  });
});

const softDeleteTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.softDeleteTeam(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team deleted successfully",
    data: result,
  });
});

const addTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.addTeamMember(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Team member added successfully",
    data: result,
  });
});

const removeTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.removeTeamMember(
    req.user!.userId,
    req.params.id as string,
    req.params.userId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member removed successfully",
    data: result,
  });
});

export const TeamController = {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  softDeleteTeam,
  addTeamMember,
  removeTeamMember,
};
