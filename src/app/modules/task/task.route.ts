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
  checkAuth(UserRole.MEMBER),
  validateRequest(TaskValidation.createTaskValidationSchema),
  TaskController.createTask,
);

// Get tasks
router.get("/", checkAuth(), TaskController.getTasks);

// Get task by id
router.get("/:id", checkAuth(), TaskController.getTaskById);

// Update task
router.patch(
  "/:id",
  checkAuth(),
  validateRequest(TaskValidation.updateTaskValidationSchema),
  TaskController.updateTask,
);

// Update task status
router.patch(
  "/:id/status",
  checkAuth(),
  validateRequest(TaskValidation.updateTaskStatusValidationSchema),
  TaskController.updateTaskStatus,
);

// Soft delete task
router.delete("/:id", checkAuth(), TaskController.softDeleteTask);

export const TaskRoutes = router;
