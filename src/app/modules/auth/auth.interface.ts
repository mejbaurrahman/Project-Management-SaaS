export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TJwtUserPayload = {
  userId: string;
  email: string;
  role: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TGoogleLoginPayload = {
  idToken: string;
};
