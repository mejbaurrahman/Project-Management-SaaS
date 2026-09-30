export type TCreateTeamPayload = {
  name: string;
  description?: string;
  organizationId: string;
};

export type TUpdateTeamPayload = {
  name?: string;
  description?: string;
};

export type TAddTeamMemberPayload = {
  userId: string;
};
