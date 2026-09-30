import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { TeamController } from "./team.controller.js";
import { TeamValidation } from "./team.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create team
router.post(
  "/",
  checkAuth(UserRole.MEMBER),
  validateRequest(TeamValidation.createTeamValidationSchema),
  TeamController.createTeam,
);

// Get teams where current user is a member
router.get("/", checkAuth(UserRole.MEMBER), TeamController.getMyTeams);

// Get one team
router.get("/:id", checkAuth(UserRole.MEMBER), TeamController.getTeamById);

// Update team
router.patch(
  "/:id",
  checkAuth(UserRole.MEMBER),
  validateRequest(TeamValidation.updateTeamValidationSchema),
  TeamController.updateTeam,
);

// Soft delete team
router.delete("/:id", checkAuth(), TeamController.softDeleteTeam);

// Add team member
router.post(
  "/:id/members",
  checkAuth(),
  validateRequest(TeamValidation.addTeamMemberValidationSchema),
  TeamController.addTeamMember,
);

// Remove team member
router.delete(
  "/:id/members/:userId",
  checkAuth(),
  TeamController.removeTeamMember,
);

export const TeamRoutes = router;
