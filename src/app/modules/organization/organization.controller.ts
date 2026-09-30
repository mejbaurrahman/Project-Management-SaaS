import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

import { OrganizationService } from "./organization.service.js";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.createOrganization(
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const getMyOrganizations = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.getMyOrganizations(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organizations retrieved successfully",
    data: result,
  });
});

const getOrganizationById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.getOrganizationById(
    req.user!.userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization retrieved successfully",
    data: result,
  });
});

const updateOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.updateOrganization(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization updated successfully",
    data: result,
  });
});

const softDeleteOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationService.softDeleteOrganization(
      req.user!.userId,
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization deleted successfully",
      data: result,
    });
  },
);

const getOrganizationMembers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationService.getOrganizationMembers(
      req.user!.userId,
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization members retrieved successfully",
      data: result,
    });
  },
);

const addOrganizationMember = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationService.addOrganizationMember(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Organization member added successfully",
      data: result,
    });
  },
);

const updateOrganizationMemberRole = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationService.updateOrganizationMemberRole(
      req.user!.userId,
      req.params.id as string,
      req.params.userId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization member role updated successfully",
      data: result,
    });
  },
);

const removeOrganizationMember = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationService.removeOrganizationMember(
      req.user!.userId,
      req.params.id as string,
      req.params.userId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization member removed successfully",
      data: result,
    });
  },
);

export const OrganizationController = {
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
