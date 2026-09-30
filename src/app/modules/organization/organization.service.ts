import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TAddOrganizationMemberPayload,
  TCreateOrganizationPayload,
  TUpdateOrganizationMemberRolePayload,
  TUpdateOrganizationPayload,
} from "./organization.interface.js";

const createOrganization = async (
  userId: string,
  payload: TCreateOrganizationPayload,
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      status: "ACTIVE",
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const organization = await transactionClient.organization.create({
      data: {
        name: payload.name,
        description: payload.description,
      },
    });

    await transactionClient.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "OWNER",
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ORGANIZATION_CREATED",
        entityType: "Organization",
        entityId: organization.id,
        organizationId: organization.id,
        userId,
        metadata: {
          organizationName: organization.name,
        },
      },
    });

    return organization;
  });

  return result;
};

const getMyOrganizations = async (userId: string) => {
  const organizations = await prisma.organization.findMany({
    where: {
      deletedAt: null,

      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      members: {
        where: {
          userId,
        },

        select: {
          role: true,
        },
      },

      _count: {
        select: {
          members: true,
          teams: true,
          projects: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return organizations;
};

const getOrganizationById = async (userId: string, organizationId: string) => {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
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

  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: null,
    },

    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              role: true,
              status: true,
            },
          },
        },
      },

      _count: {
        select: {
          teams: true,
          projects: true,
        },
      },
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  return organization;
};

const updateOrganization = async (
  userId: string,
  organizationId: string,
  payload: TUpdateOrganizationPayload,
) => {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
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

  if (membership.role !== "OWNER" && membership.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this organization",
    );
  }

  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: null,
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedOrganization = await transactionClient.organization.update({
      where: {
        id: organizationId,
      },

      data: payload,
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ORGANIZATION_UPDATED",
        entityType: "Organization",
        entityId: organizationId,
        organizationId,
        userId,
        metadata: {
          updatedFields: Object.keys(payload),
        },
      },
    });

    return updatedOrganization;
  });

  return result;
};

const softDeleteOrganization = async (
  userId: string,
  organizationId: string,
) => {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
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

  if (membership.role !== "OWNER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the organization owner can delete the organization",
    );
  }

  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: null,
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.organization.update({
      where: {
        id: organizationId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ORGANIZATION_DELETED",
        entityType: "Organization",
        entityId: organizationId,
        organizationId,
        userId,
      },
    });
  });

  return null;
};

const getOrganizationMembers = async (
  userId: string,
  organizationId: string,
) => {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
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

  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          role: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return members;
};

const addOrganizationMember = async (
  userId: string,
  organizationId: string,
  payload: TAddOrganizationMemberPayload,
) => {
  const requesterMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!requesterMembership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (
    requesterMembership.role !== "OWNER" &&
    requesterMembership.role !== "MANAGER"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to add organization members",
    );
  }

  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: null,
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      deletedAt: null,
      status: "ACTIVE",
    },
  });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: payload.userId,
      },
    },
  });

  if (existingMembership) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User is already a member of this organization",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const member = await transactionClient.organizationMember.create({
      data: {
        organizationId,
        userId: payload.userId,
        role: payload.role ?? "MEMBER",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ORGANIZATION_MEMBER_ADDED",
        entityType: "OrganizationMember",
        entityId: member.id,
        organizationId,
        userId,
        metadata: {
          addedUserId: payload.userId,
          organizationRole: member.role,
        },
      },
    });

    return member;
  });

  return result;
};

const updateOrganizationMemberRole = async (
  userId: string,
  organizationId: string,
  targetUserId: string,
  payload: TUpdateOrganizationMemberRolePayload,
) => {
  const requesterMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!requesterMembership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (requesterMembership.role !== "OWNER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the organization owner can change member roles",
    );
  }

  if (userId === targetUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own organization role",
    );
  }

  const targetMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMembership) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization member not found");
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedMember = await transactionClient.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },

      data: {
        role: payload.role,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ORGANIZATION_MEMBER_ROLE_CHANGED",
        entityType: "OrganizationMember",
        entityId: updatedMember.id,
        organizationId,
        userId,
        metadata: {
          targetUserId,
          previousRole: targetMembership.role,
          newRole: payload.role,
        },
      },
    });

    return updatedMember;
  });

  return result;
};

const removeOrganizationMember = async (
  userId: string,
  organizationId: string,
  targetUserId: string,
) => {
  const requesterMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!requesterMembership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (
    requesterMembership.role !== "OWNER" &&
    requesterMembership.role !== "MANAGER"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to remove members",
    );
  }

  if (userId === targetUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot remove yourself from the organization using this endpoint",
    );
  }

  const targetMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMembership) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization member not found");
  }

  if (targetMembership.role === "OWNER") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "The organization owner cannot be removed",
    );
  }

  if (
    requesterMembership.role === "MANAGER" &&
    targetMembership.role === "MANAGER"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "A manager cannot remove another manager",
    );
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "ORGANIZATION_MEMBER_REMOVED",
        entityType: "OrganizationMember",
        entityId: targetMembership.id,
        organizationId,
        userId,
        metadata: {
          removedUserId: targetUserId,
        },
      },
    });
  });

  return null;
};

export const OrganizationService = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  softDeleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
};
