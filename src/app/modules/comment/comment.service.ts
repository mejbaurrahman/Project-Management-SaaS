import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TCommentQuery,
  TCreateCommentPayload,
  TUpdateCommentPayload,
} from "./comment.interface.js";

const getTaskAccess = async (userId: string, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
      project: {
        deletedAt: null,
      },
    },

    include: {
      project: true,
    },
  });

  if (!task) {
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

  return {
    task,
    membership,
  };
};

const createComment = async (
  userId: string,
  payload: TCreateCommentPayload,
) => {
  const { task, membership } = await getTaskAccess(userId, payload.taskId);

  if (membership.role === "GUEST") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Guest members cannot add comments",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const comment = await transactionClient.comment.create({
      data: {
        content: payload.content,
        taskId: payload.taskId,
        userId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "COMMENT_CREATED",
        entityType: "Comment",
        entityId: comment.id,

        organizationId: task.project.organizationId,

        userId,
        taskId: task.id,

        metadata: {
          commentId: comment.id,
        },
      },
    });

    return comment;
  });

  return result;
};

const getComments = async (userId: string, query: TCommentQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,

    task: {
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
    },

    ...(query.taskId && {
      taskId: query.taskId,
    }),
  };

  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where,

      skip,
      take: limit,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },

        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.comment.count({
      where,
    }),
  ]);

  return {
    data: comments,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCommentById = async (userId: string, commentId: string) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },

      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment || comment.task.deletedAt || comment.task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: comment.task.project.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this comment",
    );
  }

  return comment;
};

const updateComment = async (
  userId: string,
  commentId: string,
  payload: TUpdateCommentPayload,
) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
    },

    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment || comment.task.deletedAt || comment.task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: comment.task.project.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this comment",
    );
  }

  if (comment.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own comment",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedComment = await transactionClient.comment.update({
      where: {
        id: commentId,
      },

      data: {
        content: payload.content,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "COMMENT_UPDATED",
        entityType: "Comment",
        entityId: commentId,

        organizationId: comment.task.project.organizationId,

        userId,
        taskId: comment.taskId,

        metadata: {
          commentId,
        },
      },
    });

    return updatedComment;
  });

  return result;
};

const softDeleteComment = async (userId: string, commentId: string) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
    },

    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment || comment.task.deletedAt || comment.task.project.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: comment.task.project.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this comment",
    );
  }

  const canDelete =
    comment.userId === userId ||
    membership.role === "OWNER" ||
    membership.role === "MANAGER";

  if (!canDelete) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this comment",
    );
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.comment.update({
      where: {
        id: commentId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "COMMENT_DELETED",
        entityType: "Comment",
        entityId: commentId,

        organizationId: comment.task.project.organizationId,

        userId,
        taskId: comment.taskId,

        metadata: {
          commentId,
        },
      },
    });
  });

  return null;
};

export const CommentService = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  softDeleteComment,
};
