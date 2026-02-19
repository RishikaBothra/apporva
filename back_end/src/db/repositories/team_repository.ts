import { CreateTeamInput } from "src/types/team.type";
import { db } from "../db.client";
import { team } from "../schema/team";

export async function createTeam(input: CreateTeamInput): Promise<void> {
  const { name, managerId, userId } = input;

  await db().insert(team).values({
    name,
    managerId,
    createdBy: userId,
  });
}