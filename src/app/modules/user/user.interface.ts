export type TUpdateProfilePayload = {
  name?: string;
  profilePhoto?: string;
};

export type TUpdateRolePayload = {
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

export type TUpdateStatusPayload = {
  status: "ACTIVE" | "BLOCKED";
};
