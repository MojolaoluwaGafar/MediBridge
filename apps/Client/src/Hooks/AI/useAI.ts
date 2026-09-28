import { useMemo, useState } from "react";
import { useApiMutation } from "../Api/useApiMutation";
import { aiService } from "../../API/services/AIService";
import { useAuth } from "../Auth/useAuth";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function useAI() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
      const response = await mutate({ message });

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: response.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);

      return response;
    } catch (err) {
      console.error(err);
    }
  };

  const clearChat = ()=> setMessages([]);

  return {
    messages : displayedMessages,
    sendMessage,
    clearChat,
    loading,
    error,
  };
}