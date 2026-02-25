import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "src/middleware/auth-middleware";

const router = Router();

router.get("/", authMiddleware(), (req: Request, res: Response) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user,
  });
});

export default router;
