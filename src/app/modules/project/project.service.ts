import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TCreateProjectPayload,
  TUpdateProjectPayload,
  TUpdateProjectStatusPayload,
} from "./project.interface.js";

type TProjectQuery = {
  page?: string;
  limit?: string;
  status?: string;
  organizationId?: string;
  teamId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
};

const allowedSortFields = [
  "createdAt",
  "updatedAt",
  "name",
  "startDate",
  "endDate",
] as const;

const getOrganizationMembership = async (
  userId: string,
  organizationId: string,
) => {
  return prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });
};

const createProject = async (
  userId: string,
  payload: TCreateProjectPayload,
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

  const membership = await getOrganizationMembership(
    userId,
    payload.organizationId,
  );

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (membership.role !== "OWNER" && membership.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create projects",
    );
  }

  const team = await prisma.team.findFirst({
    where: {
      id: payload.teamId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  if (team.organizationId !== payload.organizationId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Team does not belong to this organization",
    );
  }

  if (
    payload.startDate &&
    payload.endDate &&
    new Date(payload.endDate) < new Date(payload.startDate)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date cannot be before start date",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const project = await transactionClient.project.create({
      data: {
        name: payload.name,
        description: payload.description,

        organizationId: payload.organizationId,

        teamId: payload.teamId,

        startDate: payload.startDate ? new Date(payload.startDate) : null,

        endDate: payload.endDate ? new Date(payload.endDate) : null,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "PROJECT_CREATED",

        entityType: "Project",

        entityId: project.id,

        organizationId: payload.organizationId,

        userId,

        metadata: {
          projectName: project.name,

          teamId: project.teamId,
        },
      },
    });

    return project;
  });

  return result;
};

const getProjects = async (userId: string, query: TProjectQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(
    query.sortBy as (typeof allowedSortFields)[number],
  )
    ? query.sortBy!
    : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,

      organization: {
        deletedAt: null,

        members: {
          some: {
            userId,
          },
        },
      },

      ...(query.organizationId && {
        organizationId: query.organizationId,
      }),

      ...(query.teamId && {
        teamId: query.teamId,
      }),

      ...(query.status && {
        status: query.status as
          | "PLANNING"
          | "ACTIVE"
          | "ON_HOLD"
          | "COMPLETED"
          | "ARCHIVED",
      }),

      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search,

              mode: "insensitive",
            },
          },

          {
            description: {
              contains: query.search,

              mode: "insensitive",
            },
          },
        ],
      }),
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },

      team: {
        select: {
          id: true,
          name: true,
        },
      },

      _count: {
        select: {
          sprints: true,
          tasks: true,
        },
      },
    },

    skip,

    take: limit,

    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.project.count({
    where: {
      deletedAt: null,

      organization: {
        deletedAt: null,

        members: {
          some: {
            userId,
          },
        },
      },

      ...(query.organizationId && {
        organizationId: query.organizationId,
      }),

      ...(query.teamId && {
        teamId: query.teamId,
      }),

      ...(query.status && {
        status: query.status as
          | "PLANNING"
          | "ACTIVE"
          | "ON_HOLD"
          | "COMPLETED"
          | "ARCHIVED",
      }),

      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search,

              mode: "insensitive",
            },
          },

          {
            description: {
              contains: query.search,

              mode: "insensitive",
            },
          },
        ],
      }),
    },
  });

  return {
    data: projects,

    meta: {
      page,
      limit,
      total,

      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProjectById = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },

      team: {
        select: {
          id: true,
          name: true,
        },
      },

      sprints: {
        orderBy: {
          createdAt: "desc",
        },
      },

      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const membership = await getOrganizationMembership(
    userId,
    project.organizationId,
  );

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this project",
    );
  }

  return project;
};

const updateProject = async (
  userId: string,
  projectId: string,
  payload: TUpdateProjectPayload,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const membership = await getOrganizationMembership(
    userId,
    project.organizationId,
  );

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (membership.role !== "OWNER" && membership.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this project",
    );
  }

  const finalStartDate = payload.startDate
    ? new Date(payload.startDate)
    : project.startDate;

  const finalEndDate = payload.endDate
    ? new Date(payload.endDate)
    : project.endDate;

  if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date cannot be before start date",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedProject = await transactionClient.project.update({
      where: {
        id: projectId,
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
        action: "PROJECT_UPDATED",

        entityType: "Project",

        entityId: projectId,

        organizationId: project.organizationId,

        userId,

        metadata: {
          updatedFields: Object.keys(payload),
        },
      },
    });

    return updatedProject;
  });

  return result;
};

const updateProjectStatus = async (
  userId: string,
  projectId: string,
  payload: TUpdateProjectStatusPayload,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const membership = await getOrganizationMembership(
    userId,
    project.organizationId,
  );

  if (
    !membership ||
    (membership.role !== "OWNER" && membership.role !== "MANAGER")
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to change project status",
    );
  }

  //   const allowedTransitions: Record<string, string[]> = {
  //     PLANNING: ["ACTIVE", "CANCELLED"],

  //     ACTIVE: ["ON_HOLD", "COMPLETED", "CANCELLED"],

  //     ON_HOLD: ["ACTIVE", "CANCELLED"],

  //     COMPLETED: [],

  //     CANCELLED: [],
  //   };
  const allowedTransitions: Record<string, string[]> = {
    PLANNING: ["ACTIVE", "ARCHIVED"],

    ACTIVE: ["ON_HOLD", "COMPLETED", "ARCHIVED"],

    ON_HOLD: ["ACTIVE", "ARCHIVED"],

    COMPLETED: ["ARCHIVED"],

    ARCHIVED: [],
  };
  if (
    project.status !== payload.status &&
    !allowedTransitions[project.status]?.includes(payload.status)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Project status cannot change from ${project.status} to ${payload.status}`,
    );
  }

  if (project.status === payload.status) {
    return project;
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedProject = await transactionClient.project.update({
      where: {
        id: projectId,
      },

      data: {
        status: payload.status,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "PROJECT_STATUS_CHANGED",

        entityType: "Project",

        entityId: projectId,

        organizationId: project.organizationId,

        userId,

        metadata: {
          previousStatus: project.status,

          newStatus: payload.status,
        },
      },
    });

    return updatedProject;
  });

  return result;
};

const softDeleteProject = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const membership = await getOrganizationMembership(
    userId,
    project.organizationId,
  );

  if (
    !membership ||
    (membership.role !== "OWNER" && membership.role !== "MANAGER")
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this project",
    );
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.project.update({
      where: {
        id: projectId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "PROJECT_DELETED",

        entityType: "Project",

        entityId: projectId,

        organizationId: project.organizationId,

        userId,
      },
    });
  });

  return null;
};

export const ProjectService = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  softDeleteProject,
};
