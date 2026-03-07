import {
  createTeam,
  findTeamByManagerId,
  findTeamByName,
  findUserById,
  deleteTeam,
  findTeamById,
  getTeamMembership,
  isUserInTeam,
  removeUserFromTeam,
} from "../db/repositories/team_repository";
import { CreateTeamInput } from "src/types/team.type";
import { createAppError } from "src/utils/app-error";
import { db } from "src/db/db.client";
import { team as teamSchema, teamMember as teamMemberSchema } from "../db/schema";
import { eq } from "drizzle-orm";
import { findUsersByTeamId } from "../db/repositories/team_repository";
import { role } from "../types/user.type";
import { findTeamByUserId } from "../db/repositories/team_repository";
import { findAllTeams } from "../db/repositories/team_repository";


export async function createTeamService(input: CreateTeamInput) {
  const { name, managerId, userId } = input;

  const existingTeam = await findTeamByName(name);

  if (existingTeam) {
    throw new Error("Team name already exists");
  }

  const isManagerValid = await findUserById(managerId);
  if (!isManagerValid) {
    throw new Error("Manager does not exist");
  }
  if (isManagerValid.role !== "manager") {
    throw new Error("User is not a manager");
  }

  const existingManager = await findTeamByManagerId(managerId);

  if (existingManager) {
    throw new Error("Manager is already assigned to another team");
  }

  await createTeam({ name, managerId, userId });

  return;
}

export async function deleteTeamById(id: number): Promise<void> {
  const deletedCount = await deleteTeam(id);
  if (deletedCount === 0) {
    throw new Error("Team not found");
  }
}

export async function addMemberService(
  requesterId: number,
  targetUserId: number,
  teamId: number
): Promise<void> {
  const requester = await findUserById(requesterId);
  const target = await findUserById(targetUserId);

  if (!requester) {
    throw createAppError("Requester account not found", "REQUESTER_NOT_FOUND", 404);
  }

  if (!target) {
    throw createAppError("Target user not found", "TARGET_USER_NOT_FOUND", 404);
  }

  if (requester.role === "employee") {
    throw createAppError("Employees are not allowed to add team members", "INSUFFICIENT_PERMISSIONS", 403);
  }

  if (requester.role === "manager" && target.role !== "employee") {
    throw createAppError("Managers can only add employees to their team", "MANAGER_CAN_ONLY_ADD_EMPLOYEES", 403);
  }

  if (target.role === "admin") {
    throw createAppError("Admins cannot be added as team members", "CANNOT_ADD_ADMIN", 400);
  }

  const team = await findTeamById(teamId);
  if (!team) {
    throw createAppError("Team does not exist", "TEAM_NOT_FOUND", 404);
  }

  if (target.role === "manager" && team.managerId) {
    throw createAppError("This team already has a manager", "TEAM_ALREADY_HAS_MANAGER", 409);
  }

  const existing = await getTeamMembership(target.id);
  if (existing) {
    throw createAppError("This user is already assigned to a team", "USER_ALREADY_IN_TEAM", 409);
  }

  if (requester.role === "manager") {
    const managerTeam = await findTeamByManagerId(requester.id);

    if (!managerTeam) {
      throw createAppError("You are not managing any team", "MANAGER_HAS_NO_TEAM", 403);
    }

    if (managerTeam.id !== teamId) {
      throw createAppError("You can only add members to your own team", "WRONG_TEAM", 403);
    }
  }

  // wrap the actual DB writes in a transaction
  await db().transaction(async (tx) => {
    await tx.insert(teamMemberSchema).values({ userId: target.id, teamId });

    if (target.role === "manager") {
      await tx.update(teamSchema).set({ managerId: target.id }).where(eq(teamSchema.id, teamId));
    }
  });
}

export async function removeMemberService(
  requesterId: number,
  targetUserId: number
): Promise<void> {
  const requester = await findUserById(requesterId);
  const target = await findUserById(targetUserId);

  if (!requester) {
    throw createAppError("Requester not found", "REQUESTER_NOT_FOUND", 404);
  }

  if (!target) {
    throw createAppError("Target user not found", "TARGET_USER_NOT_FOUND", 404);
  }

  if (requester.role === "employee") {
    throw createAppError("Employees cannot remove team members", "INSUFFICIENT_PERMISSIONS", 403);
  }

  if (requester.id === target.id) {
    throw createAppError("You cannot remove yourself", "CANNOT_REMOVE_SELF", 400);
  }

  if (target.role === "admin") {
    throw createAppError("Admins cannot be removed from teams", "CANNOT_REMOVE_ADMIN", 403);
  }

  if (requester.role === "manager") {
    if (target.role !== "employee") {
      throw createAppError("Managers can only remove employees", "MANAGER_CAN_ONLY_REMOVE_EMPLOYEES", 403);
    }

    const managerTeam = await findTeamByManagerId(requester.id);
    if (!managerTeam) {
      throw createAppError("You are not managing any team", "MANAGER_HAS_NO_TEAM", 403);
    }

    const belongsToTeam = await isUserInTeam(target.id, managerTeam.id);
    if (!belongsToTeam) {
      throw createAppError("This employee is not in your team", "USER_NOT_IN_YOUR_TEAM", 404);
    }

    await removeUserFromTeam(target.id);
    return;
  }

  // admin removing a manager — wrap in transaction
  if (target.role === "manager") {
    const managedTeam = await findTeamByManagerId(target.id);

    await db().transaction(async (tx) => {
      if (managedTeam) {
        await tx.update(teamSchema).set({ managerId: null as unknown as number }).where(eq(teamSchema.id, managedTeam.id));
      }

      await tx.delete(teamMemberSchema).where(eq(teamMemberSchema.userId, target.id));
    });

    return;
  }

  // admin removing an employee
  const membership = await getTeamMembership(target.id);
  if (!membership) {
    throw createAppError("This user is not in any team", "USER_NOT_IN_ANY_TEAM", 404);
  }

  await removeUserFromTeam(target.id);
}
export async function getMyTeamMembersService(userId: number,requestedTeamId?: number,) {
  const user = await findUserById(userId);

  if (!user) {throw new Error("User not found");}
  
  if (user.role === role.admin) {
    if (!requestedTeamId) {throw new Error("Team id is required for admin");}
    
    const team = await findTeamById(requestedTeamId);
    if (!team) {throw new Error("Team not found");}
    
    const members = await findUsersByTeamId(requestedTeamId);
    return {...team,members,};
  }

  if (user.role === role.manager) {
    const team = await findTeamByManagerId(userId);
    if (!team) {throw new Error("Manager has no team");}
    
    const teamRef = await findTeamById(team.id);
    if (!teamRef) {throw new Error("Team not found");}
    
    const members = await findUsersByTeamId(teamRef.id);
    return {...teamRef,members};
  }

  const team = await findTeamByUserId(userId);
  if (!team) {throw new Error("User has no team");}
  
  const teamRef = await findUserById(team.teamId);
  if(!teamRef){ throw new Error("Team not found");}
  
  const members = await findUsersByTeamId(team.teamId)
  return {...team,members};
}

export async function getTeamDetailsService(userId: number,requestedTeamId?: number,) {
  const user = await findUserById(userId);

  if (!user) {throw new Error("User not found");}
  
  if (user.role === role.admin) {
    if (!requestedTeamId) {throw new Error("Team id is required for admin");}
    return await findTeamById(requestedTeamId);
  }
  
  if (user.role === role.manager) {return await findTeamByManagerId(userId);}

  const team = await findTeamByUserId(userId);
  if (!team) {throw new Error("User has no team");}
  return await findTeamById(team.teamId);
}

export async function getAllTeamsService(userId: number) {
  return await findAllTeams();
}

