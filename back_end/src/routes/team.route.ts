import { Router,Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { role } from "../types/user.type";
import { createTeamService } from "../services/teamService";
import { deleteTeamById } from "../services/teamService";
import { addMemberService } from "src/services/addMemberService";

const router = Router();

const teamSchema = z.object({
  name: z.string().min(2).max(100),
  managerId: z.number(),
});

router.post("/", authMiddleware(role.admin), async (req, res: Response) => {
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

    return res.status(201).json({
      message: "Team created successfully"
    });
  } catch (err: any) {
    if (err.message === "Team name already exists") {
      return res.status(409).json({ message: err.message });
    }

    if (err.message === "Manager is already assigned to another team") {
      return res.status(409).json({ message: err.message });
    }

    if (err.message === "Manager does not exist") {
      return res.status(400).json({ message: err.message });
    }

    if (err.message === "User is not a manager") {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: "Failed to create team" });
  }
});

router.delete("/delete/:id", authMiddleware(role.admin), async (req, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid team id" });
    }
    await deleteTeamById(id);
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.post(
  "/add-member",
  authMiddleware(),
  async (req: Request, res: Response) => {
    try {
      const { userId, teamId } = req.body;

      if (!userId || !teamId) {
        return res.status(400).json({ message: "Missing fields" });
      }

      await addMemberService(req.user.id, userId, teamId);

      return res.status(200).json({
        message: "Employee added successfully",
      });
    } catch (err: any) {
      const status = err?.status ?? 500;
      const code = err?.code ?? "INTERNAL_ERROR";
      return res.status(status).json({ message: err.message, code });
    }
  }
);

export default router;
