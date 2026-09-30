import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

import type {
  TAddTeamMemberPayload,
  TCreateTeamPayload,
  TUpdateTeamPayload,
} from "./team.interface.js";

const createTeam = async (userId: string, payload: TCreateTeamPayload) => {
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

  if (membership.role !== "OWNER" && membership.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create a team",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const team = await transactionClient.team.create({
      data: {
        name: payload.name,
        description: payload.description,
        organizationId: payload.organizationId,
      },
    });

    await transactionClient.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TEAM_CREATED",
        entityType: "Team",
        entityId: team.id,
        organizationId: payload.organizationId,
        userId,
        metadata: {
          teamName: team.name,
        },
      },
    });

    return team;
  });

  return result;
};

const getMyTeams = async (userId: string) => {
  const teams = await prisma.team.findMany({
    where: {
      deletedAt: null,

      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },

      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return teams;
};

const getTeamById = async (userId: string, teamId: string) => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this team",
    );
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },

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
          projects: true,
        },
      },
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  return team;
};

const updateTeam = async (
  userId: string,
  teamId: string,
  payload: TUpdateTeamPayload,
) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  const organizationMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
        userId,
      },
    },
  });

  if (!organizationMembership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (
    organizationMembership.role !== "OWNER" &&
    organizationMembership.role !== "MANAGER"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this team",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedTeam = await transactionClient.team.update({
      where: {
        id: teamId,
      },

      data: payload,
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TEAM_UPDATED",
        entityType: "Team",
        entityId: teamId,
        organizationId: team.organizationId,
        userId,
        metadata: {
          updatedFields: Object.keys(payload),
        },
      },
    });

    return updatedTeam;
  });

  return result;
};

const softDeleteTeam = async (userId: string, teamId: string) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  const organizationMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
        userId,
      },
    },
  });

  if (!organizationMembership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (
    organizationMembership.role !== "OWNER" &&
    organizationMembership.role !== "MANAGER"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this team",
    );
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.team.update({
      where: {
        id: teamId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TEAM_DELETED",
        entityType: "Team",
        entityId: teamId,
        organizationId: team.organizationId,
        userId,
      },
    });
  });

  return null;
};

const addTeamMember = async (
  userId: string,
  teamId: string,
  payload: TAddTeamMemberPayload,
) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  const requesterMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
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
      "You do not have permission to add team members",
    );
  }

  const targetOrganizationMembership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: payload.userId,
        },
      },
    });

  if (!targetOrganizationMembership) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User must be a member of the organization before joining the team",
    );
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      deletedAt: null,
      status: "ACTIVE",
    },
  });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found or inactive");
  }

  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: payload.userId,
      },
    },
  });

  if (existingMembership) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User is already a member of this team",
    );
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const member = await transactionClient.teamMember.create({
      data: {
        teamId,
        userId: payload.userId,
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
        action: "TEAM_MEMBER_ADDED",
        entityType: "TeamMember",
        entityId: member.id,
        organizationId: team.organizationId,
        userId,
        metadata: {
          teamId,
          addedUserId: payload.userId,
        },
      },
    });

    return member;
  });

  return result;
};

const removeTeamMember = async (
  userId: string,
  teamId: string,
  targetUserId: string,
) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  const requesterMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
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
      "You do not have permission to remove team members",
    );
  }

  const targetMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMembership) {
    throw new AppError(httpStatus.NOT_FOUND, "Team member not found");
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    await transactionClient.activityLog.create({
      data: {
        action: "TEAM_MEMBER_REMOVED",
        entityType: "TeamMember",
        entityId: targetMembership.id,
        organizationId: team.organizationId,
        userId,
        metadata: {
          teamId,
          removedUserId: targetUserId,
        },
      },
    });
  });

  return null;
};

export const TeamService = {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  softDeleteTeam,
  addTeamMember,
  removeTeamMember,
};
