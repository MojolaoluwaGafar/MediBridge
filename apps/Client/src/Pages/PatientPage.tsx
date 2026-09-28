// import UnderConstruction from "../Components/UnderConstruction"
// import PagenotReady from "../Components/PatientPageComponents/PagenotReady"
import { useState } from "react";
import { useNavigate } from "react-router";

import Footer from "../Components/Footer";
import Dashboard from "../Components/PatientPageComponents/DashBoard/Dashboard";
import Appointments from "../Components/PatientPageComponents/Appointments/Appointments";
import LogoutModal from "../Components/LogoutModal";

import Sidebar from "../Components/PatientPageComponents/SideBar";
import Topbar from "../Components/PatientPageComponents/TopBar";
import { useAuth } from "../Hooks/Auth/useAuth";
import { patientTabs } from "../Components/PatientPageComponents/PatientTabs";
import Department from "../Components/PatientPageComponents/Departments/Department";

export default function PatientPage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
        return <Department searchTerm={departmentSearchTerm} setSearchTerm={setDepartmentSearchTerm} />
        // return <PagenotReady />;

      // case "medRecords":
      //   return <p>Medical Records</p>;

      // case "messages":
      //   return <p>Messages</p>;

      // case "aiSupport":
      //   return <p>AI Support</p>;

      // case "settings":
      //   return <p>Settings</p>;

      default:
        return null;
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
          setSearchTerm={setDepartmentSearchTerm}
        />

        <div className="container mx-auto flex flex-col lg:flex-row px-4 sm:px-6 lg:px-0">

          <Sidebar
            tabs={patientTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={() => setShowLogoutModal(true)}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />

          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50">
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