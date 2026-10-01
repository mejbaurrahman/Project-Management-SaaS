import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TCreateTaskPayload,
  TTaskQuery,
  TUpdateTaskPayload,
  TUpdateTaskStatusPayload,
} from "./task.interface.js";

const allowedSortFields = [
  "createdAt",
  "updatedAt",
  "dueDate",
  "title",
  "priority",
  "status",
];

const getProjectAccess = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      organization: {
        deletedAt: null,
      },
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

const validateSprint = async (
  sprintId: string | undefined,
  projectId: string,
) => {
  if (!sprintId) {
    return null;
  }

  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.projectId !== projectId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint does not belong to this project",
    );
  }

  return sprint;
};

const validateAssignee = async (
  assigneeId: string | undefined,
  organizationId: string,
  teamId: string,
) => {
  if (!assigneeId) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: assigneeId,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Assignee not found or inactive");
  }

  const organizationMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: assigneeId,
      },
    },
  });

  if (!organizationMembership) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assignee is not a member of this organization",
    );
  }

  const teamMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: assigneeId,
      },
    },
  });

  if (!teamMembership) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assignee is not a member of the project team",
    );
  }

  return user;
};

const validateParentTask = async (
  parentTaskId: string | undefined,
  projectId: string,
) => {
  if (!parentTaskId) {
    return null;
  }

  const parentTask = await prisma.task.findFirst({
    where: {
      id: parentTaskId,
      deletedAt: null,
    },
  });

  if (!parentTask) {
    throw new AppError(httpStatus.NOT_FOUND, "Parent task not found");
  }

  if (parentTask.projectId !== projectId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Parent task does not belong to this project",
    );
  }

  return parentTask;
};

const validateDueDate = (
  dueDate: Date | null,
  project: {
    startDate: Date | null;
    endDate: Date | null;
  },
  sprint: {
    startDate: Date | null;
    endDate: Date | null;
  } | null,
) => {
  if (!dueDate) {
    return;
  }

  if (project.startDate && dueDate < project.startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Task due date cannot be before project start date",
    );
  }

  if (project.endDate && dueDate > project.endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Task due date cannot be after project end date",
    );
  }

  if (sprint?.endDate && dueDate > sprint.endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Task due date cannot be after sprint end date",
    );
  }
};

const createTask = async (userId: string, payload: TCreateTaskPayload) => {
  const { project, membership } = await getProjectAccess(
    userId,
    payload.projectId,
  );

  if (membership.role === "GUEST") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Guest members cannot create tasks",
    );
  }

  const sprint = await validateSprint(payload.sprintId, project.id);

  await validateAssignee(
    payload.assigneeId,
    project.organizationId,
    project.teamId,
  );

  await validateParentTask(payload.parentTaskId, project.id);

  const dueDate = payload.dueDate ? new Date(payload.dueDate) : null;

  validateDueDate(dueDate, project, sprint);

  const result = await prisma.$transaction(async (transactionClient) => {
    const task = await transactionClient.task.create({
      data: {
        title: payload.title,
        description: payload.description,

        projectId: project.id,

        sprintId: payload.sprintId,
        assigneeId: payload.assigneeId,
        parentTaskId: payload.parentTaskId,

        priority: payload.priority ?? "MEDIUM",

        dueDate,

        createdById: userId,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TASK_CREATED",
        entityType: "Task",
        entityId: task.id,

        organizationId: project.organizationId,

        userId,
        taskId: task.id,

        metadata: {
          projectId: project.id,
          sprintId: payload.sprintId ?? null,
          assigneeId: payload.assigneeId ?? null,
          taskTitle: task.title,
        },
      },
    });

    return task;
  });

  return result;
};

const getTasks = async (userId: string, query: TTaskQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const sortBy =
    query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const where = {
    deletedAt: null,

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

    ...(query.sprintId && {
      sprintId: query.sprintId,
    }),

    ...(query.assigneeId && {
      assigneeId: query.assigneeId,
    }),

    ...(query.status && {
      status: query.status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
    }),

    ...(query.priority && {
      priority: query.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    }),

    ...(query.search && {
      OR: [
        {
          title: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,

      skip,
      take: limit,

      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
            teamId: true,
          },
        },

        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true,
          },
        },
      },

      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.task.count({
      where,
    }),
  ]);

  return {
    data: tasks,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTaskById = async (userId: string, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
    },

    include: {
      project: true,

      sprint: true,

      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      parentTask: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },

      subtasks: {
        where: {
          deletedAt: null,
        },

        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          assigneeId: true,
          dueDate: true,
        },
      },

      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },

      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!task || task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: task.project.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this task",
    );
  }

  return task;
};

const updateTask = async (
  userId: string,
  taskId: string,
  payload: TUpdateTaskPayload,
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
    },

    include: {
      project: true,
    },
  });

  if (!task || task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: task.project.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this task",
    );
  }

  const canUpdate =
    membership.role === "OWNER" ||
    membership.role === "MANAGER" ||
    task.createdById === userId;

  if (!canUpdate) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this task",
    );
  }

  const sprint = payload.sprintId
    ? await validateSprint(payload.sprintId, task.projectId)
    : task.sprintId
      ? await prisma.sprint.findUnique({
          where: {
            id: task.sprintId,
          },
        })
      : null;

  await validateAssignee(
    payload.assigneeId,
    task.project.organizationId,
    task.project.teamId,
  );

  const finalDueDate =
    payload.dueDate !== undefined ? new Date(payload.dueDate) : task.dueDate;

  validateDueDate(finalDueDate, task.project, sprint);

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedTask = await transactionClient.task.update({
      where: {
        id: taskId,
      },

      data: {
        ...(payload.title !== undefined && {
          title: payload.title,
        }),

        ...(payload.description !== undefined && {
          description: payload.description,
        }),

        ...(payload.sprintId !== undefined && {
          sprintId: payload.sprintId,
        }),

        ...(payload.assigneeId !== undefined && {
          assigneeId: payload.assigneeId,
        }),

        ...(payload.priority !== undefined && {
          priority: payload.priority,
        }),

        ...(payload.dueDate !== undefined && {
          dueDate: new Date(payload.dueDate),
        }),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TASK_UPDATED",
        entityType: "Task",
        entityId: taskId,

        organizationId: task.project.organizationId,

        userId,
        taskId,

        metadata: {
          updatedFields: Object.keys(payload),
        },
      },
    });

    return updatedTask;
  });

  return result;
};

const updateTaskStatus = async (
  userId: string,
  taskId: string,
  payload: TUpdateTaskStatusPayload,
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
    },

    include: {
      project: true,
    },
  });

  if (!task || task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: task.project.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this task",
    );
  }

  const canChangeStatus =
    membership.role === "OWNER" ||
    membership.role === "MANAGER" ||
    task.createdById === userId ||
    task.assigneeId === userId;

  if (!canChangeStatus) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to change this task status",
    );
  }

  const allowedTransitions: Record<string, string[]> = {
    TODO: ["IN_PROGRESS"],

    IN_PROGRESS: ["TODO", "IN_REVIEW"],

    IN_REVIEW: ["IN_PROGRESS", "DONE"],

    DONE: ["IN_REVIEW"],
  };

  if (
    task.status !== payload.status &&
    !allowedTransitions[task.status]?.includes(payload.status)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Task status cannot change from ${task.status} to ${payload.status}`,
    );
  }

  if (task.status === payload.status) {
    return task;
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedTask = await transactionClient.task.update({
      where: {
        id: taskId,
      },

      data: {
        status: payload.status,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TASK_STATUS_CHANGED",
        entityType: "Task",
        entityId: taskId,

        organizationId: task.project.organizationId,

        userId,
        taskId,

        metadata: {
          previousStatus: task.status,

          newStatus: payload.status,
        },
      },
    });

    return updatedTask;
  });

  return result;
};

const softDeleteTask = async (userId: string, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
    },

    include: {
      project: true,
    },
  });

  if (!task || task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: task.project.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this task",
    );
  }

  const canDelete =
    membership.role === "OWNER" ||
    membership.role === "MANAGER" ||
    task.createdById === userId;

  if (!canDelete) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this task",
    );
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.task.update({
      where: {
        id: taskId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TASK_DELETED",
        entityType: "Task",
        entityId: taskId,

        organizationId: task.project.organizationId,

        userId,
        taskId,

        metadata: {
          taskTitle: task.title,
        },
      },
    });
  });

  return null;
};

export const TaskService = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  softDeleteTask,
};
