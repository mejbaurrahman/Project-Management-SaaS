import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { CommentService } from "./comment.service.js";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.createComment(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getComments = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getComments(
    req.user!.userId,
    req.query as unknown as {
      taskId?: string;
      page?: string;
      limit?: string;
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCommentById = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getCommentById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment retrieved successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.updateComment(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const softDeleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.softDeleteComment(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const CommentController = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  softDeleteComment,
};
