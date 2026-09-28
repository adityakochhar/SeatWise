import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";
import { verifyToken, type TokenPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    next(ApiError.unauthorized());
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Your session is invalid or has expired."));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin") {
    next(ApiError.forbidden("Admin access is required."));
    return;
  }
  next();
}
