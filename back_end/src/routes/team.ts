import { createTeam } from "../services/createTeam";
import { Router, type Request, type Response } from "express";
import { authMiddleware, requireRole } from "../middleware/auth-middleware";
import { z } from "zod";

const Team = Router();

Team.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req: Request & { user?: { id: number } }, res: Response) => {
    const teamSchema = z.object({
      name: z.string().min(2).max(100),
      managerEmail: z.string().email().endsWith("@projectapprova.com"),
    });

    const parsed = teamSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsed.error.issues,
      });
    }

    try {
      const result = await createTeam({
        name: parsed.data.name,
        managerEmail: parsed.data.managerEmail,
        adminId: req.user!.id,
      });

      return res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "Manager not found") {
        return res.status(404).json({ message: err.message });
      }

      if (err.message === "Admin cannot be assigned as manager") {
        return res.status(400).json({ message: err.message });
      }

      return res.status(500).json({ message: "Failed to create team" });
    }
  },
);

export default Team;