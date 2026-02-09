import { Response,Request } from "express";

const COOKIE_NAME = "token";

function isHttps(req: Request): boolean {
    return req.secure || req.headers["x-forwarded-proto"] === "https";
    }

export function setAuthCookie(
    req: Request,
    res: Response,
    token: string,
){
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isHttps(req),
        sameSite: "lax",
    });
}