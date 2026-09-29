import { z } from "zod";

const createOrganizationValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(120, "Organization name must not exceed 120 characters"),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
});

const updateOrganizationValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(120, "Organization name must not exceed 120 characters")
    .optional(),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
});

const addOrganizationMemberValidationSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),

  role: z.enum(["OWNER", "MANAGER", "MEMBER", "GUEST"]).optional(),
});

const updateOrganizationMemberRoleValidationSchema = z.object({
  role: z.enum(["OWNER", "MANAGER", "MEMBER", "GUEST"]),
});

export const OrganizationValidation = {
  createOrganizationValidationSchema,
  updateOrganizationValidationSchema,
  addOrganizationMemberValidationSchema,
  updateOrganizationMemberRoleValidationSchema,
};
