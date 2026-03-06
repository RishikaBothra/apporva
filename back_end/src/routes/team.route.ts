import { Router,Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { z } from "zod";
import { role } from "../types/user.type";
import { createTeamService, deleteTeamById, addMemberService } from "../services/teamService";
import { getMyTeamMembersService } from "../services/teamService";
import { getTeamDetailsService } from "../services/teamService";
import { getAllTeamsService } from "../services/teamService";

const router = Router();

const teamSchema = z.object({
  name: z.string().min(2).max(100),
  managerId: z.number(),
});

const teamMembersQuerySchema = z.object({
  teamId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val > 0), {
      message: "teamId must be a positive integer",
    }),
});

const teamDetailsQuerySchema = z.object({
  teamId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) =>
        val === undefined ||
        (Number.isInteger(val) && val > 0),
      {
        message: "teamId must be a positive integer",
      }
    ),
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
});

router.get("/members",authMiddleware(),async (req, res: Response): Promise<void> => {
  try {
    const parsed = teamMembersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({message: "Invalid query parameters",});
      return;  
    }
    
    const teamId = parsed.data.teamId;
    const result = await getMyTeamMembersService(req.user.id,teamId);
    res.status(200).json({ data: result });

  }
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        res.status(404).json({ message: error.message });
        return;
      }

      if (error.message === "Access denied") {
        res.status(403).json({ message: error.message });
        return;
      }
      
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({message: "Internal server error",});
  }
});

router.get("/details",authMiddleware(),async (req, res: Response): Promise<void> => {
  try {
    const parsed = teamDetailsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({message: "Invalid query parameters",});
      return;
    }

    const teamId = parsed.data.teamId;
    const result = await getTeamDetailsService(
      req.user.id,
      teamId
    );
    res.status(200).json({ data: result });
  }

  catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        res.status(404).json({ message: error.message });
        return;
      }
      
      if (error.message === "Access denied") {
        res.status(403).json({ message: error.message });
        return;
      }
      
      if (error.message === "Team not found") {
        res.status(404).json({ message: error.message });
        return;
      }

      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({message: "Internal server error",});
  }
});

router.get("/all",authMiddleware(role.admin),async (req, res: Response): Promise<void> => {
  try {
    const result = await getAllTeamsService(req.user.id);
    res.status(200).json({ data: result });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({message: error.message,});
      return;
    }
    res.status(500).json({message: "Internal server error",});
  }
});

router.post(
  "/add/member",
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
