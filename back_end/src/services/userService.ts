import { updateUserRole } from "src/db/repositories/user_repository";
import { findUserById } from "src/db/repositories/team_repository";

export const changeUserRoleService = async (adminId: number, newRole: string, userId: number): Promise<void> => { 
    if (newRole !== "employee" && newRole !== "manager" && newRole !== "admin") {
        throw new Error("Invalid role. Role must be either 'employee', 'manager', or 'admin'.");
    }
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