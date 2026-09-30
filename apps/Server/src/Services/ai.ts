import axios from "axios";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  json?: boolean;
  timeoutMs?: number;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function chatWithAI(
  messages: AIMessage[],
  { model, temperature = 0.4, json = false, timeoutMs = 20000 }: ChatOptions = {}
): Promise<string> {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: model || process.env.GROQ_MODEL!,
        messages,
        temperature,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: timeoutMs,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Empty AI response");
    }
    return content.trim();
  } catch (error: any) {
    console.error("Groq error:", error.response?.data || error.message);
    throw new Error("AI integration failed");
  }
}
