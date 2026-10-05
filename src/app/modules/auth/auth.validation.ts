import { z } from "zod";

const registerValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z.string().email("Valid email is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

const loginValidationSchema = z.object({
  email: z.string().email("Valid email is required"),

  password: z.string().min(1, "Password is required"),
});

const verifyOtpValidationSchema = z.object({
  email: z.string().email("Valid email is required"),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

const refreshTokenValidationSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const googleLoginValidationSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  verifyOtpValidationSchema,
  refreshTokenValidationSchema,
  googleLoginValidationSchema,
};
