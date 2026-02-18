import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt-utils";
import type { Role } from "../types/role.type";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
 const token = req.cookies.auth_token;
 console.log("Received token:", token); // Debugging log
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role as Role,
    };

    next();

  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(...roles:Role[]){
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}