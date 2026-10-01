import { useState } from "react";
import { useNavigate } from "react-router";

import Footer from "../Components/Footer";
import Dashboard from "../Components/PatientPageComponents/DashBoard/Dashboard";
import Appointments from "../Components/PatientPageComponents/Appointments/Appointments";
import Department from "../Components/PatientPageComponents/Departments/Department";
import MedicalRecords from "../Components/PatientPageComponents/MedicalRecords/MedicalRecords";
import Messages from "../Components/PatientPageComponents/Messages/Messages";
import AISupport from "../Components/PatientPageComponents/AISupport/AISupport";
import AccountSettings from "../Components/PatientPageComponents/Settings/AccountSettings";
import LogoutModal from "../Components/LogoutModal";

import Sidebar from "../Components/PatientPageComponents/SideBar";
import Topbar from "../Components/PatientPageComponents/TopBar";
import { useAuth } from "../Hooks/Auth/useAuth";
import { usePatientTab } from "../Hooks/Portal/usePatientTab";
import {
  patientTabs,
  isPatientTab,
} from "../Components/PatientPageComponents/PatientTabs";

export default function PatientPage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { activeTab, searchParams, goToTab } = usePatientTab();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // The top bar searches conditions and departments, so typing from any other
  // tab takes the patient to the Departments tab with the results.
  const handleSearchChange = (value: string) => {
    setDepartmentSearchTerm(value);
    if (activeTab !== "departments") goToTab("departments");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return <Appointments />;

      case "departments":
        return (
          <Department
            searchTerm={departmentSearchTerm}
            setSearchTerm={setDepartmentSearchTerm}
          />
        );

      case "medRecords":
        return <MedicalRecords />;

      case "messages":
        return (
          <Messages
            contactId={searchParams.get("doctor")}
            onSelectContact={(id) => goToTab("messages", id ? { doctor: id } : {})}
          />
        );

      case "aiSupport":
        return <AISupport />;

      case "settings":
        return <AccountSettings />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div className="min-h-dvh w-full bg-white">
        <Topbar
          activeTab={activeTab}
          user={user}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          onLogout={() => setShowLogoutModal(true)}
          onOpenSettings={() => goToTab("settings")}
          searchTerm={departmentSearchTerm}
          onSearchChange={handleSearchChange}
        />

        <div className="container mx-auto flex flex-col lg:flex-row">
          {/* On desktop the sidebar sticks under the 80px top bar and fills the
              rest of the screen, so Log out stays visible on long pages. The
              outer column carries the border so it runs the full page height. */}
          <div className="lg:border-r lg:border-[#E6EFF5]">
            <div className="lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)]">
              <Sidebar
                tabs={patientTabs}
                activeTab={activeTab}
                onSelectTab={(key) => isPatientTab(key) && goToTab(key)}
                onLogout={() => setShowLogoutModal(true)}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
              />
            </div>
          </div>

          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 lg:min-h-[calc(100dvh-5rem)]">
            {renderContent()}
          </main>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}

      <Footer />
    </>
  );
}
