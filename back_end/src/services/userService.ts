import { updateUserRole } from "src/db/repositories/user_repository";
import { findUserById } from "src/db/repositories/team_repository";

export const changeUserRoleService = async (adminId: number, newRole: "employee" | "manager" | "admin", userId: number): Promise<void> => { 
    if (adminId === userId) {
        throw new Error("Users cannot change their own role.");
    }

    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === newRole) {
        throw new Error("User already has the specified role");
    }
    await updateUserRole(userId, newRole);
}   