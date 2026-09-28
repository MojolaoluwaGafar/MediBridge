"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const ai_1 = require("../Services/ai");
const Flagged_1 = __importDefault(require("../Models/Flagged"));
const unsafe_1 = require("../Utils/unsafe");
const emergency_1 = require("../Utils/emergency");
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                error: true,
                message: "Message is required",
            });
        }
        const unsafeReason = (0, unsafe_1.getUnsafeReason)(message);
        const emergency = (0, emergency_1.isEmergency)(message);
        if (emergency) {
            await Flagged_1.default.create({
                message,
                reason: "Emergency Self-Harm Risk",
            });
            // console.log("emergency text from user :",emergency);
            const emergencyReply = "It sounds like you may be going through something very serious right now. Please reach out to a trusted adult, family member, local emergency service, or mental health professional immediately.";
            return res.status(200).json({
                reply: emergencyReply,
            });
        }
        else if (unsafeReason) {
            await Flagged_1.default.create({
                message,
                reason: unsafeReason,
            });
        }
        const reply = await (0, ai_1.sendToAI)(message);
        return res.json({
            reply,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "AI integration failed",
        });
    }
};
exports.sendMessage = sendMessage;
