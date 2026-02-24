import { CreateTeamInput } from "src/types/team.type";
import { db } from "../db.client";
import { team } from "../schema/team";
import { eq } from "drizzle-orm";
import { users } from "../schema/user";

export async function createTeam(input: CreateTeamInput): Promise<void> {
  const { name, managerId, userId } = input;
  await db().insert(team).values({
    name,
    managerId,
    createdBy: userId,
  });
}

export async function findUserById(id: number): Promise<{ id: number; role: string } | null> {
  const result = await db()
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, id));
  return result[0] ?? null;
}

export async function findTeamByManagerId(managerId: number): Promise<{ id: number } | null> {
  const result = await db()
    .select({ id: team.id })
    .from(team)
    .where(eq(team.managerId, managerId));
  return result[0] ?? null;
}

export async function findTeamByName(name: string): Promise<{ id: number } | null> {
  const result = await db()
    .select({ id: team.id })
    .from(team)
    .where(eq(team.name, name));
  return result[0] ?? null;
}

export const deleteTeam = async (id: number): Promise<number> => {
  const deleted = await db()
    .delete(team)
    .where(eq(team.id, id))
    .returning({id: team.id})
  return deleted.length;
};
