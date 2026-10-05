export type TActivityLogQuery = {
  page?: string;
  limit?: string;

  organizationId?: string;
  userId?: string;
  taskId?: string;

  entityType?: string;
  entityId?: string;
  action?: string;

  search?: string;

  sortBy?: string;
  sortOrder?: string;
};
