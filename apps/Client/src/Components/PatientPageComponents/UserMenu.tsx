import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { PiSignOut } from "react-icons/pi";
import UserAvatar from "../../assets/user-avatar-filled-svgrepo-com.svg";
import type { AuthUser } from "../../types";

type Props = {
  user: AuthUser | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
  onOpenSettings?: () => void;
  // The line under the name; the email unless the portal shows something else.
  subtitle?: string;
};

export default function UserMenu({
  user,
  isOpen,
  setIsOpen,
  onLogout,
  onOpenSettings,
  subtitle,
}: Props) {
  const secondLine = subtitle ?? user?.email;
  return (
    <div className="relative flex items-center gap-2 sm:gap-3">
      <img
        src={user?.img || UserAvatar}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
        alt=""
      />

      <div className="hidden md:flex items-center gap-2">
        <div className="text-sm fontOutfit leading-tight">
          <p className="font-medium truncate max-w-[140px]">
            {user?.firstname} {user?.lastname}
          </p>

          <p className="text-[#666666] text-xs truncate max-w-[160px]">
            {secondLine}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1"
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="md:hidden p-1"
      >
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div
          className="motion-safe:animate-drop-in absolute top-14 right-0 sm:top-16 bg-white rounded-lg shadow-lg border border-[#E7E4E4] p-3 w-52 z-50"
        >
          <div className="md:hidden border-b border-[#E7E4E4] pb-3 mb-3">
            <p className="font-medium text-sm">
              {user?.firstname} {user?.lastname}
            </p>

            <p className="text-xs text-[#666666] break-all">
              {secondLine}
            </p>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              className="flex items-center gap-2 pb-3 text-[#605E5E] hover:text-[#28574E] transition"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
            >
              <Settings size={18} />
              Account settings
            </button>
          )}

          <button
            type="button"
            className="flex items-center gap-2 text-red-700 hover:text-red-800 transition"
            onClick={onLogout}
          >
            <PiSignOut size={18} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}