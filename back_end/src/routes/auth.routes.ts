import { Router } from "express";
import { z } from "zod";
import { signupService } from "../services/authService";

const router = Router();

const signupSchema = z.object({
  fullName: z.string().min(1),
  email: z.email().endsWith("@projectapprova.com"),
  password: z.string().min(8),
  role: z.enum(["employee", "manager", "admin"]),
});

router.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    await signupService(data);

    return res.status(201).json({
      message: "Signup Successful",
    });

   } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
        errors: err.issues,
      });
    }

    return res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
