import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { ProjectController } from "./project.controller.js";
import { ProjectValidation } from "./project.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create project
router.post(
  "/",
  checkAuth(UserRole.MEMBER),
  validateRequest(ProjectValidation.createProjectValidationSchema),
  ProjectController.createProject,
);

// Get projects with pagination/filter/search/sort
router.get("/", checkAuth(UserRole.MEMBER), ProjectController.getProjects);

// Get one project
router.get(
  "/:id",
  checkAuth(UserRole.MEMBER),
  ProjectController.getProjectById,
);

// Update project
router.patch(
  "/:id",
  checkAuth(UserRole.MEMBER),
  validateRequest(ProjectValidation.updateProjectValidationSchema),
  ProjectController.updateProject,
);

// Update project status
router.patch(
  "/:id/status",
  checkAuth(UserRole.MEMBER),
  validateRequest(ProjectValidation.updateProjectStatusValidationSchema),
  ProjectController.updateProjectStatus,
);

// Soft delete project
router.delete(
  "/:id",
  checkAuth(UserRole.MEMBER),
  ProjectController.softDeleteProject,
);

export const ProjectRoutes = router;
