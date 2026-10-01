import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TCreateSprintPayload,
  TUpdateSprintPayload,
  TUpdateSprintStatusPayload,
} from "./sprint.interface.js";

type TSprintQuery = {
  projectId?: string;
  status?: string;
};

const getProjectWithAccess = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this project",
    );
  }

  return {
    project,
    membership,
  };
};

const createSprint = async (userId: string, payload: TCreateSprintPayload) => {
  const { project, membership } = await getProjectWithAccess(
    userId,
    payload.projectId,
  );

  if (membership.role !== "OWNER" && membership.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create a sprint",
    );
  }

  const startDate = payload.startDate ? new Date(payload.startDate) : null;

  const endDate = payload.endDate ? new Date(payload.endDate) : null;

  if (startDate && endDate && endDate < startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date cannot be before start date",
    );
  }

  if (project.startDate && startDate && startDate < project.startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint start date cannot be before project start date",
    );
  }

  if (project.endDate && endDate && endDate > project.endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint end date cannot be after project end date",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const sprint = await transactionClient.sprint.create({
      data: {
        name: payload.name,
        description: payload.description,
        projectId: payload.projectId,
        startDate,
        endDate,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "SPRINT_CREATED",
        entityType: "Sprint",
        entityId: sprint.id,
        organizationId: project.organizationId,
        userId,

        metadata: {
          projectId: project.id,
          sprintName: sprint.name,
        },
      },
    });

    return sprint;
  });

  return result;
};

const getSprints = async (userId: string, query: TSprintQuery) => {
  const sprints = await prisma.sprint.findMany({
    where: {
      project: {
        deletedAt: null,

        organization: {
          deletedAt: null,

          members: {
            some: {
              userId,
            },
          },
        },
      },

      ...(query.projectId && {
        projectId: query.projectId,
      }),

      ...(query.status && {
        status: query.status as
          | "PLANNED"
          | "ACTIVE"
          | "COMPLETED"
          | "CANCELLED",
      }),
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
          organizationId: true,
          teamId: true,
        },
      },

      _count: {
        select: {
          tasks: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return sprints;
};

const getSprintById = async (userId: string, sprintId: string) => {
  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
          organizationId: true,
          teamId: true,
          deletedAt: true,
        },
      },

      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!sprint || sprint.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: sprint.project.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this sprint",
    );
  }

  return sprint;
};

const updateSprint = async (
  userId: string,
  sprintId: string,
  payload: TUpdateSprintPayload,
) => {
  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },

    include: {
      project: true,
    },
  });

  if (!sprint || sprint.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: sprint.project.organizationId,

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
      "You do not have permission to update this sprint",
    );
  }

  const finalStartDate = payload.startDate
    ? new Date(payload.startDate)
    : sprint.startDate;

  const finalEndDate = payload.endDate
    ? new Date(payload.endDate)
    : sprint.endDate;

  if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date cannot be before start date",
    );
  }

  if (
    sprint.project.startDate &&
    finalStartDate &&
    finalStartDate < sprint.project.startDate
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint start date cannot be before project start date",
    );
  }

  if (
    sprint.project.endDate &&
    finalEndDate &&
    finalEndDate > sprint.project.endDate
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint end date cannot be after project end date",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedSprint = await transactionClient.sprint.update({
      where: {
        id: sprintId,
      },

      data: {
        ...(payload.name !== undefined && {
          name: payload.name,
        }),

        ...(payload.description !== undefined && {
          description: payload.description,
        }),

        ...(payload.startDate !== undefined && {
          startDate: new Date(payload.startDate),
        }),

        ...(payload.endDate !== undefined && {
          endDate: new Date(payload.endDate),
        }),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "SPRINT_UPDATED",
        entityType: "Sprint",
        entityId: sprintId,

        organizationId: sprint.project.organizationId,

        userId,

        metadata: {
          projectId: sprint.projectId,

          updatedFields: Object.keys(payload),
        },
      },
    });

    return updatedSprint;
  });

  return result;
};

const updateSprintStatus = async (
  userId: string,
  sprintId: string,
  payload: TUpdateSprintStatusPayload,
) => {
  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },

    include: {
      project: true,
    },
  });

  if (!sprint || sprint.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: sprint.project.organizationId,

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
      "You do not have permission to change sprint status",
    );
  }

  const allowedTransitions: Record<string, string[]> = {
    PLANNED: ["ACTIVE", "CANCELLED"],

    ACTIVE: ["COMPLETED", "CANCELLED"],

    COMPLETED: [],

    CANCELLED: [],
  };

  if (
    sprint.status !== payload.status &&
    !allowedTransitions[sprint.status]?.includes(payload.status)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Sprint status cannot change from ${sprint.status} to ${payload.status}`,
    );
  }

  if (sprint.status === payload.status) {
    return sprint;
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedSprint = await transactionClient.sprint.update({
      where: {
        id: sprintId,
      },

      data: {
        status: payload.status,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "SPRINT_STATUS_CHANGED",

        entityType: "Sprint",

        entityId: sprintId,

        organizationId: sprint.project.organizationId,

        userId,

        metadata: {
          projectId: sprint.projectId,

          previousStatus: sprint.status,

          newStatus: payload.status,
        },
      },
    });

    return updatedSprint;
  });

  return result;
};

export const SprintService = {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  updateSprintStatus,
};
