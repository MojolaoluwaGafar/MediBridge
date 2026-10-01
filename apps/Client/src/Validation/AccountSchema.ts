import { z } from "zod";

// Same rules as apps/Server/src/Validation/registerSchema.ts, checked here
// first so mistakes show before a request is sent.

export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,19}$/, "Enter a valid phone number"),
});

export type PhoneInput = z.infer<typeof phoneSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
