import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Link } from "react-router";
import AiChatBubble from "./AiChatBubble";
import { useAI } from "../../Hooks/AI/useAI";

type Props = {
  preview?: boolean;
};

export default function ChatContainer({ preview = false } : Props) {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { messages, sendMessage, loading, error } = useAI();

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const message = input.trim();

    if (!message || loading) return;

    if (preview) {
      setInput("")
      setShowModal(true);
      return;
    }

    setInput("");
    await sendMessage(message);
  };

  return (
   <>
    {showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl text-center relative">
            <button
        onClick={() => setShowModal(false)}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        ✕
      </button>
      <h2 className="text-lg font-semibold mb-2">
        Continue in AI Support
      </h2>
      <p className="mb-4">
        The homepage chat is a preview. Continue the conversation on the Support page.
      </p>
      <Link to="/support" className="inline-block bg-[#28574E] text-white px-4 py-2 rounded-lg">
        Go to Support
      </Link>
    </div>
  </div>
)}
    <div className="flex h-124.5 flex-col rounded-4xl border border-[#D1D5D5] bg-white p-12 shadow-md">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
                  <AiChatBubble
                    key={msg.id}
                    isMine={msg.sender === "user"}
                    text={msg.text}
                  />
                ))}
        
                {loading && (
                  <AiChatBubble
                    isMine={false}
                    text="Thinking..."
                  />
                )}
        
                {error && (
                  <p className="text-red-500 text-sm">
                    {error}
                  </p>
                )}

        <div ref={messagesRef} />
      </div>

      <div className="relative mt-4 w-full">
        <input
          type="text"
          placeholder="Type anything..."
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleSend();
            }
          }}
          className="w-full rounded-md border border-[#C2C6D4] bg-[#DCF2EE99] px-3 py-2 pr-12 text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#28574E] disabled:opacity-60"
        />

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={loading || !input.trim()}
          className="absolute right-4 top-1/2 -translate-y-1/2 disabled:opacity-50"
        >
          <SendHorizontal />
        </button>
      </div>
    </div></>
  );
}