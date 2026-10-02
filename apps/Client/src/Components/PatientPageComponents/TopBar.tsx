import { Search } from "lucide-react";
import PortalTopBar from "../PortalComponents/PortalTopBar";
import NotificationBell from "./NotificationBell";
import type { AuthUser } from "../../Hooks/Auth/useAuth";

type Props = {
  activeTab: string;
  user: AuthUser | null;
  searchTerm: string;
  // Searching from any tab looks up departments, so the page decides where to go.
  onSearchChange: (value: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
  onOpenSettings: () => void;
};

export default function Topbar({
  activeTab,
  user,
  isSidebarOpen,
  setIsSidebarOpen,
  isUserMenuOpen,
  setIsUserMenuOpen,
  onLogout,
  onOpenSettings,
  searchTerm,
  onSearchChange,
}: Props) {
  const renderTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <p className="text-xl sm:text-2xl lg:text-[28px] font-medium fontOutfit">
            Dashboard
          </p>
        );
      case "settings":
        return (
          <p className="text-base sm:text-lg">
            Manage your account settings.
          </p>
        );
      default:
        return (
          <div className="relative w-full lg:max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search color="#605E5E" size={18} />
            </span>
            <input
              type="search"
              aria-label="Search conditions and departments"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search condition, department..."
              className="h-11 w-full rounded-lg border border-[#E7E4E4] pl-10 pr-4 text-sm focus:outline-none focus:border-[#28574E]"
            />
          </div>
        );
    }
  };

  return (
    <PortalTopBar
      title={renderTitle()}
      bell={<NotificationBell userId={user?.id} />}
      user={user}
      sidebarId="patient-sidebar"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      isUserMenuOpen={isUserMenuOpen}
      setIsUserMenuOpen={setIsUserMenuOpen}
      onLogout={onLogout}
      onOpenSettings={onOpenSettings}
    />
  );
}
