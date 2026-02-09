import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt-utils";
import type { Role } from "../types/user.type";
import { request } from "node:http";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.user_id,
      role: decoded.role as Role,
    };

    next();
    
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}