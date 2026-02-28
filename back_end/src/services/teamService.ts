import {
  createTeam,
  findTeamByManagerId,
  findTeamByName,
  findUserById,
} from "../db/repositories/team_repository";
import { CreateTeamInput } from "src/types/team.type";
import { deleteTeam} from "../db/repositories/team_repository";
import { findUsersByTeamId } from "../db/repositories/team_repository";
import { role } from "../types/user.type";
import { findTeamByUserId } from "../db/repositories/team_repository";
import { findAllTeams } from "../db/repositories/team_repository";
import { findTeamById } from "../db/repositories/team_repository";

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

