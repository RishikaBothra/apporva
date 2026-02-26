import authRoutes from "./routes/auth.route";
import Team from "./routes/team.route";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import MyProfile from "./routes/user.route";
import changeRole from "./routes/user.route";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: env.ALLOWED_ORIGIN,
        methods: ["GET", "POST", "DELETE"],
        credentials: true,
    }),
);

app.use("/auth", authRoutes);
app.use("/team", Team);
app.use("/me", MyProfile);
app.use("/change-role", changeRole);
app.get("/", (_req: Request, res: Response) => {
    res.json("i am alive!");
});

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
    

