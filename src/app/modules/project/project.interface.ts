export type TCreateProjectPayload = {
  name: string;
  description?: string;
  organizationId: string;
  teamId: string;
  startDate?: string;
  endDate?: string;
};

export type TUpdateProjectPayload = {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export type TUpdateProjectStatusPayload = {
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
};
