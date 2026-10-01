import { Request, Response, NextFunction } from "express";
import { rateLimit, ipKeyGenerator, type Options } from "express-rate-limit";
import { logger } from "../Utils/logger";

const MINUTE = 60 * 1000;

// Shared settings for every limiter. Counts live in the library's in-memory
// store, which is correct for a single server instance. Before running more
// than one instance, pass a shared `store` (e.g. rate-limit-redis) here.
const baseOptions: Partial<Options> = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Route the library's own configuration warnings (e.g. a wrong
  // `trust proxy` setting) into our logger instead of the console.
  logger: {
    warn: (err, message) => logger.warn({ err }, message ?? "express-rate-limit warning"),
    error: (err, message) => logger.error({ err }, message ?? "express-rate-limit error"),
  },
  handler: (req: Request, res: Response, _next: NextFunction, options: Options) => {
    req.log.warn({ path: req.originalUrl, limit: options.limit }, "Rate limit exceeded");
    res.status(options.statusCode).json({ success: false, message: options.message });
  },
};

// General API traffic: 100 requests per minute per IP.
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: MINUTE,
  limit: 100,
  message: "Too many requests. Please try again later.",
});

// Activation, login and password-reset routes: 20 requests per 15 minutes per
// IP. This mainly slows down guessing of the 6-digit email codes; guessing a
// particular account's password is handled by loginAccountLimiter below.
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * MINUTE,
  limit: 20,
  message: "Too many attempts. Please wait a few minutes and try again.",
});

// Failed logins per account: 5 failures per 15 minutes for the same User ID,
// no matter which IPs they come from. Successful logins are not counted.
// Password reset stays available, so a locked-out patient can still recover.
export const loginAccountLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * MINUTE,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    const userId = typeof req.body?.UserId === "string" ? req.body.UserId.trim().toUpperCase() : "";
    return userId ? `login:${userId}` : `login-ip:${ipKeyGenerator(req.ip ?? "")}`;
  },
  message: "Too many failed login attempts for this account. Please wait 15 minutes or reset your password.",
});

// Requests that send a code by email and SMS (activation and password reset,
// including "Resend code"): 5 per 15 minutes per account. SMS is paid per
// message, so this caps the cost of one account being spammed from many IPs.
export const codeRequestAccountLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * MINUTE,
  limit: 5,
  keyGenerator: (req: Request) => {
    const account = req.body?.UserId ?? req.body?.email ?? req.body?.Email;
    return typeof account === "string" && account.trim()
      ? `code:${account.trim().toLowerCase()}`
      : `code-ip:${ipKeyGenerator(req.ip ?? "")}`;
  },
  message: "Too many codes requested for this account. Please wait 15 minutes and try again.",
});

// AI chat costs money per request: 10 messages per minute per IP.
export const aiLimiter = rateLimit({
  ...baseOptions,
  windowMs: MINUTE,
  limit: 10,
  message: "You're sending messages too quickly. Please wait a moment.",
});
