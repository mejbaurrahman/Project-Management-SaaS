import { z } from "zod";

const createSprintValidationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Sprint name must be at least 2 characters")
      .max(120, "Sprint name must not exceed 120 characters"),

    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),

    projectId: z.string().uuid("Project ID must be a valid UUID"),

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

const updateSprintValidationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Sprint name must be at least 2 characters")
      .max(120, "Sprint name must not exceed 120 characters")
      .optional(),

    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
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

const updateSprintStatusValidationSchema = z.object({
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

export const SprintValidation = {
  createSprintValidationSchema,
  updateSprintValidationSchema,
  updateSprintStatusValidationSchema,
};
