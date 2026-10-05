import { z } from "zod";

const getActivityLogsValidationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive number").optional(),

  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .optional(),

  organizationId: z
    .string()
    .uuid("Organization ID must be a valid UUID")
    .optional(),

  userId: z.string().uuid("User ID must be a valid UUID").optional(),

  taskId: z.string().uuid("Task ID must be a valid UUID").optional(),

  entityType: z.string().min(1, "Entity type cannot be empty").optional(),

  entityId: z.string().uuid("Entity ID must be a valid UUID").optional(),

  action: z.string().min(1, "Action cannot be empty").optional(),

  search: z.string().min(1, "Search cannot be empty").optional(),

  sortBy: z.enum(["createdAt", "action", "entityType"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const ActivityLogValidation = {
  getActivityLogsValidationSchema,
};
