import { z } from "zod";

// Kept apart from ActivationSchema.ts, which loads a phone-number library
// (~120 KB) the login page doesn't need. Login is in the main bundle.
export const loginSchema = z.object({
    UserId : z.string().min(1, "User ID is required"),
    password : z.string().min(1, "Password is required")
})

export type LoginInput = z.infer<typeof loginSchema>;
