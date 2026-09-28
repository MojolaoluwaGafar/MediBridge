import { CalendarCheck, RefreshCw, XCircle } from "lucide-react";
import type { Activity } from "../../../types/activity";

type Props = {
  activities: Activity[];
};

export default function RecentActivities({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full text-center px-4">
        <p className="text-base sm:text-lg md:text-[20px] font-medium fontOutfit pb-2">
          No recent activity yet
        </p>
        <p className="text-sm sm:text-base md:text-[16px] text-[#666666] max-w-md md:max-w-xl">
          Your hospital activity will appear here after you book an appointment,
          visit the hospital and receive updates from your care team
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {activities.slice(0, 2).map((activity) => {
        const activityIcons = {
          confirmed: <CalendarCheck size={20} color="#605E5E" />,
          rescheduled: <RefreshCw size={20} color="#605E5E" />,
          cancelled: <XCircle size={20} color="#605E5E" />,
        };

        const formattedTime = new Date(activity.timestamp).toLocaleString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            month: "short",
            day: "numeric",
          }
        );

        return (
          <div
            key={`${activity.timestamp}-${activity.type}`}
            className="flex items-start sm:items-center gap-3 pb-2 flex-wrap"
          >
            <span className="bg-[#EBEBEB] h-10 w-10 sm:h-12.5 sm:w-12.5 flex items-center justify-center rounded-xl">
              {activityIcons[activity.type]}
            </span>
            <div className="flex-1 min-w-[200px]">
              <h1 className="fontOutfit font-medium text-base sm:text-lg md:text-[20px]">
                Appointment {activity.type}
              </h1>
              <p className="fontOutfit text-sm sm:text-base md:text-[16px] font-light text-[#605E5E]">
                {activity.message} {formattedTime}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
