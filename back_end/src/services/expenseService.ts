import { CreateExpenseInput } from "src/types/expense.type";
import { createExpense } from "../db/repositories/expense_repository";

export const createExpenseService = async ({
  title,
  amount,
  description,
  userId,
}: CreateExpenseInput) => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  await createExpense({
    title,
    description,
    amount,
    createdBy: userId,
  });

  return;
};
