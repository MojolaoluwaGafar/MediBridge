import type { NextFunction, Request, Response } from "express";
import { constants as zlib } from "zlib";
import compressionMiddleware from "compression";

// Response compression (Brotli or gzip, whichever the client prefers).
//
// On Render the edge already compresses every response with Brotli, so the
// API service sets ENABLE_COMPRESSION=false in render.yaml: compressing here as
// well would only spend the small instance's CPU, and the edge may pass our
// gzip through instead of its better Brotli. It stays on by default for local
// runs and any host without a compressing proxy in front.
// See docs/architecture/performance.md.
export const compression = () =>
  compressionMiddleware({
    // Below ~1 KB the headers cost more than compression saves.
    threshold: 1024,
    // Level 4 is fast and still close to the best ratio; the default (11) is
    // meant for files compressed once at build time, not live responses.
    brotli: { params: { [zlib.BROTLI_PARAM_QUALITY]: 4 } },
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      // PDFs and images are already compressed; the default filter skips them.
      return compressionMiddleware.filter(req, res);
    },
  });

export const compressionEnabled = () => process.env.ENABLE_COMPRESSION !== "false";

// Lets browsers reuse public, rarely changing lists (departments, the doctor
// directory) for a short while instead of asking again on every page. Express
// also sends an ETag, so after that the browser gets a cheap 304 when nothing
// changed. Never use this on anything personal or behind authMiddleware.
export const publicCache =
  (seconds: number) =>
  (_req: Request, res: Response, next: NextFunction) => {
    res.set("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`);
    next();
  };
