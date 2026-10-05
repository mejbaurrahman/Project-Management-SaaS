export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TVerifyOtpPayload = {
  email: string;
  otp: string;
};

export type TPendingRegistration = {
  name: string;
  email: string;

  // This will store the bcrypt hashed password
  // inside Redis, not the plain password.
  password: string;
};

export type TJwtUserPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TGoogleLoginPayload = {
  idToken: string;
};
