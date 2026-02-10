import { Response,Request } from "express";
import dotenv from "dotenv";
dotenv.config();


const COOKIE_NAME = "token";

const isprod = process.env.NODE_ENV === "prod";

export function setAuthCookie(
    req: Request,
    res: Response,
    token: string,
){
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isprod,
        sameSite: "lax",
    });
}