import { useState } from "react";
import PortalLayout from "../Components/PortalComponents/PortalLayout";
import { doctorTabs } from "../Components/DoctorPageComponents/DoctorTabs";
import { adminTabs } from "../Components/AdminPageComponents/AdminTabs";
import DoctorDashboard from "../Components/DoctorPageComponents/DoctorDashboard";
import DoctorAppointments from "../Components/DoctorPageComponents/DoctorAppointments";
import PatientProfile from "../Components/DoctorPageComponents/PatientProfile";
import AdminDashboard from "../Components/AdminPageComponents/AdminDashboard";
import FlagsReview from "../Components/AdminPageComponents/FlagsReview";
import DoctorsList from "../Components/AdminPageComponents/DoctorsList";
import type { SidebarTab } from "../Components/PatientPageComponents/SideBar";
import type { AuthUser } from "../types/auth";
import {
  TODAY,
  adminActivities,
  adminUser,
  doctorActivities,
  doctorAppointments,
  doctorUser,
  elenaNotes,
  elenaRecords,
  flags,
  patients,
  portalDoctors,
} from "./sampleData";

const DOCTOR_TITLES = { dashboard: "Dashboard" };
const DOCTOR_SEARCH = "Search patients by name or Patient ID";

// One full-size screen. The transform makes position:fixed modals stay inside
// the frame instead of covering the whole preview page.
function Frame({
  name,
  user,
  tabs,
  tab,
  searchPlaceholder,
  children,
}: {
  name: string;
  user: AuthUser;
  tabs: SidebarTab[];
  tab: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(tab);
  return (
    <section className="flex flex-col gap-3">
      <p className="fontOutfit text-[15px] text-[#605E5E]">{name}</p>
      <div
        data-frame={name}
        className="relative overflow-hidden rounded-md bg-white shadow-[0_8px_28px_rgba(20,27,25,0.08)]"
        style={{ width: 1440, transform: "translateZ(0)" }}
      >
        <PortalLayout
          user={user}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => undefined}
          pageTitles={DOCTOR_TITLES}
          searchPlaceholder={searchPlaceholder}
        >
          {children}
        </PortalLayout>
      </div>
    </section>
  );
}

export default function PortalPreview() {
  const todays = doctorAppointments.filter((a) => a.date === TODAY);
  const elenaNow = doctorAppointments.find((a) => a._id === "ap2")!;
  const elenaHistory = doctorAppointments.filter((a) => a.patient._id === patients.elena._id);
  const marcusNow = doctorAppointments.find((a) => a._id === "ap3")!;
  const newFlags = flags.filter((f) => f.status === "new");

  return (
    <div className="min-h-screen bg-[#EEF1F0] px-10 py-10 flex flex-col gap-14" style={{ width: 1520 }}>
      <header className="fontOutfit">
        <h1 className="text-[32px] font-semibold text-[#141313]">MediBridge · Doctor and admin portals</h1>
        <p className="max-w-3xl text-[16px] text-[#605E5E]">
          Built from the patient portal's own components (top bar, sidebar, greeting banner, cards, tabs and
          buttons) with sample data. Capture this page with html.to.design to bring the screens into Figma.
        </p>
      </header>

      <Frame name="Doctor · Dashboard" user={doctorUser} tabs={doctorTabs} tab="dashboard">
        <DoctorDashboard
          user={doctorUser}
          department="Cardiology"
          todaysAppointments={todays}
          stats={{ patientsThisWeek: 18, urgentThisWeek: 2, recordsShared: 5 }}
          activities={doctorActivities}
        />
      </Frame>

      <Frame name="Doctor · Appointments" user={doctorUser} tabs={doctorTabs} tab="appointments" searchPlaceholder={DOCTOR_SEARCH}>
        <DoctorAppointments appointments={doctorAppointments} today={TODAY} initialTab="Upcoming" />
      </Frame>

      <Frame name="Doctor · Patient profile" user={doctorUser} tabs={doctorTabs} tab="patients" searchPlaceholder={DOCTOR_SEARCH}>
        <PatientProfile
          patient={patients.elena}
          currentAppointment={elenaNow}
          history={elenaHistory}
          records={elenaRecords}
          notes={elenaNotes}
        />
      </Frame>

      <Frame name="Doctor · Patient profile · records not shared" user={doctorUser} tabs={doctorTabs} tab="patients" searchPlaceholder={DOCTOR_SEARCH}>
        <PatientProfile
          patient={patients.marcus}
          currentAppointment={marcusNow}
          history={[marcusNow]}
          records={[]}
          notes={[]}
        />
      </Frame>

      <Frame name="Admin · Dashboard" user={adminUser} tabs={adminTabs} tab="dashboard">
        <AdminDashboard
          user={adminUser}
          stats={{ patients: 1284, doctors: 4, doctorsNotLinked: 2, appointmentsThisWeek: 76 }}
          newFlags={newFlags}
          activities={adminActivities}
        />
      </Frame>

      <Frame name="Admin · AI Safety Flags" user={adminUser} tabs={adminTabs} tab="flags" searchPlaceholder="Search flags by patient or Patient ID">
        <FlagsReview flags={flags} />
      </Frame>

      <Frame name="Admin · AI Safety Flags · review" user={adminUser} tabs={adminTabs} tab="flags" searchPlaceholder="Search flags by patient or Patient ID">
        <FlagsReview flags={flags} initialReviewing={flags[0]} />
      </Frame>

      <Frame name="Admin · Doctors" user={adminUser} tabs={adminTabs} tab="doctors" searchPlaceholder="Search doctors or departments">
        <DoctorsList doctors={portalDoctors} />
      </Frame>
    </div>
  );
}
