import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "src/types/user.type";

export function generateToken(payload: { id: string; role: Role }): string {
  if (!payload) {
    throw new Error("No Playload Found!");
  }

  const token = jwt.sign(
    {
      id: payload.id,
      role: payload.role,
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    },
  );

  return token;
}

export function verifyToken(token: string): { id: string; role: Role } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      role: Role;
    };

    return decoded;
  } catch {
    throw new Error("Unauthorized");
  }
}
