import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../utils/AppError.js";

import { PaymentService } from "./payment.service.js";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPayment(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "bKash payment created successfully",
    data: result,
  });
});

const getPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPayments(
    req.user!.userId,
    req.query as unknown as {
      page?: string;
      limit?: string;
      organizationId?: string;
      payerId?: string;
      status?: string;
      gateway?: string;
      transactionId?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const executePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.executePayment(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment executed successfully",
    data: result,
  });
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.cancelPayment(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment cancelled successfully",
    data: result,
  });
});

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
  const paymentID =
    typeof req.query.paymentID === "string" ? req.query.paymentID : undefined;

  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  if (!paymentID) {
    throw new AppError(httpStatus.BAD_REQUEST, "bKash payment ID is required");
  }

  if (!status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "bKash callback status is required",
    );
  }

  const result = await PaymentService.handleBkashCallback(paymentID, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "bKash callback processed successfully",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  getPayments,
  getPaymentById,
  executePayment,
  cancelPayment,
  bkashCallback,
};
