import { updateUserRole } from "src/db/repositories/user_repository";
import { findUserById } from "src/db/repositories/team_repository";
import { env } from "src/config/env";
import { AppError } from "../utils/app-error";
import { updateUserById } from "src/db/repositories/user_repository";
import bcrypt from "bcrypt";

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

export async function updateProfile(
  userId: number,
  data: {
    fullName?: string;
    email?: string;
    password?: string;
  }
): Promise<boolean> {
  const updateData: {
    fullName?: string;
    email?: string;
    password?: string;
  } = {};

  if (data.fullName) {
    updateData.fullName = data.fullName;
  }

  if (data.email) {
    updateData.email = data.email;
  }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    updateData.password = hashedPassword;
  }

  if (data.email && !data.email.endsWith("@projectapprova.com")) {
    throw new AppError("Email must use the @projectapprova.com domain", "INVALID_EMAIL_DOMAIN", 400);
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No fields provided for update", "NO_UPDATE_FIELDS", 400);
  }

  return await updateUserById(userId, updateData);
}
