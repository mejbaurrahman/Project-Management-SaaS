import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { OrganizationController } from "./organization.controller.js";
import { OrganizationValidation } from "./organization.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create organization
router.post(
  "/",
  checkAuth(UserRole.MEMBER),
  validateRequest(OrganizationValidation.createOrganizationValidationSchema),
  OrganizationController.createOrganization,
);

// Get organizations where current user is a member
router.get(
  "/",
  checkAuth(UserRole.MEMBER),
  OrganizationController.getMyOrganizations,
);

// Get one organization
router.get("/:id", checkAuth(), OrganizationController.getOrganizationById);

// Update organization
router.patch(
  "/:id",
  checkAuth(UserRole.MEMBER),
  validateRequest(OrganizationValidation.updateOrganizationValidationSchema),
  OrganizationController.updateOrganization,
);

// Soft delete organization
router.delete(
  "/:id",
  checkAuth(UserRole.MEMBER),
  OrganizationController.softDeleteOrganization,
);

// Get organization members
router.get(
  "/:id/members",
  checkAuth(UserRole.MEMBER),
  OrganizationController.getOrganizationMembers,
);

// Add member
router.post(
  "/:id/members",
  checkAuth(UserRole.MEMBER),
  validateRequest(OrganizationValidation.addOrganizationMemberValidationSchema),
  OrganizationController.addOrganizationMember,
);

// Update organization member role
router.patch(
  "/:id/members/:userId/role",
  checkAuth(UserRole.MEMBER),
  validateRequest(
    OrganizationValidation.updateOrganizationMemberRoleValidationSchema,
  ),
  OrganizationController.updateOrganizationMemberRole,
);

// Remove member
router.delete(
  "/:id/members/:userId",
  checkAuth(UserRole.MEMBER),
  OrganizationController.removeOrganizationMember,
);

export const OrganizationRoutes = router;
