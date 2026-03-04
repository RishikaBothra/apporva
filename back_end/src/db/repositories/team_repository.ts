import { CreateTeamInput } from "src/types/team.type";
import { db } from "../db.client";
import { team } from "../schema/team";
import { and,eq } from "drizzle-orm";
import { users } from "../schema/user";
import { teamMember } from "../schema";

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

export async function isUserInTeam(userId: number, teamId: number): Promise<boolean> {
  const result = await db()
    .select()
    .from(teamMember)
    .where(
      and(
        eq(teamMember.userId, userId),
        eq(teamMember.teamId, teamId)
      )
    );

  return result.length > 0;
}

export async function removeUserFromTeam(userId: number):Promise<void> {
  await db()
    .delete(teamMember)
    .where(eq(teamMember.userId, userId));
}

export async function getTeamMembership(userId: number):Promise<{ userId: number; teamId: number } | null> {
  const result = await db()
    .select({ userId: teamMember.userId, teamId: teamMember.teamId })
    .from(teamMember)
    .where(eq(teamMember.userId, userId));

  return result[0] || null;
}

export async function addUserToTeam(userId: number, teamId: number):Promise<void> {
  await db().insert(teamMember).values({
    userId,
    teamId,
  });
}

export async function findTeamById(teamId: number) : Promise<{ id: number; name: string; managerId: number | null } | null>{
  const result = await db()
    .select({ id: team.id, name: team.name, managerId: team.managerId })
    .from(team)
    .where(eq(team.id, teamId));

  return result[0] || null;
}

export async function updateTeamManager(teamId: number, newManagerId: number | null) :Promise<void>{
  await db()
    .update(team)
    .set({ managerId: newManagerId as any })
    .where(eq(team.id, teamId));
}