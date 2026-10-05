import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.registerUser,
);

router.post(
  "/register/verify-otp",
  validateRequest(AuthValidation.verifyOtpValidationSchema),
  AuthController.verifyRegisterOtp,
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
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  AuthController.getMe,
);

export const AuthRoutes = router;
