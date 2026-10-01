import Groq from "groq-sdk";
import dotenv from "dotenv"
import { logger } from "../Utils/logger"
dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

let availableModels: string[] = [];

export async function initGroqModels() {
  try {
    const response = await groq.models.list();
    availableModels = response.data.map((m: any) => m.id);
    // console.log("Available Groq models:", availableModels);
  } catch (err) {
    logger.error({ err }, "Failed to fetch Groq models");
  }
}

export function pickModel(preferred: string): string {
  if (availableModels.includes(preferred)) {
    return preferred;
  }
  const fallbacks = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma-7b-it",  "mixtral-8x7b-32768",];
  for (const model of fallbacks) {
    if (availableModels.includes(model)) {
      logger.info({ model }, "Using fallback Groq model");
      return model;
    }
  }
  throw new Error("No supported Groq models available");
}
