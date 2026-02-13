import { db } from "../db.client";
import { user } from "../schema/user";
import { eq } from "drizzle-orm";
import type { UserRole } from "../schema/user";

export async function findUserByEmail(
  email: string
): Promise<{ email: string } | undefined> {

  const result = await db()
    .select({ email: user.email })
    .from(user)
    .where(eq(user.email, email));

  return result[0] ?? null;
}

export async function createUser(data: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<typeof user.$inferSelect> {
  const result = await db()
    .insert(user)
    .values({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
    })
    .returning();

  return result[0];
}
