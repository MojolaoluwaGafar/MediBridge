import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../Models/User";
import { RegisterInput, registerSchema,VerifyCodeInput, verifyCodeSchema,setPasswordSchema, SetPasswordInput, loginSchema,LoginInput, forgotPasswordSchema, ForgotPasswordInput, resetPasswordSchema, ResetPasswordInput } from "../Validation/registerSchema";
import { generateToken } from './../Utils/GenerateToken';
import { JWTPayLoad } from "../middlewares/Auth";
import { sendActivationCode } from './../Utils/SendActivationEmail';
import crypto from "crypto"
import type { AuthRequest } from "../middlewares/Auth";
import { sendResetCode } from './../Utils/SendResetCode';

function generateActivationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}


export const VerifyUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const data : RegisterInput = parsed.data;
    const { UserId, Email, RegisteredNumber } = data

    const user = await User.findOne({ UserId, Email, RegisteredNumber})
    if (!user) {
        return res.status(404).json({
            error : "Patient not found",
        })
    }
    if (user.isActive) {
        return res.status(400).json({
            error : "Patient Account already activated"
        })
    }
    
    const code = generateActivationCode();
    user.activationCode = code;
    user.activationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    
    await sendActivationCode(Email,user.FirstName,code)
    const payload : JWTPayLoad = {
        id : user._id.toString(),
        role: req.body.role || "user"
    }
    const token = generateToken(payload)
    res.status(200).json({
            success : true,
            message : "User verified successfully, Activation Code sent to email",
            user : {
                id : user._id,
                email : user.Email,
                role : user.role
            },
            expiresAt : user.activationCodeExpires,
            token
        })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const verifyCode = async (req : AuthRequest, res : Response) => {
    try {
        const parsed = verifyCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const data : VerifyCodeInput = parsed.data;
        const { code, email, Email, UserId } = data

        let user = null;

        if (req.user?.id) {
            user = await User.findById(req.user.id);
        } else if (email || Email) {
            user = await User.findOne({ Email: email || Email });
        } else if (UserId) {
            user = await User.findOne({ UserId });
        }

        if (!user) {
            return res.status(404).json({
                error : "Patient not found"
            })
        }

        if (user.activationCode !== code) {
            return res.status(400).json({
                error : "Invalid code"
            })
        }
        if (!user.activationCodeExpires) {
            return res.status(400).json({
                error : "No activation code expiry set"
            })
        }
        if (user.activationCodeExpires < new Date()) {
            return res.status(400).json({
                error  : "Code expired"
            })
        }

        user.isActive = true;
        user.activationCode = null;
        user.activationCodeExpires = null;

        await user.save();
        
        return res.status(200).json({
            success : true,
            message : "Code verified successfully, account activated. Please, set a password",
            user : {
                id : user._id,
                email : user.Email,
                role : user.role
            }
        })
    } catch (error : any) {
        return res.status(500).json({
            error : error.message
        })
    }
}

export const SetPassword = async (req : AuthRequest, res : Response) => {
    try {
        const parsed = setPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const data : SetPasswordInput =  parsed.data
        const { password, email, Email, UserId } = data
        const normalizedEmail = (email || Email || "").trim().toLowerCase();

        let user = null;

        if (req.user?.id) {
            user = await User.findById(req.user.id);
        } else if (normalizedEmail) {
            user = await User.findOne({ Email: normalizedEmail });
        } else if (UserId) {
            user = await User.findOne({ UserId });
        }

        if (!user) {
            return res.status(404).json({
                error : "Patient not found"
            })
        }
        user.Password = await bcrypt.hash(password, 12)
        await user.save();

        const payload : JWTPayLoad = {
            id : user._id.toString(),
            role : user.role
        }
        const token = generateToken(payload)

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
            token
        })
    } catch (error : any) {
        return res.status(500).json({
            error : error.message
        })
    }
}

export const login = async (req : Request, res : Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data : LoginInput = parsed.data;
        const { UserId, password } = data;

        const user = await User.findOne({ UserId });
        if (!user) {
            return res.status(404).json({
                error : "User not found"
            })
        }
        if (!user.Password) {
            return res.status(400).json({
                error : "No Password set for this account"
            })
        }

        const passwordMatch = await bcrypt.compare(password, user.Password);
        if (!passwordMatch) {
            return res.status(401).json({
                error  : "Invalid Credentials"
            })
        };

        const payload : JWTPayLoad = {
            id : user._id.toString(),
            role : user.role
        }
        const token = generateToken(payload);

        return res.status(200).json({
            success : true,
            message  : "Login successful",
            user : {
                id : user._id,
                firstname : user.FirstName,
                lastname : user.LastName,
                email : user.Email,
                role : user.role,
            },
            token,
        })
    } catch (error : any) {
        return res.status(500).json({
            error : error.message
        })
    }
}


export const ForgotPassword = async (req : Request, res : Response) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        }

        const data : ForgotPasswordInput = parsed.data;
        const { email } = data

        const user = await User.findOne({ Email : email });
        if (!user) {
            return res.status(404).json({
                error : "User not found"
            })
        }
        const code = generateActivationCode();
        user.activationCode = code;
        user.activationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendResetCode(user.Email, user.FirstName, code)

        return res.status(200).json({
            success : true,
            message : "Verification code sent to your email",
            email : user.Email,
            expiresAt : user.activationCodeExpires
        })
    } catch (error : any) {
        return res.status(500).json({
            error : error.message
        })
    }
}

export const verifyRecoveryCode = async (req: Request, res: Response) => {
  try {
    const parsed = verifyCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

const { code, email, Email } = parsed.data;
        const user = await User.findOne({
          activationCode: code,
          ...(email || Email ? { Email: email || Email } : {}),
        });

    if (!user) {
      return res.status(404).json({ error: "Invalid code" });
    }
    if (!user.activationCodeExpires || user.activationCodeExpires < new Date()) {
      return res.status(400).json({ error: "Code expired" });
    }

    user.activationCode = null;
    user.activationCodeExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Code verified successfully, proceed to reset password",
      user: { id: user._id, email: user.Email },
    });
  } catch (error: any) {
    return res.status(500).json({ 
        error: error.message 
    });
  }
};


export const resetPassword = async (req : AuthRequest, res : Response) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors : parsed.error.issues.map(issue => ({
                    field : issue.path.join("."),
                    message : issue.message,
                })),
            });  
        }

        const data : ResetPasswordInput = parsed.data;
        const { password, email, Email, UserId } = data;
        const normalizedEmail = (email || Email || "").trim().toLowerCase();

        let user = null;

        if (req.user?.id) {
            user = await User.findById(req.user.id);
        } else if (normalizedEmail) {
            user = await User.findOne({ Email: normalizedEmail });
        } else if (UserId) {
            user = await User.findOne({ UserId });
        }

        if (!user) {
            return res.status(404).json({
                error : "User not found"
            })
        }
        user.Password = await bcrypt.hash(password, 12);
        await user.save();
        const payload : JWTPayLoad = {
            id : user._id.toString(),
            role : user.role
        };
        const token = generateToken(payload);
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
            token,
        });
    } catch (error : any) {
        return res.status(500).json({
            error : error.message
        })
    }
}