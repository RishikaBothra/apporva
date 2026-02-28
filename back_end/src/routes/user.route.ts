import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "src/middleware/auth-middleware";
import { z, ZodError } from "zod";
import { changeUserRoleService } from "src/services/userService";
import {updateProfile} from "../services/userService";
import { removeMemberService } from "../services/teamService";
const router = Router();

router.get("/", authMiddleware(), (req: Request, res: Response) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user,
  });
});

const changeRoleSchema = z.object({
  tragtedId: z.number(),
  newRole: z.enum(["employee", "manager", "admin"]),
  platformSecret: z.string().optional(),
});

router.patch("/",authMiddleware("admin"),async (req: Request, res: Response) => {
    try {
      const {
        tragtedId: userId,
        newRole,
        platformSecret,
      } = changeRoleSchema.parse(req.body);
      const adminId = req.user.id;

      await changeUserRoleService(adminId, newRole, userId, platformSecret);

      return res.status(200).json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input",
        });
      } else if (err.message.includes("User not found")) {
        return res.status(404).json({
          message: "User not found",
        });
      } else if (err.message.includes("Users cannot change their own role")) {
        return res.status(400).json({
          message: "Users cannot change their own role",
        });
      } else if (err.message.includes("User already has the specified role")) {
        return res.status(400).json({
          message: "User already has the specified role",
        });
      } else if (err.message.includes("Invalid platform secret")) {
        return res.status(403).json({
          message: "Invalid platform secret",
        });
      }
      return res.status(500).json({
        message: err.message || "Internal server error",
      });
    }
  },
);

router.delete(
  "/remove/:id",
  authMiddleware(),
  async (req, res) => {
    try {
      const targetId = Number(req.params.id);

      if (isNaN(targetId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      await removeMemberService(
        req.user.id,
        targetId,
      );

      return res.status(200).json({
        message: "Member removed successfully",
      });
    } catch (err: any) {
      const status = err?.status ?? 500;
      const code = err?.code ?? "INTERNAL_ERROR";
      return res.status(status).json({ message: err.message, code });
    }
  }
);

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .refine(
      (val) => val.endsWith("@projectapprova.com"),
      { message: "Email must be a @projectapprova.com address" }
    )
    .optional(),
  password: z.string().min(8).optional(),
});

router.patch(
  "/profile",
  authMiddleware(),
  async (req: Request, res: Response) => {
    try {
      const data = updateSchema.parse(req.body);

      const user = (req as any).user;

      const updated = await updateProfile(user.id, data);

      if (!updated) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "Profile updated successfully",
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          errors: err.issues,
        });
      }

      const status = err?.status ?? 500;
      const code = err?.code ?? "INTERNAL_ERROR";
      return res.status(status).json({ message: err.message, code });
    }
  }
);
export default router;
