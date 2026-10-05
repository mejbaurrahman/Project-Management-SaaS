import jwt from "jsonwebtoken";

import type { JwtPayload, SignOptions } from "jsonwebtoken";

import type { UserRole } from "../../generated/prisma/client.js";

import config from "../config/index.js";

export type TJwtPayload = JwtPayload & {
  userId: string;
  email: string;
  role: UserRole;
};

const createToken = (
  payload: TJwtPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

const verifyToken = (token: string, secret: string): TJwtPayload => {
  return jwt.verify(token, secret) as TJwtPayload;
};

const createAccessToken = (payload: TJwtPayload) => {
  return createToken(
    payload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );
};

const createRefreshToken = (payload: TJwtPayload) => {
  return createToken(
    payload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );
};

const verifyAccessToken = (token: string) => {
  return verifyToken(token, config.jwt_access_secret);
};

const verifyRefreshToken = (token: string) => {
  return verifyToken(token, config.jwt_refresh_secret);
};

export const JwtUtils = {
  createToken,
  verifyToken,

  createAccessToken,
  createRefreshToken,

  verifyAccessToken,
  verifyRefreshToken,
};
