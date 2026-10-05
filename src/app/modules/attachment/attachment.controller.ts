import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../utils/AppError.js";

import { CloudinaryUtils } from "../../lib/cloudinary.js";

import { AttachmentService } from "./attachment.service.js";

const createAttachments = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "At least one file is required");
  }

  const { taskId } = req.body;

  if (!taskId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Task ID is required");
  }

  const uploadedAttachments = [];

  for (const file of files) {
    const cloudinaryResult = await CloudinaryUtils.uploadBuffer(
      file.buffer,
      "taskflow/attachments",
    );

    const attachment = await AttachmentService.createAttachment(
      req.user!.userId,
      {
        fileName: file.originalname,
        fileUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        taskId,
      },
    );

    uploadedAttachments.push(attachment);
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Attachments uploaded successfully",
    data: uploadedAttachments,
  });
});

const getAttachments = catchAsync(async (req: Request, res: Response) => {
  const result = await AttachmentService.getAttachments(
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
    message: "Attachments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAttachmentById = catchAsync(async (req: Request, res: Response) => {
  const result = await AttachmentService.getAttachmentById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attachment retrieved successfully",
    data: result,
  });
});

const softDeleteAttachment = catchAsync(async (req: Request, res: Response) => {
  const result = await AttachmentService.softDeleteAttachment(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attachment deleted successfully",
    data: result,
  });
});

export const AttachmentController = {
  createAttachments,
  getAttachments,
  getAttachmentById,
  softDeleteAttachment,
};
