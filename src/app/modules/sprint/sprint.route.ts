import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { SprintController } from "./sprint.controller.js";
import { SprintValidation } from "./sprint.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create sprint
router.post(
  "/",
  checkAuth(UserRole.MEMBER),
  validateRequest(SprintValidation.createSprintValidationSchema),
  SprintController.createSprint,
);

// Get sprints
router.get("/", checkAuth(UserRole.MEMBER), SprintController.getSprints);

// Get sprint by id
router.get("/:id", checkAuth(UserRole.MEMBER), SprintController.getSprintById);

// Update sprint
router.patch(
  "/:id",
  checkAuth(UserRole.MEMBER),
  validateRequest(SprintValidation.updateSprintValidationSchema),
  SprintController.updateSprint,
);

// Update sprint status
router.patch(
  "/:id/status",
  checkAuth(UserRole.MEMBER),
  validateRequest(SprintValidation.updateSprintStatusValidationSchema),
  SprintController.updateSprintStatus,
);

export const SprintRoutes = router;
