import { Response,Request } from "express";
import { env } from "../src/config/env";

const COOKIE_NAME = "auth_token";

const isprod = env.NODE_ENV === "prod";

export function setAuthCookie(
    _req: Request,
    res: Response,
    token: string,
){
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isprod,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}