import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TAttachmentQuery,
  TCreateAttachmentPayload,
} from "./attachment.interface.js";

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

const createAttachment = async (
  userId: string,
  payload: TCreateAttachmentPayload,
) => {
  const { task, membership } = await getTaskAccess(userId, payload.taskId);

  if (membership.role === "GUEST") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Guest members cannot add attachments",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const attachment = await transactionClient.attachment.create({
      data: {
        fileName: payload.fileName,
        fileUrl: payload.fileUrl,
        publicId: payload.publicId,
        taskId: payload.taskId,
        uploadedById: userId,
      },

      include: {
        uploadedBy: {
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
        action: "ATTACHMENT_CREATED",
        entityType: "Attachment",
        entityId: attachment.id,

        organizationId: task.project.organizationId,

        userId,
        taskId: task.id,

        metadata: {
          attachmentId: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
        },
      },
    });

    return attachment;
  });

  return result;
};

const getAttachments = async (userId: string, query: TAttachmentQuery) => {
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

  const [attachments, total] = await prisma.$transaction([
    prisma.attachment.findMany({
      where,

      skip,
      take: limit,

      include: {
        uploadedBy: {
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

    prisma.attachment.count({
      where,
    }),
  ]);

  return {
    data: attachments,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAttachmentById = async (userId: string, attachmentId: string) => {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      deletedAt: null,
    },

    include: {
      uploadedBy: {
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

  if (
    !attachment ||
    attachment.task.deletedAt ||
    attachment.task.project.deletedAt
  ) {
    throw new AppError(httpStatus.NOT_FOUND, "Attachment not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: attachment.task.project.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this attachment",
    );
  }

  return attachment;
};

const softDeleteAttachment = async (userId: string, attachmentId: string) => {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
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

  if (
    !attachment ||
    attachment.task.deletedAt ||
    attachment.task.project.deletedAt
  ) {
    throw new AppError(httpStatus.NOT_FOUND, "Attachment not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: attachment.task.project.organizationId,

        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this attachment",
    );
  }

  const canDelete =
    attachment.uploadedById === userId ||
    membership.role === "OWNER" ||
    membership.role === "MANAGER";

  if (!canDelete) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this attachment",
    );
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.attachment.update({
      where: {
        id: attachmentId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ATTACHMENT_DELETED",
        entityType: "Attachment",
        entityId: attachmentId,

        organizationId: attachment.task.project.organizationId,

        userId,
        taskId: attachment.taskId,

        metadata: {
          attachmentId,
          fileName: attachment.fileName,
          publicId: attachment.publicId ?? null,
        },
      },
    });
  });

  return null;
};

export const AttachmentService = {
  createAttachment,
  getAttachments,
  getAttachmentById,
  softDeleteAttachment,
};
