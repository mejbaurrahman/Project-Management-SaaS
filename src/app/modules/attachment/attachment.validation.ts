import { z } from "zod";

const createAttachmentValidationSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must not exceed 255 characters"),

  fileUrl: z.string().url("File URL must be a valid URL"),

  publicId: z
    .string()
    .max(255, "Public ID must not exceed 255 characters")
    .optional(),

  taskId: z.string().uuid("Task ID must be a valid UUID"),
});

export const AttachmentValidation = {
  createAttachmentValidationSchema,
};
