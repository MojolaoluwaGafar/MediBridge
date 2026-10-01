import { z } from "zod";
import { normalizePhone } from "../Utils/phone";

export const registerSchema = z.object({
  UserId: z.string().min(1, "UserId is required"),
  Email: z.string().email("Invalid email address"),
  RegisteredNumber: z
    .string()
    .min(1, "Registered phone number is required")
    .refine((value) => normalizePhone(value) !== null, "Enter a valid phone number, e.g. 0803 123 4567 or +234 803 123 4567"),
  // No role here: a person's role always comes from their account, never the request.
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
  email: z.string().email("Invalid email address").optional(),
  Email: z.string().email("Invalid email address").optional(),
  UserId: z.string().optional(),
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

// passwordToken is the one-time ticket returned when the code was verified.
export const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Privacy Policy",
  }).optional(),
  passwordToken: z.string().min(1, "Please verify your activation code first"),
});

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

export const loginSchema = z.object({
  UserId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;


export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  passwordToken: z.string().min(1, "Please verify your reset code first"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
