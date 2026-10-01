import Logo from "../../assets/MediBridgeLogo.svg";
import { Bell, Search, Menu } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";
import type { AuthUser } from "../../Hooks/Auth/useAuth";

type Props = {
  activeTab: string;
  user: AuthUser | null;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
};

export default function Topbar({
  activeTab,
  user,
  isSidebarOpen,
  setIsSidebarOpen,
  isUserMenuOpen,
  setIsUserMenuOpen,
  onLogout,
  searchTerm,
  setSearchTerm,
}: Props) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm ?? "");

  useEffect(() => {
    setLocalSearchTerm(searchTerm ?? "");
  }, [searchTerm]);

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
              value={localSearchTerm}
              onChange={(event) => {
                const value = event.target.value;
                setLocalSearchTerm(value);
                setSearchTerm?.(value);
              }}
              placeholder="Search condition, department..."
              className="h-11 w-full rounded-lg border border-[#E7E4E4] pl-10 pr-4 text-sm focus:outline-none"
            />
          </div>
        );
    }
  };

  return (
    // From lg up the header is fixed at 5rem tall and sticks to the top; the
    // sidebar sits under it (lg:top-20 in SideBar.tsx), so change both together.
    <header className="z-30 border-b border-[#E6EFF5] bg-white lg:sticky lg:top-0">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 lg:h-20 lg:px-6 lg:py-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            aria-controls="portal-sidebar"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden rounded-md p-2 hover:bg-gray-100"
          >
            <Menu size={26} />
          </button>
          <Link to="/">
            <img
              className="w-28 sm:w-36 lg:w-52"
              src={Logo}
              alt="MediBridge logo"
            />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 lg:ml-15 justify-start px-8">
          {renderTitle()}
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FA] lg:h-12 lg:w-12">
            <Bell size={20} />
          </span>
          <UserMenu
            user={user}
            isOpen={isUserMenuOpen}
            setIsOpen={setIsUserMenuOpen}
            onLogout={onLogout}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-4 lg:hidden">{renderTitle()}</div>
    </header>
  );
}
