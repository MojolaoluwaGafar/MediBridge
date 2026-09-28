import jwt from "jsonwebtoken" 
import { JWTPayLoad } from "../middlewares/Auth" 

export const generateToken = (payload : JWTPayLoad)=>{

    const jwt_secret_key : string | undefined = process.env.JWT_SECRET_KEY;
    if (!jwt_secret_key) {
        throw new Error("JWT_SECRET is not defined in ENV")
    };

    return jwt.sign(payload, jwt_secret_key, { expiresIn : "1h"})
}