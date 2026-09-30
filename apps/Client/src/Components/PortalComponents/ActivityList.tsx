import { CalendarCheck, FileText, NotebookPen, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import type { PortalActivity } from "../../types/portal";

const ICONS: Record<PortalActivity["kind"], React.ReactNode> = {
  confirmed: <CalendarCheck size={20} color="#605E5E" />,
  rescheduled: <RefreshCw size={20} color="#605E5E" />,
  cancelled: <XCircle size={20} color="#605E5E" />,
  flag: <ShieldAlert size={20} color="#B3261E" />,
  record: <FileText size={20} color="#605E5E" />,
  note: <NotebookPen size={20} color="#605E5E" />,
};

// Same look as the patient dashboard's Recent Activities.
export default function ActivityList({ activities }: { activities: PortalActivity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-center text-[16px] text-[#666666] fontOutfit py-4">
        No recent activity yet
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start sm:items-center gap-3 pb-2 flex-wrap">
          <span className="bg-[#EBEBEB] h-10 w-10 sm:h-12.5 sm:w-12.5 flex items-center justify-center rounded-xl">
            {ICONS[activity.kind]}
          </span>
          <div className="flex-1 min-w-[200px]">
            <h1 className="fontOutfit font-medium text-base sm:text-lg md:text-[20px]">
              {activity.title}
            </h1>
            <p className="fontOutfit text-sm sm:text-base md:text-[16px] font-light text-[#605E5E]">
              {activity.detail} {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
