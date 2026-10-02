import React, { useEffect } from "react";
import { PiSignOut } from "react-icons/pi";
import { X } from "lucide-react";
import Logo from "../../assets/MediBridgeLogo.svg";

export interface SidebarTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

type Props = {
  tabs: readonly SidebarTab[];
  activeTab: string;
  onSelectTab: (key: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // Shared by the patient and doctor portals; the top bar's menu button
  // points at this id.
  id?: string;
  ariaLabel?: string;
};

// Below the lg breakpoint the sidebar is a slide-in drawer opened from the top
// bar; from lg up it is a fixed column beside the page.
export default function Sidebar({
  tabs,
  activeTab,
  onSelectTab,
  onLogout,
  isOpen,
  setIsOpen,
  id = "patient-sidebar",
  ariaLabel = "Patient portal",
}: Props) {
  // While the drawer is open: Escape closes it and the page behind can't scroll.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id={id}
        aria-label={ariaLabel}
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 max-w-[85vw]
          bg-white
          flex flex-col
          p-6
          overflow-y-auto
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}

          lg:static lg:z-auto
          lg:translate-x-0
          lg:max-w-none lg:shrink-0
          lg:shadow-none
        `}
      >
        <div className="flex items-center justify-between pb-6 lg:hidden">
          <img className="w-32" src={Logo} alt="MediBridge" />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  onSelectTab(tab.key);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full min-h-12 px-4 rounded-md transition text-left
                  ${
                    isActive
                      ? "bg-[#28574E] text-white"
                      : "text-[#605E5E] hover:bg-gray-100"
                  }`}
              >
                <span className="shrink-0">{tab.icon}</span>

                <span className="text-sm sm:text-base font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            onLogout();
          }}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-md text-red-700 hover:bg-red-50 transition"
        >
          <PiSignOut size={22} />

          <span className="text-sm sm:text-base font-medium">
            Log out
          </span>
        </button>
      </aside>
    </>
  );
}
