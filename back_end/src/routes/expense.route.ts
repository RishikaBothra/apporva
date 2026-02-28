import { Router, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { createExpenseService } from "../services/expenseService";

const router = Router();

const expenseSchema = z.object({
  title: z.string().min(2).max(255),
  amount: z.number().positive(),
  description: z.string().min(2).max(255),
  createdBy: z.number().optional(),
});

router.post("/", authMiddleware(), async (req, res: Response) => {
  try {
    const parsed = expenseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
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

export default router;
