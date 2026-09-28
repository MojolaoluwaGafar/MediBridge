import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export interface JWTPayLoad {
    id : string,
    role : string
}

export interface AuthRequest extends Request {
    user? : JWTPayLoad
}

const jwt_secret_key : string | undefined = process.env.JWT_SECRET_KEY

export const authMiddleware = (req : AuthRequest, res : Response, next : NextFunction)=>{
    const authHeader = req.headers.authorization;

    if ( !authHeader || !authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message : "No token provided"
        })
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token,jwt_secret_key!) as JWTPayLoad
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(403).json({
            message : "Invalid or expired token"
        })
    }
}