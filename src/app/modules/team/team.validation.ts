import { z } from "zod";

const createTeamValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(120, "Team name must not exceed 120 characters"),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
});

const updateTeamValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(120, "Team name must not exceed 120 characters")
    .optional(),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
});

const addTeamMemberValidationSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
});

export const TeamValidation = {
  createTeamValidationSchema,
  updateTeamValidationSchema,
  addTeamMemberValidationSchema,
};
