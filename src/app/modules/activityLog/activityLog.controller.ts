import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { ActivityLogService } from "./activityLog.service.js";

const getActivityLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityLogService.getActivityLogs(
    req.user!.userId,
    req.query as unknown as {
      page?: string;
      limit?: string;
      organizationId?: string;
      userId?: string;
      taskId?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Activity logs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getActivityLogById = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityLogService.getActivityLogById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Activity log retrieved successfully",
    data: result,
  });
});

export const ActivityLogController = {
  getActivityLogs,
  getActivityLogById,
};
