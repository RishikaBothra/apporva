import authRoutes from "./routes/auth.routes";
import Team from "./routes/team";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: env.ALLOWED_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    }),
);

app.use("/auth", authRoutes);
app.use("/team", Team);
app.get("/", (_req: Request, res: Response) => {
    res.json("i am alive!");
});

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
    

