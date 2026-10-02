import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router";
import Logo from "../../assets/MediBridgeLogo.svg";
import UserMenu from "../PatientPageComponents/UserMenu";
import type { AuthUser } from "../../Hooks/Auth/useAuth";

type Props = {
  // Middle of the bar on desktop, under it on phones: a page title or a search box.
  title: ReactNode;
  bell: ReactNode;
  user: AuthUser | null;
  userSubtitle?: string;
  sidebarId: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
  onOpenSettings: () => void;
};

// The top bar shared by the patient and doctor portals: menu button and logo,
// the page's title area, then notifications and the user menu.
export default function PortalTopBar({
  title,
  bell,
  user,
  userSubtitle,
  sidebarId,
  isSidebarOpen,
  setIsSidebarOpen,
  isUserMenuOpen,
  setIsUserMenuOpen,
  onLogout,
  onOpenSettings,
}: Props) {
  return (
    <header className="border-b border-[#E6EFF5] bg-white lg:sticky lg:top-0 lg:z-30">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 lg:h-20 lg:py-0 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden rounded-md p-2 hover:bg-gray-100"
            aria-label="Open menu"
            aria-controls={sidebarId}
            aria-expanded={isSidebarOpen}
          >
            <Menu size={26} />
          </button>
          <Link to="/">
            <img className="w-28 sm:w-36 lg:w-52" src={Logo} alt="MediBridge logo" />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 lg:ml-15 justify-start px-8">{title}</div>

        <div className="flex items-center gap-3 lg:gap-5">
          {bell}
          <UserMenu
            user={user}
            subtitle={userSubtitle}
            isOpen={isUserMenuOpen}
            setIsOpen={setIsUserMenuOpen}
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>

      <div className="px-4 pb-4 lg:hidden">{title}</div>
    </header>
  );
}
