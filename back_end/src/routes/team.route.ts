import { Router, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { role } from "../types/user.type";
import { createTeamService } from "../services/teamService";

const router = Router();

const teamSchema = z.object({
  name: z.string().min(2).max(100),
  managerId: z.number(),
});

router.post(
  "/",
  authMiddleware(role.admin),
  async (req, res: Response) => {
    try {
      const parsed = teamSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input",
        });
      }

      const { name, managerId } = parsed.data;
      const userId = req.user.id;

      const result = await createTeamService({
        name,
        managerId,
        userId,
      });

      return res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "Team name already exists") {
        return res.status(409).json({ message: err.message });
      }

      if (err.message === "Manager is already assigned to another team") {
        return res.status(409).json({ message: err.message });
      }

      console.error("Error creating team:", err);
      return res.status(500).json({ message: "Failed to create team" });
    }
  },
);

export default router;