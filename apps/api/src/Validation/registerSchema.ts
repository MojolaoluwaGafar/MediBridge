import { z } from "zod";

export const registerSchema = z.object({
  UserId: z.string().min(1, "UserId is required"),
  Email: z.string().email("Invalid email address"),
  RegisteredNumber: z.string().min(1, "Registered number is required"),
  role: z.enum(["user", "doctor", "admin"]).default("user"),
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

export const setPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Privacy Policy",
  }).optional(),
  email: z.string().email("Invalid email address").optional(),
  Email: z.string().email("Invalid email address").optional(),
  UserId: z.string().optional(),
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
  email: z.string().email("Invalid email address").optional(),
  Email: z.string().email("Invalid email address").optional(),
  UserId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
