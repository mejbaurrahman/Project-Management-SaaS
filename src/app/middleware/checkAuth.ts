import type { NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import type { UserRole } from "../../generated/prisma/enums.js";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { JwtUtils } from "../utils/jwt.js";

export interface RequestUser {
  email: string;
  name: string;
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

// checkAuth(UserRole.ADMIN)
// checkAuth(UserRole.ADMIN, UserRole.MANAGER)
// checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER)
export const checkAuth = (...requiredRoles: UserRole[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const token = req.cookies?.accessToken
        ? req.cookies.accessToken
        : req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : req.headers.authorization;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not logged in. Please log in to access this resource.",
        );
      }

      let verifiedToken;

      try {
        verifiedToken = JwtUtils.verifyAccessToken(token);
      } catch {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired access token.",
        );
      }

      const { email, userId, role } = verifiedToken;

      if (!email || !userId || !role) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token.");
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Forbidden. You don't have permission to access this resource.",
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "User not found. Please log in again.",
        );
      }

      if (user.deletedAt) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "User account is no longer available.",
        );
      }

      if (user.status === "BLOCKED") {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Your account has been blocked. Please contact support.",
        );
      }

      if (user.email !== email || user.role !== role) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "User authentication information is no longer valid. Please log in again.",
        );
      }

      req.user = {
        email: user.email,
        name: user.name,
        userId: user.id,
        role: user.role,
      };

      next();
    },
  );
};
