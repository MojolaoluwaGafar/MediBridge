import { useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { aiService } from "../../../API/services/AIService";
import { formatRelativeDay } from "../../../utils/formatDate";

type Props = {
  activeSessionId: string | null;
  onOpen: (sessionId: string) => void;
};

// "Recent chats" menu. Loads the list each time it opens so it includes the
// chat the patient just had.
export default function ChatHistory({ activeSessionId, onOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data, loading, error, refetch } = useApiQuery(aiService.getSessions, "Couldn't load your chats", {
    enabled: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    refetch().catch(() => {});

    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isOpen, refetch]);

  const sessions = data?.sessions ?? [];

  return (
    // Not `relative`: the menu lines up with the parent's right edge (the card
    // header), so on phones it stays on screen instead of hanging off the left.
    <div ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Recent chats"
        className="flex h-8 items-center gap-1.5 rounded-md border border-[#D7D7D7] px-3 text-xs font-medium hover:bg-gray-50"
      >
        <History size={14} />
        <span className="hidden sm:inline">Recent chats</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-20 w-72 max-w-[80vw] rounded-lg border border-[#E7E4E4] bg-white p-2 shadow-lg">
          {loading && <p className="p-3 text-sm text-[#757575]">Loading…</p>}
          {!loading && error && <p className="p-3 text-sm text-red-600">{error}</p>}
          {!loading && !error && sessions.length === 0 && (
            <p className="p-3 text-sm text-[#757575]">Your past chats will appear here.</p>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {!loading &&
              sessions.map((session) => (
                <li key={session.sessionId}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpen(session.sessionId);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left hover:bg-gray-50 ${
                      session.sessionId === activeSessionId ? "bg-[#E0F8F3]" : ""
                    }`}
                  >
                    <span className="block truncate text-sm">{session.title}</span>
                    <span className="block text-[11px] text-[#757575]">{formatRelativeDay(session.updatedAt)}</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
