import { useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import Icon from "../../../assets/Icon.svg";
import PageHeader from "../../PortalComponents/PageHeader";
import ChatInput from "../../PortalComponents/ChatInput";
import SafetyNotice from "../../PortalComponents/SafetyNotice";
import AiChatBubble from "../../HomePageComponents/AiChatBubble";
import ChatHistory from "./ChatHistory";
import { useAI } from "../../../Hooks/AI/useAI";
import { usePatientTab } from "../../../Hooks/Portal/usePatientTab";
import { showToast } from "../../../utils/toastHelper";

const SUGGESTIONS = [
  "I don't feel well",
  "Medication information",
  "Appointment help",
  "Understand my lab results",
];

const CARD_HEIGHT = "h-[calc(100dvh-16.5rem)] min-h-[26rem]";

export default function AISupport() {
  const { searchParams, goToTab } = usePatientTab();
  const chatId = searchParams.get("chat");

  const { messages, sessionId, sendMessage, loadSession, clearChat, loading, loadingSession, error } = useAI();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // The open chat lives in the URL (?chat=...), so a refresh or the back
  // button brings the same conversation back.
  useEffect(() => {
    if (!chatId) {
      if (sessionId) clearChat();
      return;
    }
    if (chatId === sessionId) return;

    loadSession(chatId).then((found) => {
      if (!found) {
        showToast("That chat couldn't be opened.", "error");
        goToTab("aiSupport", {}, { replace: true });
      }
    });
    // Only react to the URL; sessionId changes are written back to the URL below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, loading]);

  const handleSend = async (text: string) => {
    const response = await sendMessage(text);
    if (!response) return false;
    if (response.sessionId && response.sessionId !== chatId) {
      goToTab("aiSupport", { chat: response.sessionId }, { replace: true });
    }
    return true;
  };

  return (
    <div className="w-full">
      <PageHeader
        title="AI Support"
        description="Describe your symptoms or ask any hospital-related question. The AI will guide you step-by-step."
      />

      <section className={`mt-6 flex flex-col overflow-hidden rounded-xl border border-[#D7D7D7] bg-white ${CARD_HEIGHT}`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#E6E3E3] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#28574E]">
              <img src={Icon} alt="" className="h-3.5 w-3.5" />
            </span>
            <h2 className="fontOutfit text-sm font-medium">MediBridge AI</h2>
          </div>

          <div className="relative flex items-center gap-2">
            <ChatHistory
              activeSessionId={sessionId}
              onOpen={(id) => goToTab("aiSupport", { chat: id })}
            />
            <button
              type="button"
              onClick={() => {
                clearChat();
                setDraft("");
                goToTab("aiSupport");
              }}
              disabled={loading}
              className="h-8 rounded-md bg-[#28574E] px-3 text-xs font-medium text-white hover:bg-[#4f8379] disabled:opacity-50"
            >
              New Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {loadingSession ? (
            <p className="text-center text-sm text-[#757575]">Opening your chat…</p>
          ) : (
            messages.map((message) =>
              message.sender === "ai" && message.urgency === "emergency" ? (
                <div key={message.id} className="mb-4">
                  <SafetyNotice level="emergency" message={message.text} />
                </div>
              ) : (
                <div key={message.id}>
                  <AiChatBubble isMine={message.sender === "user"} text={message.text} />
                  {message.sender === "ai" && message.urgency === "urgent" && (
                    <div className="-mt-1 mb-4 sm:ml-14">
                      <SafetyNotice
                        level="urgent"
                        message="If your symptoms get worse, call emergency services or go to the nearest emergency department."
                      />
                    </div>
                  )}
                </div>
              )
            )
          )}
          {loading && <AiChatBubble isMine={false} text="Thinking..." />}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="space-y-3 border-t border-[#E6E3E3] p-3 sm:p-4">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setDraft(text)}
                disabled={loading}
                className="h-8 shrink-0 rounded-md border border-[#DDDDDD] px-3 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>

          <ChatInput
            placeholder="Type your question…"
            disabled={loading || loadingSession}
            value={draft}
            onValueChange={setDraft}
            onSend={handleSend}
          />

          <p className="flex items-start justify-center gap-1.5 text-center text-xs text-[#757575]">
            <CircleAlert size={14} className="mt-0.5 shrink-0" />
            This AI provides informational guidance and does not replace professional medical diagnosis. Chats are saved to your account.
          </p>
        </div>
      </section>
    </div>
  );
}
