import { db } from "../db.client";
import { expense } from "../schema/expense";
import { eq } from "drizzle-orm";
import { CreateExpenseInput } from "src/types/expense.type";

export const createExpense = async ({
  title,
  description,
  amount,
  userId,
}: CreateExpenseInput) => {
  await db().insert(expense).values({
    title,
    description,
    amount,
    userId,
    status: "draft",
  });

  return { msg: "status: draft" };
};

export const getExpenseById = async (id: number) => {
  const result = await db()
    .select({
      id: expense.id,
      userId: expense.userId,
      title: expense.title,
      amount: expense.amount,
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


export const updateExpense = async (
  id: number,
  data: Partial<Pick<CreateExpenseInput, "title" | "amount" | "description">>
) => {
  await db()
    .update(expense)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(expense.id, id));
};