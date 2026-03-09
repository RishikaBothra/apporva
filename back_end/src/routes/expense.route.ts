import { Router, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { createExpenseService } from "../services/expenseService";
import { submitExpenseService } from "../services/expenseService";
import { updateExpenseService } from "../services/expenseService";
import { deleteExpenseService } from "../services/expenseService";
  
const router = Router();

const expenseSchema = z.object({
  title: z.string().trim().min(1, "Title should not be empty").max(255),
  amount: z
    .any()
    .refine(
      (value) => value !== "" && value !== null && value !== undefined,
      "Amount should not be empty"
    )
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value), "Amount must be a number")
    .refine((value) => value > 0, "Amount must be greater than zero"),
  description: z.string().min(2).max(255),
  createdBy: z.number().optional(),
});

const updateExpenseSchema = z
  .object({
    title: z.string().trim().min(1, "Title should not be empty").max(255).optional(),
    amount: z
      .any()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          (value !== "" && value !== null && value !== undefined),
        "Amount should not be empty"
      )
      .transform((value) => (value === undefined ? undefined : Number(value)))
      .refine(
        (value) => value === undefined || !Number.isNaN(value),
        "Amount must be a number"
      )
      .refine(
        (value) => value === undefined || value > 0,
        "Amount must be greater than zero"
      ),
    description: z.string().trim().min(2).max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

router.post("/draft", authMiddleware(), async (req, res: Response) => {
  try {
    const parsed = expenseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      });
    }

    const { title, amount, description} = parsed.data;
    const userId = req.user.id;
    const result = await createExpenseService({
      title,
      amount,
      description,
      userId,
    });

    return res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
      });
    } else if (err.message.includes("Amount must be greater than zero")) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }
    return res.status(500).json({ message: "Failed to create expense" });
  }
});

router.patch("/submit/:id", authMiddleware(), async (req, res: Response) => {
  try {
    const parsedId = z.coerce.number().int().positive().safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    const id = parsedId.data;
    const userId = req.user.id;
    await submitExpenseService(id, userId);

    return res.status(200).json({ message: "Expense submitted successfully" });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
      });
    } else if (err.message.includes("Expense not found")) {
      return res.status(404).json({
        message: "Expense not found",
      });
    } else if (err.message.includes("Unauthorized to submit this expense")) {
      return res.status(403).json({
        message: "Unauthorized to submit this expense",
      });
    } else if (err.message.includes("Only draft expenses can be submitted")) {
      return res.status(400).json({
        message: "Only draft expenses can be submitted",
      });
    }
    return res.status(500).json({ message: "Failed to submit expense" });
  }
});

router.patch("/update/:id", authMiddleware(), async (req, res: Response) => {
  try {
    const parsedId = z.coerce.number().int().positive().safeParse(req.params.id);
    const parsedBody = updateExpenseSchema.safeParse(req.body);

    if (!parsedId.success) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.issues[0]?.message ?? "Invalid input",
      });
    }
    
    const id = parsedId.data;
    const userId = req.user.id;
    const data = parsedBody.data;
    await updateExpenseService(id, userId, data);

    return res.status(200).json({ message: "Expense updated successfully" });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
      });
    } else if (err.message.includes("Expense not found")) {
      return res.status(404).json({
        message: "Expense not found",
      });
    } else if (err.message.includes("Unauthorized to update this expense")) {
      return res.status(403).json({
        message: "Unauthorized to update this expense",
      });
    } else if (err.message.includes("Only draft expenses can be updated")) {
      return res.status(400).json({
        message: "Only draft expenses can be updated",
      });
    } else if (err.message.includes("Title and amount are same as last")) {
      return res.status(400).json({
        message: "Title and amount are same as last",
      });
    } else if (err.message.includes("Amount must be greater than zero")) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }
    return res.status(500).json({ message: "Failed to update expense" });
  }
});

router.delete("/delete/:id", authMiddleware(), async (req, res: Response) => {
  try {
    const parsedId = z.coerce.number().int().positive().safeParse(req.params.id);
    
    if (!parsedId.success) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    const id = parsedId.data;
    const userId = req.user.id;
    await deleteExpenseService(id, userId);

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
      });
    } else if (err.message.includes("Expense not found")) {
      return res.status(404).json({
        message: "Expense not found",
      });
    } else if (err.message.includes("Unauthorized to delete this expense")) {
      return res.status(403).json({
        message: "Unauthorized to delete this expense",
      });
    } else if (err.message.includes("Only draft expenses can be deleted")) {
      return res.status(400).json({
        message: "Only draft expenses can be deleted",
      });
    }
    return res.status(500).json({ message: "Failed to delete expense" });
  }
});

export default router;
