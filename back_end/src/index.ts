import express, { type Request, type Response } from "express";
import cors from "cors";
import { env } from "./config/env";

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: env.ALLOWED_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    }),
);

app.get("/", (_req: Request, res: Response) => {
    res.json("i am alive!");
});

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
    

