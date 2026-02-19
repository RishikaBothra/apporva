import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { role } from "../types/user.type";
import { createTeam } from "../db/repositories/team_repository";

const router = Router();

const teamSchema = z.object({
  name: z.string().min(2).max(100),
  managerId: z.number(),
});

router.post(
  "/",
  authMiddleware(role.admin),
  async (req: Request, res: Response) => {
    try {
      const parsed = teamSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input",
        });
      }

      const { name, managerId } = parsed.data;
      const userId = req.user.id;

      await createTeam({ name, managerId, userId });

      return res.status(201).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ message: "Failed to create team" });
    }
  },
);

export default router;