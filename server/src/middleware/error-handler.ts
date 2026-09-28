import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";
import { logger } from "../lib/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}.` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }
  if (isDuplicateKeyError(err)) {
    res.status(409).json({ message: "That record already exists." });
    return;
  }
  logger.error("Unhandled error", err);
  res.status(500).json({ message: "Something went wrong on our side." });
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}
