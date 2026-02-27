import { Router } from "express";
import { z } from "zod";
import { signupService, signinService } from "../services/authService";
import { env } from "src/config/env";
import { setAuthCookie } from "src/cookie";

const router = Router();

const signupSchema = z.object({
  fullName: z.string().min(1),
  email: z.email().endsWith("@projectapprova.com"),
  password: z.string().min(8),
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
    } else if (err.message.includes("User already exists")) {
      return res.status(409).json({
        message: "User already exists",
      });
    } else if (
      err instanceof Error &&
      err.message.includes("[Database Error]")
    ) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }

    return res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
});

const signinSchema = z.object({
  email: z.email().endsWith("@projectapprova.com"),
  password: z.string().min(8),
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const { token } = await signinService(email, password);

    setAuthCookie(req, res, token);

    return res.status(200).json({ success: true });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Invalid credentials") ||
        err.message.includes("User not found"))
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
