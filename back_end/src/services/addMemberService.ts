import {
  findUserById,
  findTeamById,
  findTeamByManagerId,
  getTeamMembership,
  addUserToTeam,
} from "../db/repositories/team_repository";
import { AppError } from "../utils/app-error"; // ADD THIS IMPORT

export async function addMemberService(
  requesterId: number,
  targetUserId: number,
  teamId: number
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
    throw new AppError("Employees are not allowed to add team members", "INSUFFICIENT_PERMISSIONS", 403);
  }

  // admin can add managers or employees, managers can only add employees
  if (requester.role === "manager" && target.role !== "employee") {
    throw new AppError("Managers can only add employees to their team", "MANAGER_CAN_ONLY_ADD_EMPLOYEES", 403);
  }

  if (target.role === "admin") {
    throw new AppError("Admins cannot be added as team members", "CANNOT_ADD_ADMIN", 400);
  }

  const team = await findTeamById(teamId);
  if (!team) {
    throw new AppError("Team does not exist", "TEAM_NOT_FOUND", 404);
  }

  const existing = await getTeamMembership(target.id);
  if (existing) {
    throw new AppError("This user is already assigned to a team", "USER_ALREADY_IN_TEAM", 409);
  }

  if (requester.role === "manager") {
    const managerTeam = await findTeamByManagerId(requester.id);

    if (!managerTeam) {
      throw new AppError("You are not managing any team", "MANAGER_HAS_NO_TEAM", 403);
    }

    if (managerTeam.id !== teamId) {
      throw new AppError("You can only add members to your own team", "WRONG_TEAM", 403);
    }
  }

  await addUserToTeam(target.id, teamId);
}