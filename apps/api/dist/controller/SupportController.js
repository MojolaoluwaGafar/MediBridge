"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const ai_1 = require("../Services/ai");
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({
                message: "Message is required",
            });
        }
        const reply = await (0, ai_1.sendToAI)(message);
        return res.json({ reply });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "AI integration failed",
        });
    }
};
exports.sendMessage = sendMessage;
