import mongoose from "mongoose";
import { ChatSession } from "../Models/ChatSession";
import type { JWTPayLoad } from "../middlewares/Auth";
import { chatRoleFor } from "./aiRoles";
import { ServiceError } from "./errors";

const SESSIONS_LISTED = 20;
const TITLE_LENGTH = 60;

// A saved chat only belongs to the account and role that started it.
const ownSessions = (user: JWTPayLoad) => ({
  userId: new mongoose.Types.ObjectId(user.id),
  role: chatRoleFor(user.role),
});

// Most recent chats first, titled with the start of the first message.
export async function listChatSessions(user: JWTPayLoad) {
  const sessions = await ChatSession.find(
    { ...ownSessions(user), "messages.0": { $exists: true } },
    { sessionId: 1, updatedAt: 1, messages: { $slice: 1 } }
  )
    .sort({ updatedAt: -1 })
    .limit(SESSIONS_LISTED)
    .lean();

  return sessions.map((s) => {
    const first = s.messages[0]?.content ?? "New chat";
    return {
      sessionId: s.sessionId,
      title: first.length > TITLE_LENGTH ? `${first.slice(0, TITLE_LENGTH).trimEnd()}…` : first,
      updatedAt: s.updatedAt,
    };
  });
}

export async function getChatSession(user: JWTPayLoad, sessionId: string) {
  const session = await ChatSession.findOne({ ...ownSessions(user), sessionId }).lean();
  if (!session) throw new ServiceError(404, "Chat not found");

  return {
    sessionId: session.sessionId,
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      level: m.level ?? null,
      at: m.at,
    })),
  };
}
