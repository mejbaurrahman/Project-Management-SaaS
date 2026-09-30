import { z } from "zod";

const createProjectValidationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(150, "Project name must not exceed 150 characters"),

    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),

    organizationId: z.string().uuid("Organization ID must be a valid UUID"),

    teamId: z.string().uuid("Team ID must be a valid UUID"),

    startDate: z
      .string()
      .datetime("Start date must be a valid ISO date")
      .optional(),

    endDate: z
      .string()
      .datetime("End date must be a valid ISO date")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

const updateProjectValidationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(150, "Project name must not exceed 150 characters")
      .optional(),

    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),

    startDate: z
      .string()
      .datetime("Start date must be a valid ISO date")
      .optional(),

    endDate: z
      .string()
      .datetime("End date must be a valid ISO date")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

const updateProjectStatusValidationSchema = z.object({
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
});

export const ProjectValidation = {
  createProjectValidationSchema,
  updateProjectValidationSchema,
  updateProjectStatusValidationSchema,
};
