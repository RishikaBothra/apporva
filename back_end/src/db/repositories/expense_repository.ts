import { db } from "../db.client";
import { expense } from "../schema/expense";

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
