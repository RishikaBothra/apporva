import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "src/middleware/auth-middleware";
import { z } from "zod";
import { changeUserRoleService } from "src/services/userService";

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
});
router.patch("/",authMiddleware("admin"),async (req: Request, res: Response) => {
    try {
      const { tragtedId: userId, newRole } = changeRoleSchema.parse(req.body);
      const adminId = req.user.id;

      await changeUserRoleService(adminId, newRole, userId);

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
      }
      return res.status(500).json({
        message: err.message || "Internal server error",
      });
    }
  },
);

export default router;
