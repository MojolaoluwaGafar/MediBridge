import pino from "pino";
import pinoHttp from "pino-http";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  // Tokens must never reach the logs. Request bodies are not logged at all,
  // since they can carry passwords and patient health information. Axios
  // errors carry the outgoing request (with API keys), so drop those objects.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.authtoken",
      "req.headers.cookie",
      "err.config",
      "err.request",
      "err.response.config",
      "err.response.request",
    ],
    censor: "[REDACTED]",
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" },
      },
});

// Express strips the mount path from req.url inside app.use("/prefix", ...),
// so prefer originalUrl to log the path the client actually requested.
const fullUrl = (req: { url?: string }) => (req as { originalUrl?: string }).originalUrl ?? req.url;

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.raw?.originalUrl ?? req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res, responseTime) =>
    `${req.method} ${fullUrl(req)} ${res.statusCode} ${Math.round(responseTime)}ms`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${fullUrl(req)} ${res.statusCode} ${err.message}`,
});
