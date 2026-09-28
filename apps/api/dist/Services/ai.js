"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToAI = sendToAI;
const axios_1 = __importDefault(require("axios"));
const USE_GROQ = true;
async function sendToAI(message) {
    if (USE_GROQ) {
        try {
            const response = await axios_1.default.post("https://api.groq.com/openai/v1/chat/completions", {
                model: process.env.GROQ_MODEL,
                messages: [{ role: "user", content: message }],
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error("Groq error:", error.response?.data || error.message);
            throw new Error("AI integration failed");
        }
    }
    else {
        const response = await axios_1.default.post("https://api.anthropic.com/v1/messages", {
            model: "claude-3-opus-20240229",
            max_tokens: 300,
            messages: [{ role: "user", content: message }],
        }, {
            headers: {
                "x-api-key": process.env.CLAUDE_API_KEY,
                "Content-Type": "application/json",
            },
        });
        return response.data.content[0].text;
    }
}
