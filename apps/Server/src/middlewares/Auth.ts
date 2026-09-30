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

// For routes open to visitors (like the AI chat on the home page): attaches the
// user when a valid token is sent, and carries on as a guest otherwise.
export const optionalAuth = (req : AuthRequest, res : Response, next : NextFunction)=>{
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
        try {
            req.user = jwt.verify(authHeader.split(" ")[1], jwt_secret_key!) as JWTPayLoad
        } catch (error) {
            req.user = undefined
        }
    }
    next()
}

// Use after authMiddleware.
export const requireRole = (...roles : string[]) =>
    (req : AuthRequest, res : Response, next : NextFunction)=>{
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message : "You don't have access to this resource"
            })
        }
        next()
    }