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

  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,
  bkash_callback_url: required("BKASH_CALLBACK_URL"),
  bkash_base_url: required("BKASH_BASE_URL"),
  bkash_username: required("BKASH_USERNAME"),

  bkash_password: required("BKASH_PASSWORD"),

  bkash_app_key: required("BKASH_APP_KEY"),

  bkash_app_secret: required("BKASH_APP_SECRET"),
  redis_url: required("REDIS_URL"),
  redis_user: process.env.REDIS_USER ?? "default",

  redis_password: required("REDIS_PASSWORD"),

  redis_host: required("REDIS_HOST"),

  redis_port: Number(process.env.REDIS_PORT),

  otp_expires_in: Number(process.env.OTP_EXPIRES_IN ?? 300),

  smtp_host: required("SMTP_HOST"),

  smtp_port: Number(process.env.SMTP_PORT ?? 587),

  smtp_user: required("SMTP_USER"),

  smtp_password: required("SMTP_PASSWORD"),

  email_sender: required("EMAIL_SENDER"),
};

export default config;
