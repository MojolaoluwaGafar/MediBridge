import { useState } from "react";
import { useNavigate } from "react-router";
import { Stethoscope } from "lucide-react";

import Footer from "../Components/Footer";
import LogoutModal from "../Components/LogoutModal";
import Sidebar from "../Components/PatientPageComponents/SideBar";
import Messages from "../Components/PatientPageComponents/Messages/Messages";
import AccountSettings from "../Components/PatientPageComponents/Settings/AccountSettings";
import PortalTopBar from "../Components/PortalComponents/PortalTopBar";
import EmptyState from "../Components/PortalComponents/EmptyState";
import Button from "../Components/Button";
import DoctorNotificationBell from "../Components/DoctorPageComponents/DoctorNotificationBell";
import DoctorDashboard from "../Components/DoctorPageComponents/Dashboard/DoctorDashboard";
import DoctorAppointments from "../Components/DoctorPageComponents/Appointments/DoctorAppointments";
import PatientList from "../Components/DoctorPageComponents/Patients/PatientList";
import PatientProfile from "../Components/DoctorPageComponents/Patients/PatientProfile";
import Availability from "../Components/DoctorPageComponents/Availability/Availability";
import {
  DOCTOR_TAB_TITLES,
  doctorTabs,
  isDoctorTab,
  useDoctorTab,
} from "../Components/DoctorPageComponents/DoctorTabs";
import { useAuth } from "../Hooks/Auth/useAuth";
import { useApiQuery } from "../Hooks/Api/useApiQuery";
import { doctorPortalService } from "../API/services/doctorPortalService";

// The doctor portal. Same shell as the patient portal (top bar, sidebar,
// footer), with the doctor's own tabs. The open tab and patient live in the
// URL (?tab=patients&patient=<id>).
export default function DoctorPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeTab, searchParams, goToTab } = useDoctorTab();
  const me = useApiQuery(doctorPortalService.getMe, "Couldn't load your doctor profile");

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const doctor = me.data;
  const patientId = searchParams.get("patient");
  const doctorName = doctor?.docName ?? `Dr. ${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim();

  const renderContent = () => {
    if (!doctor) {
      if (me.loading || (!me.isFetched && !me.error)) {
        return <p className="py-10 text-center text-[#707070]">Loading your portal…</p>;
      }
      // Most often an account that an admin hasn't linked to a doctor profile yet.
      return (
        <div className="rounded-xl border border-[#D7D7D7] bg-white">
          <EmptyState
            icon={<Stethoscope size={28} />}
            title="Your doctor portal isn't ready yet"
            description={me.error ?? "Please try again in a moment."}
            action={<Button type="button" size="sm" width="w-auto" content="Try again" onClick={() => me.refetch().catch(() => {})} />}
          />
        </div>
      );
    }

    switch (activeTab) {
      case "appointments":
        return <DoctorAppointments />;
      case "patients":
        return patientId ? (
          <PatientProfile key={patientId} patientId={patientId} onBack={() => goToTab("patients")} />
        ) : (
          <PatientList onOpen={(id) => goToTab("patients", { patient: id })} />
        );
      case "availability":
        return <Availability doctor={doctor} onSaved={(saved) => me.setData(saved)} />;
      case "messages":
        return (
          <Messages
            side="doctor"
            contactId={patientId}
            onSelectContact={(id) => goToTab("messages", id ? { patient: id } : {})}
          />
        );
      case "settings":
        return <AccountSettings idLabel="Staff ID" photoHint="Your photo helps patients recognise you." />;
      default:
        return <DoctorDashboard user={user} doctorName={doctorName} />;
    }
  };

  return (
    <>
      <div className="min-h-dvh w-full bg-white">
        <PortalTopBar
          title={<p className="text-xl sm:text-2xl lg:text-[28px] font-medium fontOutfit">{DOCTOR_TAB_TITLES[activeTab]}</p>}
          bell={doctor ? <DoctorNotificationBell /> : null}
          user={user}
          userSubtitle={doctor ? `${doctor.department} Department` : undefined}
          sidebarId="doctor-sidebar"
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
                id="doctor-sidebar"
                ariaLabel="Doctor portal"
                tabs={doctorTabs}
                activeTab={activeTab}
                onSelectTab={(key) => isDoctorTab(key) && goToTab(key)}
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

      {showLogoutModal && <LogoutModal onConfirm={handleLogout} onClose={() => setShowLogoutModal(false)} />}

      <Footer />
    </>
  );
}
