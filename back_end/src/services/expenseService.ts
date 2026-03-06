import { CreateExpenseInput } from "src/types/expense.type";
import { createExpense } from "../db/repositories/expense_repository";
import { getExpenseById } from "../db/repositories/expense_repository";
import { updateExpenseStatus } from "../db/repositories/expense_repository";

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

export const submitExpenseService = async (expenseId: number, userId: number) => {
  const expenseData = await getExpenseById(expenseId);

  if (!expenseData) {
    throw new Error("Expense not found");
  }

  if (expenseData.createdBy !== userId) {
    throw new Error("Unauthorized to submit this expense");
  }

  if (expenseData.status !== "draft") {
    throw new Error("Only draft expenses can be submitted");
  }

  await updateExpenseStatus(expenseId, "submitted");

  return;
}