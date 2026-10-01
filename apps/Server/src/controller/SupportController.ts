import { Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { chatWithAI, type AIMessage } from "../Services/ai";
import { triage, needsFlag, emergencyReply, type TriageResult } from "../Services/triage";
import { buildSystemPrompt, chatRoleFor } from "../Services/aiRoles";
import { ChatSession, type ChatRole, type IChatSession } from "../Models/ChatSession";
import Flagged from "../Models/Flagged";
import type { AuthRequest } from "../middlewares/Auth";

const MAX_MESSAGE_LENGTH = 2000;
const HISTORY_SENT_TO_AI = 12;

async function findOrCreateSession(
  sessionId: unknown,
  role: ChatRole,
  userId?: string
): Promise<IChatSession> {
  if (typeof sessionId === "string" && sessionId) {
    const existing = await ChatSession.findOne({ sessionId });
    // A session is only reused by the same person in the same role, so a
    // leaked or guessed session ID never exposes someone else's chat.
    if (existing && existing.role === role && (existing.userId?.toString() ?? null) === (userId ?? null)) {
      return existing;
    }
  }

  return ChatSession.create({
    sessionId: crypto.randomUUID(),
    role,
    userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    messages: [],
  });
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, sessionId } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const role = chatRoleFor(req.user?.role);
    if (!role) {
      // Not a 403: the client signs people out on 403.
      return res.json({
        reply: "The AI assistant is for patients and doctors. As an admin, you can review AI safety flags in the admin portal.",
        sessionId: null,
        urgency: "routine",
      });
    }

    const userId = req.user?.id;
    const text = message.trim();
    const session = await findOrCreateSession(sessionId, role, userId);

    // Safety triage runs on everything patients and visitors write. Doctors
    // describe patients' symptoms all day, so their messages are not triaged.
    let result: TriageResult | null = null;
    if (role !== "doctor") {
      result = await triage(text);

      if (needsFlag(result)) {
        await Flagged.create({
          source: "chat",
          sessionId: session.sessionId,
          userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          message: text,
          reason: result.reason,
          level: result.level,
          category: result.category,
          triageSource: result.source,
        });
      }
    }

    session.messages.push({ role: "user", content: text, level: result?.level, at: new Date() });

    let reply: string;
    if (result?.level === "emergency") {
      // Emergencies get a fixed, tested reply rather than a generated one.
      reply = emergencyReply(result.category);
    } else {
      const history: AIMessage[] = session.messages
        .slice(-HISTORY_SENT_TO_AI)
        .map(({ role, content }) => ({ role, content }));

      let systemPrompt = await buildSystemPrompt(role, userId);
      if (result?.level === "urgent") {
        systemPrompt += `\n\nSAFETY NOTE: triage marked the latest message as urgent (${result.category}). Start your reply by encouraging the person to get care today: contact the hospital, book the earliest appointment, or for thoughts of self-harm, speak to someone they trust or a crisis line. If things get worse or they are in danger, they should call emergency services.`;
      }

      try {
        reply = await chatWithAI([{ role: "system", content: systemPrompt }, ...history]);
      } catch (error) {
        await session.save();
        return res.status(502).json({
          sessionId: session.sessionId,
          message: "The assistant is unavailable right now. Please try again in a moment.",
        });
      }
    }

    session.messages.push({ role: "assistant", content: reply, at: new Date() });
    await session.save();

    return res.json({
      reply,
      sessionId: session.sessionId,
      urgency: result?.level ?? "routine",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "AI integration failed",
    });
  }
};

const HISTORY_RETURNED = 50;

// The signed-in person's most recent conversation, so the portal chat can pick
// up where they left off. "New chat" on the client simply stops sending this
// sessionId; the next message starts a new session, which becomes the latest.
export const getLatestSession = async (req: AuthRequest, res: Response) => {
  try {
    const role = chatRoleFor(req.user?.role);
    if (!role || role === "guest") {
      return res.json({ sessionId: null, messages: [] });
    }

    const session = await ChatSession.findOne({
      userId: new mongoose.Types.ObjectId(req.user!.id),
      role,
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!session) {
      return res.json({ sessionId: null, messages: [] });
    }

    return res.json({
      sessionId: session.sessionId,
      messages: session.messages.slice(-HISTORY_RETURNED).map((m) => ({
        role: m.role,
        content: m.content,
        level: m.level ?? null,
        at: m.at,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load your conversation" });
  }
};
