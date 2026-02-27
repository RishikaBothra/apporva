import {
  findUserById,
  findTeamByManagerId,
  isUserInTeam,
  removeUserFromTeam,
  updateTeamManager,
  getTeamMembership, //  needed to check if manager is in team_member
} from "../db/repositories/team_repository";
import { AppError } from "../utils/app-error"; 

export async function removeMemberService(
  requesterId: number,
  targetUserId: number
): Promise<void> {
  const requester = await findUserById(requesterId);
  const target = await findUserById(targetUserId);

  if (!requester) {
    throw new AppError("Requester account not found", "REQUESTER_NOT_FOUND", 404);
  }

  if (!target) {
    throw new AppError("Target user not found", "TARGET_USER_NOT_FOUND", 404);
  }

  if (requester.role === "employee") {
    throw new AppError("Employees are not allowed to remove team members", "INSUFFICIENT_PERMISSIONS", 403);
  }

  if (requester.id === target.id) {
    throw new AppError("You cannot remove yourself from a team", "CANNOT_REMOVE_SELF", 400);
  }

  if (target.role === "admin") {
    throw new AppError("Admins cannot be removed from teams", "CANNOT_REMOVE_ADMIN", 403);
  }

  // manager trying to remove someone
  if (requester.role === "manager") {
    if (target.role !== "employee") {
      throw new AppError("Managers can only remove employees", "MANAGER_CAN_ONLY_REMOVE_EMPLOYEES", 403);
    }

    const managerTeam = await findTeamByManagerId(requester.id);
    if (!managerTeam) {
      throw new AppError("You are not managing any team", "MANAGER_HAS_NO_TEAM", 403);
    }

    const belongsToTeam = await isUserInTeam(target.id, managerTeam.id);
    if (!belongsToTeam) {
      throw new AppError("This employee is not in your team", "USER_NOT_IN_YOUR_TEAM", 404);
    }

    await removeUserFromTeam(target.id);
    return;
  }

  // admin removing a manager — unassign them from team manager slot + remove from team_member
  if (target.role === "manager") {
    const managedTeam = await findTeamByManagerId(target.id);

    if (managedTeam) {
      await updateTeamManager(managedTeam.id, null); 
    }

    // also remove from team_member table in case they were listed there
    const membership = await getTeamMembership(target.id);
    if (membership) {
      await removeUserFromTeam(target.id);
    }

    return;
  }

  // admin removing an employee — check they're actually in a team first
  const membership = await getTeamMembership(target.id);
  if (!membership) {
    throw new AppError("This user is not in any team", "USER_NOT_IN_ANY_TEAM", 404);
  }

  await removeUserFromTeam(target.id);
}