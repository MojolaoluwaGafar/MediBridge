import { useState } from "react";
import { useNavigate } from "react-router";

import Footer from "../Components/Footer";
import LogoutModal from "../Components/LogoutModal";
import Sidebar from "../Components/PatientPageComponents/SideBar";
import AccountSettings from "../Components/PatientPageComponents/Settings/AccountSettings";
import PortalTopBar from "../Components/PortalComponents/PortalTopBar";
import AdminBell from "../Components/AdminPageComponents/AdminBell";
import Overview from "../Components/AdminPageComponents/Overview";
import PatientsList from "../Components/AdminPageComponents/Patients/PatientsList";
import PatientDetail from "../Components/AdminPageComponents/Patients/PatientDetail";
import DoctorsList from "../Components/AdminPageComponents/Doctors/DoctorsList";
import DoctorDetail from "../Components/AdminPageComponents/Doctors/DoctorDetail";
import Departments from "../Components/AdminPageComponents/Departments";
import SafetyAlerts from "../Components/AdminPageComponents/SafetyAlerts";
import AdminAccounts from "../Components/AdminPageComponents/AdminAccounts";
import { adminTabs, isAdminTab, useAdminTab } from "../Components/AdminPageComponents/AdminTabs";
import { useAuth } from "../Hooks/Auth/useAuth";

// The admin portal. Same shell as the patient and doctor portals. The open
// tab and record live in the URL (?tab=patients&patient=<id>).
export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeTab, searchParams, goToTab } = useAdminTab();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const patientId = searchParams.get("patient");
  const doctorId = searchParams.get("doctor");
  const startNew = searchParams.get("new") === "1";
  const title = adminTabs.find((t) => t.key === activeTab)?.label ?? "Overview";

  const renderContent = () => {
    switch (activeTab) {
      case "patients":
        return patientId ? (
          <PatientDetail key={patientId} patientId={patientId} onBack={() => goToTab("patients")} />
        ) : (
          <PatientsList startRegistering={startNew} onOpen={(id) => goToTab("patients", { patient: id })} />
        );
      case "doctors":
        return doctorId ? (
          <DoctorDetail key={doctorId} doctorId={doctorId} onBack={() => goToTab("doctors")} />
        ) : (
          <DoctorsList startAdding={startNew} onOpen={(id) => goToTab("doctors", { doctor: id })} />
        );
      case "departments":
        return <Departments />;
      case "alerts":
        return <SafetyAlerts />;
      case "staff":
        return <AdminAccounts />;
      case "settings":
        return <AccountSettings idLabel="Staff ID" photoHint="Your photo helps colleagues recognise you." />;
      default:
        return <Overview user={user} />;
    }
  };

  return (
    <>
      <div className="min-h-dvh w-full bg-white">
        <PortalTopBar
          title={<p className="text-xl sm:text-2xl lg:text-[28px] font-medium fontOutfit">{title}</p>}
          bell={<AdminBell />}
          user={user}
          userSubtitle="Hospital admin"
          sidebarId="admin-sidebar"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          onLogout={() => setShowLogoutModal(true)}
          onOpenSettings={() => goToTab("settings")}
        />

        <div className="container mx-auto flex flex-col lg:flex-row">
          <div className="lg:border-r lg:border-[#E6EFF5]">
            <div className="lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)]">
              <Sidebar
                id="admin-sidebar"
                ariaLabel="Admin portal"
                tabs={adminTabs}
                activeTab={activeTab}
                onSelectTab={(key) => isAdminTab(key) && goToTab(key)}
                onLogout={() => setShowLogoutModal(true)}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
              />
            </div>
          </div>

          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 lg:min-h-[calc(100dvh-5rem)]">{renderContent()}</main>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          onClose={() => setShowLogoutModal(false)}
        />
      )}

      <Footer />
    </>
  );
}
