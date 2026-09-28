import React from "react";
import { PiSignOut } from "react-icons/pi";

export interface SidebarTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

type Props = {
  tabs: SidebarTab[];
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  setIsOpen,
}: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          bg-white shadow-xl
          flex flex-col
          p-6
          transform transition-transform duration-300
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }

          lg:static
          lg:translate-x-0
          lg:h-auto
          lg:w-72
          lg:border-r
          lg:border-[#E6EFF5]
          lg:shadow-lg
        `}
      >
        <nav className="flex flex-col gap-2 flex-1 mt-10 lg:mt-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full min-h-[48px] px-4 rounded-md transition text-left
                ${
                  activeTab === tab.key
                    ? "bg-[#28574E] text-white"
                    : "text-[#605E5E] hover:bg-gray-100"
                }`}
            >
              <span className="flex-shrink-0">{tab.icon}</span>

              <span className="text-sm sm:text-base font-medium">
                {tab.label}
              </span>
            </button>
          ))}
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
      </div>
    </>
  );
}