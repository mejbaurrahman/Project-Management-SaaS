import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest.js";

import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

import { UserRole, UserStatus } from "../../../generated/prisma/enums.js";
import { checkAuth } from "../../middleware/checkAuth.js";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.registerUser,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

router.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.getMe,
);
export const AuthRoutes = router;
