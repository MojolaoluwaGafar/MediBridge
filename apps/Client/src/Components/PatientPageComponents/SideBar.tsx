import React, { useEffect } from "react";
import { X } from "lucide-react";
import { PiSignOut } from "react-icons/pi";
import Logo from "../../assets/MediBridgeLogo.svg";

export interface SidebarTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

type Props = {
  tabs: readonly SidebarTab[];
  activeTab: string;
  setActiveTab: (key: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// Below lg the sidebar is a slide-in drawer opened from the top bar's menu
// button. From lg up it is a column that stays in view while the page scrolls.
export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  setIsOpen,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="portal-sidebar"
        aria-label="Portal navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 max-w-[85vw] flex-col
          overflow-y-auto bg-white p-6
          transition-transform duration-300
          ${isOpen ? "translate-x-0 shadow-xl" : "invisible -translate-x-full"}

          lg:visible lg:sticky lg:top-20 lg:bottom-auto lg:z-auto lg:max-w-none
          lg:h-[calc(100dvh-5rem)] lg:translate-x-0
          lg:shrink-0 lg:border-r lg:border-[#E6EFF5] lg:shadow-none
        `}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <img className="w-32" src={Logo} alt="MediBridge" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  setActiveTab(tab.key);
                  setIsOpen(false);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-md px-4 text-left transition
                  ${active ? "bg-[#28574E] text-white" : "text-[#605E5E] hover:bg-gray-100"}`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
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
          className="mt-6 flex items-center gap-3 rounded-md px-4 py-3 text-red-700 transition hover:bg-red-50"
        >
          <PiSignOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </aside>
    </>
  );
}
