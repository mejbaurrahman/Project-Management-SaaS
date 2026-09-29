export type TCreateOrganizationPayload = {
  name: string;
  description?: string;
};

export type TUpdateOrganizationPayload = {
  name?: string;
  description?: string;
};

export type TAddOrganizationMemberPayload = {
  userId: string;
  role?: "OWNER" | "MANAGER" | "MEMBER" | "GUEST";
};

export type TUpdateOrganizationMemberRolePayload = {
  role: "OWNER" | "MANAGER" | "MEMBER" | "GUEST";
};
