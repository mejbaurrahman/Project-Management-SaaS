import { z } from "zod";

const updateProfileValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  profilePhoto: z.string().url("Profile photo must be a valid URL").optional(),
});

const updateRoleValidationSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
});

const updateStatusValidationSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]),
});

export const UserValidation = {
  updateProfileValidationSchema,
  updateRoleValidationSchema,
  updateStatusValidationSchema,
};
