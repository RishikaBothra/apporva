import { db } from "../db.client";
import { user } from "../schema/user";
import { eq } from "drizzle-orm";
import type { UserRole } from "../schema/user";
import { Role } from "src/types/role.type";

export async function findUserByEmail(email: string): Promise<
    | {
          id: number;
          email: string;
          password: string;
          role: Role;
      }
    | undefined
> {
    const result = await db()
        .select({
            id: user.id,
            email: user.email,
            password: user.password,
            role: user.role,
        })
        .from(user)
        .where(eq(user.email, email));

    return result[0] ?? null;
}

export async function createUser(data: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
}): Promise<void> {
    try {
        await db()
            .insert(user)
            .values({
                fullName: data.fullName,
                email: data.email,
                password: data.password,
                role: data.role,
            })
            .returning();
    } catch (error: any) {
        throw new Error(
            `[Database Error] Failed to create user: ${error.message}`,
        );
    }
}
