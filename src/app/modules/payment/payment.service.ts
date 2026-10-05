import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { BkashUtils } from "../../lib/bkash.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TCreatePaymentPayload,
  TPaymentQuery,
} from "./payment.interface.js";

const createPayment = async (
  userId: string,
  payload: TCreatePaymentPayload,
) => {
  const organization = await prisma.organization.findFirst({
    where: {
      id: payload.organizationId,
      deletedAt: null,
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: payload.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const payment = await prisma.payment.create({
    data: {
      amount: payload.amount,
      currency: "BDT",
      gateway: "BKASH",
      status: "PENDING",

      organizationId: payload.organizationId,

      payerId: userId,

      metadata: {
        organizationName: organization.name,
      },
    },
  });

  try {
    const bkashPayment = await BkashUtils.createPayment({
      amount: payload.amount,

      merchantInvoiceNumber: payment.id,
    });

    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        gatewayPaymentId: bkashPayment.paymentID,

        metadata: {
          organizationName: organization.name,

          bkashURL: bkashPayment.bkashURL ?? null,

          callbackURL: bkashPayment.callbackURL ?? null,

          successCallbackURL: bkashPayment.successCallbackURL ?? null,

          failureCallbackURL: bkashPayment.failureCallbackURL ?? null,

          cancelledCallbackURL: bkashPayment.cancelledCallbackURL ?? null,
        },
      },
    });

    return {
      payment: updatedPayment,

      bkashURL: bkashPayment.bkashURL,
    };
  } catch (error) {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",

        metadata: {
          error:
            error instanceof Error
              ? error.message
              : "Failed to create bKash payment",
        },
      },
    });

    throw error;
  }
};

const executePayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (!payment.gatewayPaymentId) {
    throw new AppError(httpStatus.BAD_REQUEST, "bKash payment ID is missing");
  }

  if (payment.status === "PAID") {
    return payment;
  }

  if (payment.status === "CANCELLED" || payment.status === "FAILED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot execute a ${payment.status.toLowerCase()} payment`,
    );
  }

  const result = await BkashUtils.executePayment(payment.gatewayPaymentId);

  const transactionStatus = result.transactionStatus?.toLowerCase();

  const isSuccessful =
    transactionStatus === "completed" || transactionStatus === "success";

  if (!isSuccessful || !result.trxID) {
    const failedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",

        metadata: {
          previousMetadata: payment.metadata,

          transactionStatus: result.transactionStatus ?? null,

          statusCode: result.statusCode ?? null,

          statusMessage: result.statusMessage ?? null,
        },
      },
    });

    return failedPayment;
  }

  const updatedPayment = await prisma.payment.update({
    where: {
      id: payment.id,
    },

    data: {
      status: "PAID",

      transactionId: result.trxID,

      metadata: {
        previousMetadata: payment.metadata,

        transactionStatus: result.transactionStatus,

        paymentExecuteTime: result.paymentExecuteTime ?? null,

        amount: result.amount ?? null,

        currency: result.currency ?? null,
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "PAYMENT_COMPLETED",

      entityType: "Payment",

      entityId: payment.id,

      organizationId: payment.organizationId,

      userId: payment.payerId,

      metadata: {
        gateway: "BKASH",

        transactionId: result.trxID,

        amount: payment.amount.toString(),

        currency: payment.currency,
      },
    },
  });

  return updatedPayment;
};

const cancelPayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.status === "PAID") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Paid payment cannot be cancelled",
    );
  }

  if (payment.status === "CANCELLED") {
    return payment;
  }

  return prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "CANCELLED",
    },
  });
};

const getPayments = async (userId: string, query: TPaymentQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,
    },

    select: {
      organizationId: true,
    },
  });

  const organizationIds = memberships.map(
    (membership) => membership.organizationId,
  );

  if (query.organizationId && !organizationIds.includes(query.organizationId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to payments for this organization",
    );
  }

  const sortBy = ["createdAt", "updatedAt", "amount", "status"].includes(
    query.sortBy ?? "",
  )
    ? query.sortBy!
    : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const where = {
    organizationId: query.organizationId
      ? query.organizationId
      : {
          in: organizationIds,
        },

    ...(query.payerId && {
      payerId: query.payerId,
    }),

    ...(query.status && {
      status: query.status as "PENDING" | "PAID" | "FAILED" | "CANCELLED",
    }),

    ...(query.gateway && {
      gateway: query.gateway,
    }),

    ...(query.transactionId && {
      transactionId: query.transactionId,
    }),
  };

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,

      skip,
      take: limit,

      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.payment.count({
      where,
    }),
  ]);

  return {
    data: payments,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPaymentById = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    include: {
      payer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: payment.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this payment",
    );
  }

  return payment;
};
const handleBkashCallback = async (
  gatewayPaymentId: string,
  status: string,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      gatewayPaymentId,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const normalizedStatus = status.toLowerCase();

  // Payment cancelled by customer
  if (normalizedStatus === "cancel" || normalizedStatus === "cancelled") {
    if (payment.status === "PAID") {
      return payment;
    }

    return prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "CANCELLED",

        metadata: {
          previousMetadata: payment.metadata,

          callbackStatus: status,
        },
      },
    });
  }

  // bKash reported failure
  if (normalizedStatus === "failure" || normalizedStatus === "failed") {
    if (payment.status === "PAID") {
      return payment;
    }

    return prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",

        metadata: {
          previousMetadata: payment.metadata,

          callbackStatus: status,
        },
      },
    });
  }

  // Successful callback
  if (normalizedStatus === "success") {
    if (payment.status === "PAID") {
      return payment;
    }

    return executePayment(payment.id);
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    `Unknown bKash callback status: ${status}`,
  );
};
export const PaymentService = {
  createPayment,
  executePayment,
  cancelPayment,
  getPayments,
  getPaymentById,
  handleBkashCallback,
};
