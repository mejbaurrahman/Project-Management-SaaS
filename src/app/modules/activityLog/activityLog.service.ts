import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type { TActivityLogQuery } from "./activityLog.interface.js";

const allowedSortFields = ["createdAt", "action", "entityType"];

const getAllowedOrganizationIds = async (userId: string) => {
  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,

      role: {
        in: ["OWNER", "MANAGER"],
      },

      organization: {
        deletedAt: null,
      },
    },

    select: {
      organizationId: true,
    },
  });

  return memberships.map((membership) => membership.organizationId);
};

const getActivityLogs = async (userId: string, query: TActivityLogQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const allowedOrganizationIds = await getAllowedOrganizationIds(userId);

  if (
    query.organizationId &&
    !allowedOrganizationIds.includes(query.organizationId)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view activity logs for this organization",
    );
  }

  const sortBy =
    query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const where = {
    organizationId: query.organizationId
      ? query.organizationId
      : {
          in: allowedOrganizationIds,
        },

    ...(query.userId && {
      userId: query.userId,
    }),

    ...(query.taskId && {
      taskId: query.taskId,
    }),

    ...(query.entityType && {
      entityType: query.entityType,
    }),

    ...(query.entityId && {
      entityId: query.entityId,
    }),

    ...(query.action && {
      action: query.action,
    }),

    ...(query.search && {
      OR: [
        {
          action: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },

        {
          entityType: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [activityLogs, total] = await prisma.$transaction([
    prisma.activityLog.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.activityLog.count({
      where,
    }),
  ]);

  return {
    data: activityLogs,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getActivityLogById = async (userId: string, activityLogId: string) => {
  const activityLog = await prisma.activityLog.findUnique({
    where: {
      id: activityLogId,
    },
  });

  if (!activityLog) {
    throw new AppError(httpStatus.NOT_FOUND, "Activity log not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: activityLog.organizationId,

        userId,
      },
    },
  });

  if (
    !membership ||
    (membership.role !== "OWNER" && membership.role !== "MANAGER")
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view this activity log",
    );
  }

  return activityLog;
};

export const ActivityLogService = {
  getActivityLogs,
  getActivityLogById,
};
