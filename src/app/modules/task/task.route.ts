import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { TaskController } from "./task.controller.js";
import { TaskValidation } from "./task.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create task
router.post(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(TaskValidation.createTaskValidationSchema),
  TaskController.createTask,
);

// Get tasks
router.get(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  TaskController.getTasks,
);

// Get task by id
router.get(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  TaskController.getTaskById,
);

// Update task
router.patch(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(TaskValidation.updateTaskValidationSchema),
  TaskController.updateTask,
);

// Update task status
router.patch(
  "/:id/status",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(TaskValidation.updateTaskStatusValidationSchema),
  TaskController.updateTaskStatus,
);

// Soft delete task
router.delete(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  TaskController.softDeleteTask,
);

export const TaskRoutes = router;
