import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, MessageCircleMore, TriangleAlert } from "lucide-react";
import api from "../../API/index";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { usePolling } from "../../Hooks/Portal/usePolling";
import { messageService } from "../../API/services/messageService";
import { useDoctorTab } from "./DoctorTabs";

const REFRESH_MS = 60_000;

const getOpenFlagCount = async () => {
  const { data } = await api.get<{ flags: unknown[] }>("/api/flags", { params: { status: "new" } });
  return data.flags.length;
};

// The doctor's bell: unread patient messages and safety flags waiting for review.
export default function DoctorNotificationBell() {
  const { goToTab } = useDoctorTab();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const conversations = useApiQuery(messageService.getConversations, "Couldn't load messages");
  const flags = useApiQuery(getOpenFlagCount, "Couldn't load alerts");

  const refresh = useCallback(() => {
    conversations.refetch().catch(() => {});
    flags.refetch().catch(() => {});
  }, [conversations, flags]);
  usePolling(refresh, REFRESH_MS);

  const unread = (conversations.data?.conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0);
  const openFlags = flags.data ?? 0;
  const hasNew = unread > 0 || openFlags > 0;

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isOpen]);

  const open = (tab: "messages" | "dashboard") => {
    setIsOpen(false);
    goToTab(tab);
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!isOpen) refresh();
          setIsOpen((value) => !value);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={hasNew ? "Notifications (new)" : "Notifications"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#E9EDF2] lg:h-12 lg:w-12"
      >
        <Bell size={20} />
        {hasNew && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-[#E7E4E4] bg-white p-2 shadow-lg lg:top-14">
          <p className="px-3 py-2 fontOutfit font-medium">Notifications</p>

          {openFlags > 0 && (
            <button
              type="button"
              onClick={() => open("dashboard")}
              className="flex w-full items-start gap-3 rounded-md bg-[#FDECEA] px-3 py-2 text-left hover:bg-[#fbdcd8]"
            >
              <span className="mt-0.5 text-[#8C1D18]"><TriangleAlert size={18} /></span>
              <span className="text-sm">
                {openFlags} patient {openFlags === 1 ? "alert needs" : "alerts need"} your review.
              </span>
            </button>
          )}

          {unread > 0 && (
            <button
              type="button"
              onClick={() => open("messages")}
              className="mt-1 flex w-full items-start gap-3 rounded-md bg-[#E0F8F3] px-3 py-2 text-left hover:bg-[#d2f3ec]"
            >
              <span className="mt-0.5 text-[#28574E]"><MessageCircleMore size={18} /></span>
              <span className="text-sm">
                You have {unread} unread message{unread === 1 ? "" : "s"} from patients.
              </span>
            </button>
          )}

          {!hasNew && (
            <p className="px-3 py-4 text-sm text-[#757575]">You're all caught up. New patient messages and alerts will show here.</p>
          )}
        </div>
      )}
    </div>
  );
}
