import React, { useState } from "react";
import Topbar from "../PatientPageComponents/TopBar";
import Sidebar, { type SidebarTab } from "../PatientPageComponents/SideBar";
import LogoutModal from "../LogoutModal";
import type { AuthUser } from "../../types/auth";

type Props = {
  user: AuthUser | null;
  tabs: SidebarTab[];
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  onLogout: () => void;
  pageTitles?: Record<string, string>;
  searchPlaceholder?: string;
  children: React.ReactNode;
};

// The patient portal's shell (top bar, sidebar, grey content area), shared by
// the doctor and admin portals so all three look and behave the same.
export default function PortalLayout({
  user,
  tabs,
  activeTab,
  setActiveTab,
  onLogout,
  pageTitles,
  searchPlaceholder,
  children,
}: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div className="min-h-screen w-full bg-white">
        <Topbar
          activeTab={activeTab}
          user={user}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          onLogout={() => setShowLogoutModal(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pageTitles={pageTitles}
          searchPlaceholder={searchPlaceholder}
        />

        <div className="container mx-auto flex flex-col lg:flex-row px-4 sm:px-6 lg:px-0">
          <Sidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={() => setShowLogoutModal(true)}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />

          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50">
            {children}
          </main>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={onLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}
