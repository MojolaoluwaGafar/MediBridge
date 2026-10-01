import type { Request, Response } from "express";
import type { ZodError } from "zod";
import { isServiceError } from "../Services/errors";

// The JSON error shape used by the patient-portal routes:
// { success: false, message, errors?: [{ field, message }] }.
// Expected failures (ServiceError) keep their status; anything else is logged
// and becomes a 500 without internal details.
export function sendError(req: Request, res: Response, error: unknown) {
  if (isServiceError(error)) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.field ? { errors: [{ field: error.field, message: error.message }] } : {}),
    });
  }

  req.log.error({ err: error }, "Request failed");
  return res.status(500).json({ success: false, message: "Internal server error" });
}

export function sendValidationError(res: Response, error: ZodError) {
  const errors = error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
  return res.status(400).json({ success: false, message: errors[0]?.message ?? "Validation failed", errors });
}
