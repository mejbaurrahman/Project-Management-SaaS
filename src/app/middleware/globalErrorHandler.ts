import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import config from "../config/index.js";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  // Temporary debugging
  console.error("🔥 GLOBAL ERROR:", err);

  let statusCode = 500;
  let message = "Something went wrong";
  let errors: unknown[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";

    errors = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Error) {
    message =
      config.node_env === "development" ? err.message : "Something went wrong";
  } else if (
    config.node_env === "development" &&
    typeof err === "object" &&
    err !== null &&
    "message" in err
  ) {
    message = String((err as { message: unknown }).message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
