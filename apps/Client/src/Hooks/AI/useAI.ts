import { useCallback, useMemo, useState } from "react";
import { useApiMutation } from "../Api/useApiMutation";
import { aiService } from "../../API/services/AIService";
import { useAuth } from "../Auth/useAuth";
import type { UrgencyLevel, IAiChatSessionRes } from "../../types/apiReqRes";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  urgency?: UrgencyLevel;
}

// Saved chats store the triage level on the patient's message. In the live
// chat it travels with the reply, so move it onto the reply here too.
function toChatMessages(saved: IAiChatSessionRes["messages"]): ChatMessage[] {
  let lastUserLevel: UrgencyLevel | undefined;
  return saved.map((message) => {
    if (message.role === "user") {
      lastUserLevel = message.level ?? undefined;
      return { id: crypto.randomUUID(), sender: "user", text: message.content };
    }
    return { id: crypto.randomUUID(), sender: "ai", text: message.content, urgency: lastUserLevel };
  });
}

export function useAI() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Lets the server keep the conversation's history and link safety flags to it.
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  const welcomeMessage = useMemo<ChatMessage | null>(() => {
    const name = user?.firstname || "there";

    return {
      id: crypto.randomUUID(),
      sender: "ai",
      text: `Hi ${name} 👋 I'm MediBridge AI. I can help with medication questions, appointment preparation, and general health information. What's on your mind today?`,
    };
  }, [user]);

  const displayedMessages = messages.length > 0 ? messages : welcomeMessage ? [welcomeMessage] : [];

  const {
    mutate,
    loading,
    error,
  } = useApiMutation(
    aiService.sendMessage,
    "Unable to contact AI assistant."
  );

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await mutate({ message, sessionId });

      setSessionId(response.sessionId);

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: response.reply,
        urgency: response.urgency,
      };

      setMessages((prev) => [...prev, aiMessage]);

      return response;
    } catch (err) {
      console.error(err);
    }
  };

  // Reopens a saved chat (signed-in patients and doctors only).
  const loadSession = useCallback(async (id: string) => {
    setLoadingSession(true);
    try {
      const saved = await aiService.getSession(id);
      setSessionId(saved.sessionId);
      setMessages(toChatMessages(saved.messages));
      return true;
    } catch {
      return false;
    } finally {
      setLoadingSession(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return {
    messages : displayedMessages,
    sessionId,
    sendMessage,
    loadSession,
    clearChat,
    loading,
    loadingSession,
    error,
  };
}
