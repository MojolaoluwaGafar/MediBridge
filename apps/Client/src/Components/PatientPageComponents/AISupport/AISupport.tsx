import { useEffect, useRef, useState } from "react";
import { CircleAlert, SendHorizontal } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import AiChatBubble from "../../HomePageComponents/AiChatBubble";
import Icon from "../../../assets/Icon.svg";
import { useAI } from "../../../Hooks/AI/useAI";

const SUGGESTIONS = [
  "I don't feel well",
  "Medication information",
  "Appointment help",
  "Understand my lab results",
];

// The portal's AI chat. Unlike the public Support page it is tied to the
// patient's account: it knows their upcoming appointments (server side) and
// reopens their latest conversation.
export default function AISupport() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, clearChat, loading, historyLoading, error } = useAI({
    restoreLatest: true,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;
    setInput("");
    await sendMessage(message);
  };

  const userHasSentMessage = messages.some((msg) => msg.sender === "user");

  return (
    <div className="w-full">
      <PageHeader
        title="AI Support"
        description="Describe your symptoms or ask any hospital-related question. The AI will guide you step-by-step."
      />

      <div className="mt-6 flex h-[calc(100dvh-14rem)] min-h-[480px] flex-col rounded-xl border border-[#D7D7D7] bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-[#E6E3E3] px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#28574E]">
              <img src={Icon} alt="" className="h-4 w-4" />
            </span>
            MediBridge AI
          </span>
          <button
            type="button"
            onClick={clearChat}
            disabled={loading || !userHasSentMessage}
            className="h-8 rounded-md bg-[#28574E] px-3 text-xs text-white transition-colors hover:bg-[#4f8379] disabled:opacity-50"
          >
            New Chat
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
          {historyLoading ? (
            <p className="text-center text-sm text-[#757575]">Loading your conversation…</p>
          ) : (
            messages.map((msg) => (
              <AiChatBubble
                key={msg.id}
                isMine={msg.sender === "user"}
                text={msg.text}
                urgency={msg.urgency}
              />
            ))
          )}
          {loading && <AiChatBubble isMine={false} text="Thinking..." />}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[#E6E3E3] p-4 sm:px-6">
          {!userHasSentMessage && (
            <div className="flex flex-wrap gap-2 pb-3">
              {SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => void send(text)}
                  disabled={loading || historyLoading}
                  className="h-8 rounded-md border border-[#DDDDDD] px-3 text-xs hover:bg-gray-100 disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={input}
              maxLength={2000}
              disabled={loading || historyLoading}
              placeholder="Type your question..."
              aria-label="Your question"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send(input);
              }}
              className="h-11 w-full rounded-md border border-[#C2C6D4] bg-[#DCF2EE99] pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#28574E] disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => void send(input)}
              aria-label="Send"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#28574E] disabled:opacity-40"
            >
              <SendHorizontal size={20} />
            </button>
          </div>

          <p className="flex items-center justify-center gap-2 pt-3 text-center text-xs text-[#757575]">
            <CircleAlert size={14} className="shrink-0" />
            This AI provides informational guidance and does not replace professional medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}
