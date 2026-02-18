import { eq } from "drizzle-orm";
import { db } from "../db/db.client";
import { team } from "../db/schema/team";
import { user } from "../db/schema/user";

type CreateTeamInput = {
  name: string;
  managerEmail: string;
  adminId: number;
};

export async function createTeam(
  input: CreateTeamInput,
) {
  const manager = await db().query.user.findFirst({
    where: eq(user.email, input.managerEmail),
  });

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (manager.role === "admin") {
    throw new Error("Admin cannot be assigned as manager");
  }

  const newTeam = await db()
    .insert(team)
    .values({
      name: input.name,
      adminId: input.adminId,
      managerId: manager.id,
      createdBy: input.adminId,
    })
    .returning();

  await db()
    .update(user)
    .set({ role: "manager" })
    .where(eq(user.id, manager.id));

  return newTeam;
}
