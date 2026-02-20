import {
  createTeam,
  findTeamByManagerId,
  findTeamByName,
} from "../db/repositories/team_repository";
import { CreateTeamInput} from "src/types/team.type";

export async function createTeamService(input: CreateTeamInput) {
  const { name, managerId, userId } = input;

  const existingTeam = await findTeamByName(name);

  if (existingTeam) {
    throw new Error("Team name already exists");
  }

  const existingManager = await findTeamByManagerId(managerId);

  if (existingManager) {
    throw new Error("Manager is already assigned to another team");
  }

  await createTeam({ name, managerId, userId });

    return { success: true };
}