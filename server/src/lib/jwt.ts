import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../modules/users/user.model";

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded !== "object" || typeof decoded.sub !== "string") {
    throw new Error("Malformed token");
  }
  return { sub: decoded.sub, role: decoded.role as UserRole };
}
