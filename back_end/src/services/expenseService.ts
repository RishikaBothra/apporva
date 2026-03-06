import { CreateExpenseInput } from "src/types/expense.type";
import {
  createExpense,
  getExpenseById,
  updateExpenseStatus,
  updateExpense,
} from "../db/repositories/expense_repository";

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
    userId,
  });

  return;
};

export const submitExpenseService = async (expenseId: number, userId: number) => {
  const expenseData = await getExpenseById(expenseId);

  if (!expenseData) {
    throw new Error("Expense not found");
  }

  if (expenseData.userId !== userId) {
    throw new Error("Unauthorized to submit this expense");
  }

  if (expenseData.status !== "draft") {
    throw new Error("Only draft expenses can be submitted");
  }

  await updateExpenseStatus(expenseId, "submitted");

  return;
};

export const updateExpenseService = async (expenseId: number, userId: number, data: Partial<CreateExpenseInput>) => {
  const expenseData = await getExpenseById(expenseId);

  if (!expenseData) {
    throw new Error("Expense not found");
  }

  if (expenseData.userId !== userId) {
    throw new Error("Unauthorized to update this expense");
  }

  if (expenseData.status !== "draft") {
    throw new Error("Only draft expenses can be updated");
  }

  if (data.amount !== undefined && data.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const isSameTitle = data.title !== undefined && data.title === expenseData.title;
  const isSameAmount = data.amount !== undefined && data.amount === expenseData.amount;

  if (isSameTitle && isSameAmount) {
    throw new Error("Title and amount are same as last");
  }

  const updateData: Partial<Pick<CreateExpenseInput, "title" | "amount" | "description">> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.amount !== undefined) {
    updateData.amount = data.amount;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  await updateExpense(expenseId, updateData);

  return;
}

