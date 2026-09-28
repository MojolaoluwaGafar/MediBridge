"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyRecoveryCode = exports.ForgotPassword = exports.login = exports.SetPassword = exports.verifyCode = exports.VerifyUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../Models/User");
const registerSchema_1 = require("../Validation/registerSchema");
const GenerateToken_1 = require("./../Utils/GenerateToken");
const SendActivationEmail_1 = require("./../Utils/SendActivationEmail");
const crypto_1 = __importDefault(require("crypto"));
const SendResetCode_1 = require("./../Utils/SendResetCode");
function generateActivationCode() {
    return crypto_1.default.randomInt(100000, 999999).toString();
}
const VerifyUser = async (req, res) => {
    try {
        const parsed = registerSchema_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data = parsed.data;
        const { UserId, Email, RegisteredNumber } = data;
        const user = await User_1.User.findOne({ UserId, Email, RegisteredNumber });
        if (!user) {
            return res.status(404).json({
                error: "Patient not found",
            });
        }
        if (user.isActive) {
            return res.status(400).json({
                error: "Patient Account already activated"
            });
        }
        const code = generateActivationCode();
        user.activationCode = code;
        user.activationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();
        await (0, SendActivationEmail_1.sendActivationCode)(Email, user.FirstName, code);
        const payload = {
            id: user._id.toString(),
            role: req.body.role || "user"
        };
        const token = (0, GenerateToken_1.generateToken)(payload);
        res.status(200).json({
            success: true,
            message: "User verified successfully, Activation Code sent to email",
            user: {
                id: user._id,
                email: user.Email,
                role: user.role
            },
            expiresAt: user.activationCodeExpires,
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.VerifyUser = VerifyUser;
const verifyCode = async (req, res) => {
    try {
        const parsed = registerSchema_1.verifyCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data = parsed.data;
        const { code, email, Email, UserId } = data;
        let user = null;
        if (req.user?.id) {
            user = await User_1.User.findById(req.user.id);
        }
        else if (email || Email) {
            user = await User_1.User.findOne({ Email: email || Email });
        }
        else if (UserId) {
            user = await User_1.User.findOne({ UserId });
        }
        if (!user) {
            return res.status(404).json({
                error: "Patient not found"
            });
        }
        if (user.activationCode !== code) {
            return res.status(400).json({
                error: "Invalid code"
            });
        }
        if (!user.activationCodeExpires) {
            return res.status(400).json({
                error: "No activation code expiry set"
            });
        }
        if (user.activationCodeExpires < new Date()) {
            return res.status(400).json({
                error: "Code expired"
            });
        }
        user.isActive = true;
        user.activationCode = null;
        user.activationCodeExpires = null;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Code verified successfully, account activated. Please, set a password",
            user: {
                id: user._id,
                email: user.Email,
                role: user.role
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
exports.verifyCode = verifyCode;
const SetPassword = async (req, res) => {
    try {
        const parsed = registerSchema_1.setPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data = parsed.data;
        const { password, email, Email, UserId } = data;
        const normalizedEmail = (email || Email || "").trim().toLowerCase();
        let user = null;
        if (req.user?.id) {
            user = await User_1.User.findById(req.user.id);
        }
        else if (normalizedEmail) {
            user = await User_1.User.findOne({ Email: normalizedEmail });
        }
        else if (UserId) {
            user = await User_1.User.findOne({ UserId });
        }
        if (!user) {
            return res.status(404).json({
                error: "Patient not found"
            });
        }
        user.Password = await bcrypt_1.default.hash(password, 12);
        await user.save();
        const payload = {
            id: user._id.toString(),
            role: user.role
        };
        const token = (0, GenerateToken_1.generateToken)(payload);
        return res.status(200).json({
            success: true,
            message: "Password set successfully",
            user: {
                id: user._id,
                email: user.Email,
                firstname: user.FirstName,
                lastname: user.LastName,
                role: user.role,
            },
            token
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
exports.SetPassword = SetPassword;
const login = async (req, res) => {
    try {
        const parsed = registerSchema_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data = parsed.data;
        const { UserId, password } = data;
        const user = await User_1.User.findOne({ UserId });
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        if (!user.Password) {
            return res.status(400).json({
                error: "No Password set for this account"
            });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.Password);
        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid Credentials"
            });
        }
        ;
        const payload = {
            id: user._id.toString(),
            role: user.role
        };
        const token = (0, GenerateToken_1.generateToken)(payload);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                firstname: user.FirstName,
                lastname: user.LastName,
                email: user.Email,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
exports.login = login;
const ForgotPassword = async (req, res) => {
    try {
        const parsed = registerSchema_1.forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data = parsed.data;
        const { email } = data;
        const user = await User_1.User.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        const code = generateActivationCode();
        user.activationCode = code;
        user.activationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await (0, SendResetCode_1.sendResetCode)(user.Email, user.FirstName, code);
        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email",
            email: user.Email,
            expiresAt: user.activationCodeExpires
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
exports.ForgotPassword = ForgotPassword;
const verifyRecoveryCode = async (req, res) => {
    try {
        const parsed = registerSchema_1.verifyCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const { code, email, Email } = parsed.data;
        const user = await User_1.User.findOne({
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
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
exports.verifyRecoveryCode = verifyRecoveryCode;
const resetPassword = async (req, res) => {
    try {
        const parsed = registerSchema_1.resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const data = parsed.data;
        const { password, email, Email, UserId } = data;
        const normalizedEmail = (email || Email || "").trim().toLowerCase();
        let user = null;
        if (req.user?.id) {
            user = await User_1.User.findById(req.user.id);
        }
        else if (normalizedEmail) {
            user = await User_1.User.findOne({ Email: normalizedEmail });
        }
        else if (UserId) {
            user = await User_1.User.findOne({ UserId });
        }
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        user.Password = await bcrypt_1.default.hash(password, 12);
        await user.save();
        const payload = {
            id: user._id.toString(),
            role: user.role
        };
        const token = (0, GenerateToken_1.generateToken)(payload);
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
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
exports.resetPassword = resetPassword;
