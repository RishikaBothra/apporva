import { db } from "../db.client";
import { expense } from "../schema/expense";
import { eq } from "drizzle-orm";

type CreateExpenseRepoInput = {
  title: string;
  description: string;
  amount: number;
  createdBy: number;
};

export const createExpense = async ({
  title,
  description,
  amount,
  createdBy,
}: CreateExpenseRepoInput) => {
  await db().insert(expense).values({
    title,
    description,
    amount,
    userId: createdBy,
    status: "draft",
  });

  return { msg: "status: draft" };
};

export const getExpenseById = async (id: number) => {
  const result = await db()
    .select({
      id: expense.id,
      createdBy: expense.userId,
      status: expense.status,
    })
    .from(expense)
    .where(eq(expense.id, id));

  return result[0];
};

export const updateExpenseStatus = async (id: number, status: "draft" | "submitted" | "accepted" | "rejected") => {
  await db()
    .update(expense)
    .set({ status,
      updatedAt: new Date() })
    .where(eq(expense.id, id));
};