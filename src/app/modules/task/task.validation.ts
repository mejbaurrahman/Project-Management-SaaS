import { z } from "zod";

const createTaskValidationSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Task title must not exceed 150 characters"),

  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),

  projectId: z.string().uuid("Project ID must be a valid UUID"),

  sprintId: z.string().uuid("Sprint ID must be a valid UUID").optional(),

  assigneeId: z.string().uuid("Assignee ID must be a valid UUID").optional(),

  parentTaskId: z
    .string()
    .uuid("Parent task ID must be a valid UUID")
    .optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

  dueDate: z.string().datetime("Due date must be a valid ISO date").optional(),
});

const updateTaskValidationSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Task title must not exceed 150 characters")
    .optional(),

  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),

  sprintId: z.string().uuid("Sprint ID must be a valid UUID").optional(),

  assigneeId: z.string().uuid("Assignee ID must be a valid UUID").optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

  dueDate: z.string().datetime("Due date must be a valid ISO date").optional(),
});

const updateTaskStatusValidationSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
});

export const TaskValidation = {
  createTaskValidationSchema,
  updateTaskValidationSchema,
  updateTaskStatusValidationSchema,
};
