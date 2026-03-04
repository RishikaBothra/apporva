import { db } from "../db.client";
import { users } from "../schema/user";
import { eq } from "drizzle-orm";
import type { UserRole } from "../schema/user";
import { Role } from "src/types/user.type";
import { createAppError } from "src/utils/app-error";

export async function findUserByEmail(email: string): Promise<
    | {
          id: number;
          email: string;
          password: string;
          role: Role;
      }
    | null
> {
    const result = await db()
        .select({
            id: users.id,
            email: users.email,
            password: users.password,
            role: users.role,
        })
        .from(users)
        .where(eq(users.email, email));

    return result[0] ?? null;
}

export async function createUser(data: {
    fullName: string;
    email: string;
    password: string;
}): Promise<void> {
    try {
        await db()
            .insert(users)
            .values({
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            })
            .returning();
    } catch (error: any) {
        throw new Error(
            `[Database Error] Failed to create user: ${error.message}`,
        );
    }
}

export async function updateUserRole(userId: number,newRole: UserRole): Promise<void> {
  await db()
  .update(users)
  .set({ role: newRole })
  .where(eq(users.id, userId));
}

export async function updateUserById(
  id: number,
  data: {
    fullName?: string;
    email?: string;
    password?: string;
  }
): Promise<boolean> {
  try {
    const result = await db()
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return result.length > 0;
  } catch (error: any) {
    const cause = error?.cause;
    if (cause?.code === "23505" && cause?.constraint_name?.includes("email")) {
      throw createAppError("This email is already in use", "EMAIL_ALREADY_IN_USE", 409);
    }
    throw new Error(`[Database Error] Failed to update user: ${error.message}`);
  }
}