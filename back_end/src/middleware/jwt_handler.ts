// Here the jwt token is made
import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET as string;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN as string;

enum role{
    admin = "admin",
    manager = "manager",
    employee = "employee"
}

export function TokenGenerator(payload:{id:string,role:role}):string{
    if (!payload) {
        throw new Error('Payload is required to generate a token');
    }
    const token = jwtSign(
        {
            user_id: payload.id,
            role: payload.role,
        },
        JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: JWT_EXPIRES_IN,
        }
    );//sign is used to create the token
    return token;
}

export function TokenVerifier(token:string):{user_id:string,role:role}{
    try {
        const decoded = jwtVerify(token,JWT_SECRET) as {user_id:string,role:role}; //verify is used to verify the token
        return decoded;
    } catch (error) {
        throw new Error('Unauthorized');
    }
}