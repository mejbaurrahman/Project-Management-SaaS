import type { NextFunction, Request, Response } from "express";

import type { ZodTypeAny } from "zod";

import { AppError } from "../utils/AppError.js";

export const validateQuery =
  (schema: ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.query);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        throw new AppError(400, "Query validation failed", errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
