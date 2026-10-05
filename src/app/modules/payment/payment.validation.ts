import { z } from "zod";

const createPaymentValidationSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),

  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
});

const getPaymentsValidationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive number").optional(),

  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .optional(),

  organizationId: z
    .string()
    .uuid("Organization ID must be a valid UUID")
    .optional(),

  payerId: z.string().uuid("Payer ID must be a valid UUID").optional(),

  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED"]).optional(),

  gateway: z.string().min(1, "Gateway cannot be empty").optional(),

  transactionId: z.string().min(1, "Transaction ID cannot be empty").optional(),

  sortBy: z.enum(["createdAt", "updatedAt", "amount", "status"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  getPaymentsValidationSchema,
};
