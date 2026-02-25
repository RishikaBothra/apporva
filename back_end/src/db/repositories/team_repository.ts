import { CreateTeamInput } from "src/types/team.type";
import { db } from "../db.client";
import { team } from "../schema/team";
import { eq } from "drizzle-orm";
import { users } from "../schema/user";
import { teamMember } from "../schema/team-member";

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

export async function findUsersByTeamId(
    teamId: number,
): Promise<{ id: number; fullName: string; email: string; role: string }[]> {

    const result = await db()
        .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
        })
        .from(teamMember)
        .innerJoin(users, eq(teamMember.userId, users.id))
        .where(eq(teamMember.teamId, teamId));

    return result;
}
