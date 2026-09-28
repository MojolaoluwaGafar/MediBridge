"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGroqModels = initGroqModels;
exports.pickModel = pickModel;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
let availableModels = [];
async function initGroqModels() {
    try {
        const response = await groq.models.list();
        availableModels = response.data.map((m) => m.id);
        // console.log("Available Groq models:", availableModels);
    }
    catch (err) {
        console.error("Failed to fetch Groq models:", err);
    }
}
function pickModel(preferred) {
    if (availableModels.includes(preferred)) {
        return preferred;
    }
    const fallbacks = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma-7b-it", "mixtral-8x7b-32768",];
    for (const model of fallbacks) {
        if (availableModels.includes(model)) {
            console.log("Using fallback model:", model);
            return model;
        }
    }
    throw new Error("No supported Groq models available");
}
