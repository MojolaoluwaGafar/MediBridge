import { Request, Response } from "express";
import type { ZodError } from "zod";
import { registerSchema, verifyCodeSchema, setPasswordSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../Validation/registerSchema";
import { generateToken } from './../Utils/GenerateToken';
import { JWTPayLoad } from "../middlewares/Auth";
import type { AuthRequest } from "../middlewares/Auth";
import { maskPhone } from "../Utils/phone";
import type { IUser } from "../Models/User";
import * as authService from "../Services/authService";
import { isServiceError } from "../Services/errors";

function validationErrors(error: ZodError) {
    return {
        errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        })),
    };
}

function sendError(res: Response, error: any) {
    if (isServiceError(error)) {
        return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
}

// The role always comes from the stored account, never from the request.
function tokenFor(user: IUser) {
    const payload : JWTPayLoad = {
        id : user._id.toString(),
        role : user.role
    }
    return generateToken(payload)
}

function codeSentMessage(emailMessage: string, phone: string | null, smsSent: boolean): string {
  return smsSent && phone ? `${emailMessage} and to your phone ending in ${phone.slice(-4)}` : emailMessage;
}


export const VerifyUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationErrors(parsed.error));
    }

    const { UserId, Email, RegisteredNumber } = parsed.data
    const { user, phone, smsSent } = await authService.startActivation(UserId, Email, RegisteredNumber)

    res.status(200).json({
            success : true,
            message : codeSentMessage("User verified successfully. Activation code sent to your email", phone, smsSent),
            user : {
                id : user._id,
                email : user.Email,
                role : user.role
            },
            phone : smsSent && phone ? maskPhone(phone) : null,
            expiresAt : user.activationCodeExpires,
        })
  } catch (error: any) {
    sendError(res, error);
  }
};


export const verifyCode = async (req : AuthRequest, res : Response) => {
    try {
        const parsed = verifyCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(validationErrors(parsed.error));
        }

        const { code, email, Email, UserId } = parsed.data
        const { user, passwordToken } = await authService.activateAccount({ email: email || Email, UserId }, code)

        return res.status(200).json({
            success : true,
            message : "Code verified successfully, account activated. Please, set a password",
            user : {
                id : user._id,
                email : user.Email,
                role : user.role
            },
            passwordToken
        })
    } catch (error : any) {
        return sendError(res, error)
    }
}

export const SetPassword = async (req : AuthRequest, res : Response) => {
    try {
        const parsed = setPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(validationErrors(parsed.error));
        }

        const { password, passwordToken } = parsed.data
        const user = await authService.setPassword(passwordToken, password)

        return res.status(200).json({
            success : true,
            message : "Password set successfully",
            user : {
                id : user._id,
                email : user.Email,
                firstname : user.FirstName,
                lastname : user.LastName,
                role : user.role,
            },
            token : tokenFor(user)
        })
    } catch (error : any) {
        return sendError(res, error)
    }
}

export const login = async (req : Request, res : Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(validationErrors(parsed.error));
        }

        const { UserId, password } = parsed.data;
        const user = await authService.authenticate(UserId, password)

        return res.status(200).json({
            success : true,
            message  : "Login successful",
            user : {
                id : user._id,
                firstname : user.FirstName,
                lastname : user.LastName,
                email : user.Email,
                role : user.role,
                img : user.ProfileImage ?? undefined,
            },
            token : tokenFor(user),
        })
    } catch (error : any) {
        return sendError(res, error)
    }
}


export const ForgotPassword = async (req : Request, res : Response) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(validationErrors(parsed.error));
        }

        const { user, phone, smsSent } = await authService.startPasswordRecovery(parsed.data.email)

        return res.status(200).json({
            success : true,
            message : codeSentMessage("Verification code sent to your email", phone, smsSent),
            email : user.Email,
            phone : smsSent && phone ? maskPhone(phone) : null,
            expiresAt : user.activationCodeExpires
        })
    } catch (error : any) {
        return sendError(res, error)
    }
}

export const verifyRecoveryCode = async (req: Request, res: Response) => {
  try {
    const parsed = verifyCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationErrors(parsed.error));
    }

    const { code, email, Email } = parsed.data;
    if (!(email || Email)) {
      return res.status(400).json({ error: "Email is required" });
    }
    const { user, passwordToken } = await authService.verifyRecoveryCode(code, (email || Email)!);

    return res.status(200).json({
      success: true,
      message: "Code verified successfully, proceed to reset password",
      user: { id: user._id, email: user.Email },
      passwordToken,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};


export const resetPassword = async (req : AuthRequest, res : Response) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(validationErrors(parsed.error));
        }

        const { password, passwordToken } = parsed.data;
        const user = await authService.resetPassword(passwordToken, password)

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
            user: {
                id: user._id,
                firstname: user.FirstName,
                lastname: user.LastName,
                email: user.Email,
                role: user.role,
            },
            token : tokenFor(user),
        });
    } catch (error : any) {
        return sendError(res, error)
    }
}
