import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

type AuthRequest = Request & { userId?: string };
const secret = () => process.env.JWT_SECRET ?? "development-only-change-me";
export function signToken(userId: string) {
  return jwt.sign({ userId }, secret(), { expiresIn: "7d" });
}
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token)
    return res
      .status(401)
      .json({
        success: false,
        message: "Sign in is required.",
        errorCode: "UNAUTHORIZED",
      });
  try {
    const payload = jwt.verify(token, secret()) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res
      .status(401)
      .json({
        success: false,
        message: "Your session has expired.",
        errorCode: "INVALID_TOKEN",
      });
  }
}
export type { AuthRequest };
