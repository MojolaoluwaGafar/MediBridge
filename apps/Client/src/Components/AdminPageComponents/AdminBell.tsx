import { useCallback } from "react";
import { Bell } from "lucide-react";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { usePolling } from "../../Hooks/Portal/usePolling";
import { adminService } from "../../API/services/adminService";
import { useAdminTab } from "./AdminTabs";

const openFlags = () => adminService.listFlags("new");

// The admin's bell: a dot while safety alerts wait for review. Opens them.
export default function AdminBell() {
  const { goToTab } = useAdminTab();
  const flags = useApiQuery(openFlags, "Couldn't load alerts");
  const refresh = useCallback(() => {
    flags.refetch().catch(() => {});
  }, [flags]);
  usePolling(refresh, 60_000);

  const count = flags.data?.length ?? 0;
  return (
    <button
      type="button"
      onClick={() => goToTab("alerts")}
      aria-label={count ? `${count} open safety alerts` : "No open safety alerts"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#E9EDF2] lg:h-12 lg:w-12"
    >
      <Bell size={20} />
      {count > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />}
    </button>
  );
}
