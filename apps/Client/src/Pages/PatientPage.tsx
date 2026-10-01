import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import Footer from "../Components/Footer";
import Dashboard from "../Components/PatientPageComponents/DashBoard/Dashboard";
import Appointments from "../Components/PatientPageComponents/Appointments/Appointments";
import LogoutModal from "../Components/LogoutModal";

import Sidebar from "../Components/PatientPageComponents/SideBar";
import Topbar from "../Components/PatientPageComponents/TopBar";
import { useAuth } from "../Hooks/Auth/useAuth";
import {
  patientTabs,
  isPatientTab,
  DEFAULT_PATIENT_TAB,
  type PatientTabKey,
} from "../Components/PatientPageComponents/PatientTabs";
import Department from "../Components/PatientPageComponents/Departments/Department";
import MedicalRecords from "../Components/PatientPageComponents/MedicalRecords/MedicalRecords";
import Messages from "../Components/PatientPageComponents/Messages/Messages";
import AISupport from "../Components/PatientPageComponents/AISupport/AISupport";
import AccountSettings from "../Components/PatientPageComponents/Settings/AccountSettings";

export default function PatientPage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  // The active tab is in the URL (?tab=messages) so it survives a refresh, the
  // back button works, and other pages can link straight to a tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: PatientTabKey = isPatientTab(tabParam) ? tabParam : DEFAULT_PATIENT_TAB;

  const setActiveTab = (tab: string) => {
    if (!isPatientTab(tab) || tab === activeTab) return;
    // Switching tabs drops the previous tab's own params (e.g. ?contact=).
    setSearchParams(tab === DEFAULT_PATIENT_TAB ? {} : { tab });
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // The top bar search is "Search condition, department...", so typing in it
  // from any tab takes the patient to Departments with the results.
  const handleTopbarSearch = (value: string) => {
    setDepartmentSearchTerm(value);
    setActiveTab("departments");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;

      case "appointments":
        return <Appointments />;

      case "departments":
        return <Department searchTerm={departmentSearchTerm} setSearchTerm={setDepartmentSearchTerm} />;

      case "medRecords":
        return <MedicalRecords />;

      case "messages":
        return <Messages />;

      case "aiSupport":
        return <AISupport />;

      case "settings":
        return <AccountSettings />;
    }
  };

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
          searchTerm={departmentSearchTerm}
          setSearchTerm={handleTopbarSearch}
        />

        <div className="container mx-auto flex flex-col lg:flex-row lg:min-h-[calc(100dvh-5rem)]">

          <Sidebar
            tabs={patientTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={() => setShowLogoutModal(true)}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />

          <main className="min-w-0 flex-1 bg-gray-50 px-4 py-6 sm:p-6 md:p-8 lg:p-10">
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
