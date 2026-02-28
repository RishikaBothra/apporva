import { Router, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { role } from "../types/user.type";
import { createTeamService } from "../services/teamService";
import { deleteTeamById } from "../services/teamService";
import { getMyTeamMembersService } from "../services/teamService";
import { getTeamDetailsService } from "../services/teamService";
import { getAllTeamsService } from "../services/teamService";

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

    return res.status(201).json(result);
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

router.delete("/delete/:id", authMiddleware(role.admin), async (req, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "Invalid team id" });
    return;
  }
  try {
    await deleteTeamById(id);
    res.status(200).json({message: "Team deleted successfully",});
  }
  catch (error: unknown) {
    const message = error instanceof Error? error.message: "Failed to delete team";
    res.status(message === "Team not found" ? 404 : 500).json({message,});
  }
},
);

router.get("/members",authMiddleware(),async (req, res: Response): Promise<void> => {
  try {
    const teamId = req.query.teamId? Number(req.query.teamId): undefined;
    const result = await getMyTeamMembersService(
      req.user.id,
      teamId,
    );
    res.status(200).json({ data: result });
  }
  catch (error: unknown) {
    res.status(400).json({
      message:
      error instanceof Error? error.message: "Failed to fetch team members",
    });
  }
},
);

router.get("/details",authMiddleware(),async (req, res: Response): Promise<void> => {
  try {
    const teamId = req.query.teamId? Number(req.query.teamId): undefined;
    const result = await getTeamDetailsService(
      req.user.id,
      teamId,
    );
    res.status(200).json({ data: result });
  }
  catch (error: unknown) {
    res.status(400).json({
      message:
      error instanceof Error? error.message: "Failed to fetch team details",
    });
  }
},
);

router.get("/all",authMiddleware(),async (req, res: Response): Promise<void> => {
  try {
    const result = await getAllTeamsService(req.user.id);
    res.status(200).json({ data: result });
  }
  catch (error: unknown) {
    res.status(403).json({
      message:
      error instanceof Error? error.message: "Access denied",
    });
  }
},
);

export default router;
