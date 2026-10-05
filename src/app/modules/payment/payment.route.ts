import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { validateQuery } from "../../middleware/validateQuery.js";

import { PaymentController } from "./payment.controller.js";
import { PaymentValidation } from "./payment.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create payment
router.post(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPayment,
);

// bKash callback
// Important: no checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER) here because bKash will call this URL
router.get("/bkash/callback", PaymentController.bkashCallback);

// Get payments
router.get(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(PaymentValidation.getPaymentsValidationSchema),
  PaymentController.getPayments,
);

// Get payment by id
router.get(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  PaymentController.getPaymentById,
);

// Manual execute endpoint
// Useful mainly for testing/debugging
router.post(
  "/:id/execute",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  PaymentController.executePayment,
);

// Cancel local pending payment
router.patch(
  "/:id/cancel",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  PaymentController.cancelPayment,
);

export const PaymentRoutes = router;
