"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.setPasswordSchema = exports.verifyCodeSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    UserId: zod_1.z.string().min(1, "UserId is required"),
    Email: zod_1.z.string().email("Invalid email address"),
    RegisteredNumber: zod_1.z.string().min(1, "Registered number is required"),
    role: zod_1.z.enum(["user", "doctor", "admin"]).default("user"),
});
exports.verifyCodeSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .length(6, "Code must be exactly 6 digits")
        .regex(/^\d+$/, "Code must contain only numbers"),
    email: zod_1.z.string().email("Invalid email address").optional(),
    Email: zod_1.z.string().email("Invalid email address").optional(),
    UserId: zod_1.z.string().optional(),
});
exports.setPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(1, "Password is required"),
    terms: zod_1.z.boolean().refine(val => val === true, {
        message: "You must agree to the Terms and Privacy Policy",
    }).optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    Email: zod_1.z.string().email("Invalid email address").optional(),
    UserId: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    UserId: zod_1.z.string().min(1, "User ID is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: zod_1.z.string(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    Email: zod_1.z.string().email("Invalid email address").optional(),
    UserId: zod_1.z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
