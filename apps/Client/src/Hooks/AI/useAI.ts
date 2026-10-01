import { useEffect, useMemo, useState } from "react";
import { useApiMutation } from "../Api/useApiMutation";
import { aiService } from "../../API/services/AIService";
import { useAuth } from "../Auth/useAuth";
import type { IAiHistoryMessage, UrgencyLevel } from "../../types/apiReqRes";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  urgency?: UrgencyLevel;
}

type Options = {
  // Load the signed-in user's latest conversation on mount (portal chat).
  restoreLatest?: boolean;
};

// Triage stores urgency on the user's message; the UI shows it on the reply.
function fromHistory(history: IAiHistoryMessage[]): ChatMessage[] {
  return history.map((message, index) => {
    const previous = history[index - 1];
    return {
      id: crypto.randomUUID(),
      sender: message.role === "user" ? "user" : "ai",
      text: message.content,
      urgency:
        message.role === "assistant" && previous?.role === "user"
          ? previous.level ?? undefined
          : undefined,
    };
  });
}

export function useAI({ restoreLatest = false }: Options = {}) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Lets the server keep the conversation's history and link safety flags to it.
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(restoreLatest && !!user);

  useEffect(() => {
    if (!restoreLatest || !user) return;

    let cancelled = false;
    aiService
      .getLatestSession()
      .then((history) => {
        if (cancelled || !history.sessionId) return;
        // Don't overwrite a conversation the user started while this loaded.
        setMessages((current) => (current.length ? current : fromHistory(history.messages)));
        setSessionId((current) => current ?? history.sessionId);
      })
      .catch(() => {
        // No history is fine: the chat starts fresh.
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restoreLatest, user]);

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

  const clearChat = ()=> {
    setMessages([]);
    setSessionId(null);
  };

  return {
    messages : displayedMessages,
    sendMessage,
    clearChat,
    loading,
    historyLoading,
    error,
  };
}
