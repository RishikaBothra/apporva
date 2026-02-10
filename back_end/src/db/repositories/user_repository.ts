import { db } from "../db.client";
import { users } from "../schema/user";
import { eq } from "drizzle-orm";

export async function findUserByEmail(
  email: string
): Promise<{ email: string } | null> {

  const result = await db()
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email));

  return result[0] ?? null;
}

export async function createUser(data: {
  fullName: string;
  email: string;
  password: string;
  role: "employee" | "manager" | "admin";
}): Promise<typeof users.$inferSelect> {
  const result = await db()
    .insert(users)
    .values({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
    })
    .returning();

  return result[0];
}
