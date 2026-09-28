import { useRef, useEffect, useState } from "react";
import { SendHorizontal, CircleAlert } from "lucide-react";

import AiChatBubble from "../HomePageComponents/AiChatBubble";
import { useAI } from "../../Hooks/AI/useAI";

export default function MessageContainer() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, loading, error } = useAI();

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const userHasSentMessage = messages.some((msg) => msg.sender === "user");

  return (
    <div className="flex flex-col h-144.75 w-full bg-white border border-[#D1D5D5] rounded-xl shadow-md">
      <div className="flex-1 overflow-y-auto scrollbar-none p-12 space-y-5">
        {messages.map((msg) => (
          <AiChatBubble
            key={msg.id}
            isMine={msg.sender === "user"}
            text={msg.text}
          />
        ))}
        {loading && <AiChatBubble isMine={false} text="Thinking..." />}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div ref={messagesRef} />
      </div>

      <div className="border-t border-[#C2C6D4] p-6">
        {!userHasSentMessage && (
          <div className="flex gap-4 pb-5 flex-wrap">
            {[
              "I don't feel well",
              "Medication information",
              "Appointment help",
              "Understand my lab results",
            ].map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setInput(text)}
                disabled={loading}
                className="border border-[#DDDDDD] px-3 h-8 rounded-md text-[12px] font-semibold hover:bg-gray-100 disabled:opacity-50"
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
            disabled={loading}
            placeholder="Type anything..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            className="w-full rounded-md border border-[#C2C6D4] bg-[#DCF2EE99] px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#28574E]"
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={handleSend}
            className="absolute right-4 top-1/2 -translate-y-1/2 disabled:opacity-40"
          >
            <SendHorizontal size={20} />
          </button>
        </div>

        <p className="flex items-center gap-2 pt-5 text-[14px] text-[#757575]">
          <CircleAlert size={18} />
          This AI provides informational guidance and does not replace professional medical diagnosis.
        </p>
      </div>
    </div>
  );
}
