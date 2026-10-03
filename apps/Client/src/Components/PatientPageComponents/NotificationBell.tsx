import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CalendarCheck, FileText, MessageCircleMore, RefreshCw, XCircle } from "lucide-react";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { usePolling } from "../../Hooks/Portal/usePolling";
import { usePatientTab } from "../../Hooks/Portal/usePatientTab";
import { activityService } from "../../API/services/activityService";
import { messageService } from "../../API/services/messageService";
import { formatRelativeDay } from "../../utils/formatDate";
import type { Activity } from "../../types/activity";

const REFRESH_MS = 60_000;

const ACTIVITY_ICON: Record<Activity["type"], React.ReactNode> = {
  confirmed: <CalendarCheck size={18} />,
  rescheduled: <RefreshCw size={18} />,
  cancelled: <XCircle size={18} />,
  record: <FileText size={18} />,
};

const ACTIVITY_TITLE: Record<Activity["type"], string> = {
  confirmed: "Appointment booked",
  rescheduled: "Appointment rescheduled",
  cancelled: "Appointment cancelled",
  record: "New medical record",
};

// When the patient last opened the bell, kept per browser and per account so
// the dot only shows for activity they haven't seen. Storage can be blocked
// (private mode); then the dot simply shows for any recent activity.
const seenKey = (userId?: string) => `notificationsSeenAt:${userId ?? "me"}`;
function readSeenAt(userId?: string): number {
  try {
    return Number(localStorage.getItem(seenKey(userId))) || 0;
  } catch {
    return 0;
  }
}
function writeSeenAt(userId: string | undefined, at: number) {
  try {
    localStorage.setItem(seenKey(userId), String(at));
  } catch {
    // Not critical.
  }
}

type Props = { userId?: string };

// The top bar's bell: unread doctor messages and recent appointment activity.
export default function NotificationBell({ userId }: Props) {
  const { goToTab } = usePatientTab();
  const [isOpen, setIsOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => readSeenAt(userId));
  const panelRef = useRef<HTMLDivElement>(null);

  const activities = useApiQuery(activityService.getActivities, "Couldn't load notifications");
  const conversations = useApiQuery(messageService.getConversations, "Couldn't load messages");

  const refresh = useCallback(() => {
    activities.refetch().catch(() => {});
    conversations.refetch().catch(() => {});
  }, [activities, conversations]);
  usePolling(refresh, REFRESH_MS);

  const unreadMessages = (conversations.data?.conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0);
  const recent = (activities.data?.activities ?? []).slice(0, 6);
  const newActivity = recent.some((a) => new Date(a.timestamp).getTime() > seenAt);
  const hasNew = unreadMessages > 0 || newActivity;

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

  const toggle = () => {
    if (!isOpen) {
      refresh();
      // Opening the panel counts as seeing what's in it.
      const now = Date.now();
      writeSeenAt(userId, now);
      setSeenAt(now);
    }
    setIsOpen((open) => !open);
  };

  const open = (tab: "messages" | "appointments" | "medRecords") => {
    setIsOpen(false);
    goToTab(tab);
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={toggle}
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

          {unreadMessages > 0 && (
            <button
              type="button"
              onClick={() => open("messages")}
              className="flex w-full items-start gap-3 rounded-md bg-[#E0F8F3] px-3 py-2 text-left hover:bg-[#d2f3ec]"
            >
              <span className="mt-0.5 text-[#28574E]"><MessageCircleMore size={18} /></span>
              <span className="text-sm">
                You have {unreadMessages} unread message{unreadMessages === 1 ? "" : "s"} from your doctor{unreadMessages === 1 ? "" : "s"}.
              </span>
            </button>
          )}

          {recent.length === 0 && unreadMessages === 0 ? (
            <p className="px-3 py-4 text-sm text-[#757575]">You're all caught up. Updates about your appointments and messages will show here.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {recent.map((activity) => (
                <li key={activity._id ?? `${activity.timestamp}-${activity.type}`}>
                  <button
                    type="button"
                    onClick={() => open(activity.type === "record" ? "medRecords" : "appointments")}
                    className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="mt-0.5 text-[#605E5E]">{ACTIVITY_ICON[activity.type]}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{ACTIVITY_TITLE[activity.type]}</span>
                      <span className="block text-xs text-[#605E5E]">{activity.message}</span>
                      <span className="block text-[11px] text-[#757575]">{formatRelativeDay(activity.timestamp)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
