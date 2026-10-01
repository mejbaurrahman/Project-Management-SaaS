export type TCreateSprintPayload = {
  name: string;
  description?: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
};

export type TUpdateSprintPayload = {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export type TUpdateSprintStatusPayload = {
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
};
