import "dotenv/config";

const required = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const config = {
  node_env: process.env.NODE_ENV ?? "development",

  port: Number(process.env.PORT ?? 5000),

  database_url: required("DATABASE_URL"),

  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,

  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",

  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),

  google_client_id: process.env.GOOGLE_CLIENT_ID ?? "",
  tester_admin_name: process.env.TESTER_ADMIN_NAME!,
  tester_admin_email: process.env.TESTER_ADMIN_EMAIL!,
  tester_admin_password: process.env.TESTER_ADMIN_PASSWORD!,
};

export default config;
