import { Request,Response,NextFunction } from "express";
import { TokenVerifier } from "./jwt_handler";

export interface AuthRequest extends Request {
    user?:{
        user_id:string;
        role:"admin"|"manager"|"employee";
    }
}
    export function authMiddleware(req:AuthRequest,res:Response,next:NextFunction){
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message:'Unauthorized'});
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = TokenVerifier(token);
            req.user = {
                user_id:decoded.user_id,
                role:decoded.role
            }
            next();
        } catch (error) {
            return res.status(401).json(
                {message:'Unauthorized'});
        }
    }