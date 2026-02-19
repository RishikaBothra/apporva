import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt-utils";
import type { Role } from "../types/user.type";

const roleLevel: Record<Role, number> = {
  employee: 0,
  manager: 1,
  admin: 2,
};

/**
 * Auth middleware with optional role requirement.
 *
 * Usage:
 * app.get("/admin", authMiddleware(role.admin), handler);
 * app.get("/manager", authMiddleware(role.manager), handler);
 * app.get("/protected", authMiddleware(), handler);
 *
 * Responses:
 * 401 if unauthenticated.
 * 403 if authenticated but role is insufficient.
 */

export function authMiddleware(role?: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        role: decoded.role as Role,
      };

      if (role && roleLevel[req.user.role] < roleLevel[role]) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}