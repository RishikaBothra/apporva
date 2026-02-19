import { CreateTeamInput } from "src/types/team.type";
import { db } from "../db.client";
import { team } from "../schema/team";
import { eq } from "drizzle-orm";

export async function createTeam(input: CreateTeamInput): Promise<void> {
  const { name, managerId, userId } = input;

  await db().insert(team).values({
    name,
    managerId,
    createdBy: userId,
  });
}

export async function findTeamByManagerId(managerId: number) {
  const result = await db()
    .select()
    .from(team)
    .where(eq(team.managerId, managerId));

  return result[0] ?? null;
}

export async function findTeamByName(name: string) {
  const result = await db()
    .select()
    .from(team)
    .where(eq(team.name, name));

  return result[0] ?? null;
}