import { z } from "zod";

const createCommentValidationSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(2000, "Comment must not exceed 2000 characters"),

  taskId: z.string().uuid("Task ID must be a valid UUID"),
});

const updateCommentValidationSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(2000, "Comment must not exceed 2000 characters"),
});

export const CommentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
