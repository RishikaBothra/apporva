import { updateUserRole } from "src/db/repositories/user_repository";
import { findUserById } from "src/db/repositories/team_repository";
import { env } from "src/config/env";

export const changeUserRoleService = async (
  adminId: number,
  newRole: "employee" | "manager" | "admin",
  userId: number,
  platformSecret?: string,
): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isAdminRoleUpdate = user.role === "admin" || newRole === "admin";
  if (isAdminRoleUpdate && platformSecret !== env.PLATFORM_SECRET) {
    throw new Error("Invalid platform secret");
  }

  if (adminId === userId && !isAdminRoleUpdate) {
    throw new Error("Users cannot change their own role.");
  }

  if (user.role === newRole) {
    throw new Error("User already has the specified role");
  }

  await updateUserRole(userId, newRole);
};
