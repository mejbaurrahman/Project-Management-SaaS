import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Logged-in user routes
router.get(
  "/me",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  UserController.getMyProfile,
);

router.patch(
  "/me",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile,
);

// Admin routes
router.get("/", checkAuth("ADMIN"), UserController.getAllUsers);

router.patch(
  "/:id/role",
  checkAuth("ADMIN"),
  validateRequest(UserValidation.updateRoleValidationSchema),
  UserController.updateUserRole,
);

router.patch(
  "/:id/status",
  checkAuth("ADMIN"),
  validateRequest(UserValidation.updateStatusValidationSchema),
  UserController.updateUserStatus,
);

router.delete("/:id", checkAuth("ADMIN"), UserController.softDeleteUser);

export const UserRoutes = router;
