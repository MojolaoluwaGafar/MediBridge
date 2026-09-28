import { useState, useEffect, useMemo } from "react";

import { useAuth } from "../../../Hooks/Auth/useAuth";
import { useAppointments } from "../../../Hooks/Appointments/useAppointments";
import { useActivities } from "../../../Hooks/Activities/useActivities";
import { useAppointmentModals } from "../../../Hooks/Appointments/useAppointmentModals";

import DashboardGreeting from "./DashboardGreeting";
import UpcomingAppointment from "./UpcomingAppointment";
import QuickActions from "./QuickActions";
import RecentActivities from "./RecentActivities";
import BookAppointmentModal from "./BookAppointmentModal";
import ViewAppointmentModal from "./ViewAppointmentModal";
import Reschedule from "../Appointments/Reschedule";

export default function Dashboard() {
    const [showBooking, setShowBooking] = useState(false);
    const [delayedLoading, setDelayedLoading] = useState<boolean>(false);
    const { user } = useAuth();

    const {
        appointments,
        loading,
        error,
        fetchAppointments
    } = useAppointments();

    const {
    selectedAppointment,
    setSelectedAppointment,
    appointmentToReschedule,
    setAppointmentToReschedule,
    handleView,
    handleReschedule,
    } = useAppointmentModals();

    const {
        activities,
    } = useActivities();

    useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (loading) {
        timer = setTimeout(() => {
            setDelayedLoading(true);
        }, 150);
    } else {
        clearTimeout(timer);
    }

    return () => {
        if (timer) {
            clearTimeout(timer);
            setDelayedLoading(false);
        }
    };
    }, [loading]);

    const upcomingAppointments = useMemo(() =>
        appointments.filter((appointment) => {
            const status = appointment.status.toLowerCase();

        return status === "confirmed" || status === "upcoming";
    }),
    [appointments]);

    const upcomingAppointment = upcomingAppointments[0] ?? null;

    return (
    <div className="w-full px-4 md:px-0">
      {selectedAppointment && (
        <ViewAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {showBooking && (
        <BookAppointmentModal
          onClose={() => setShowBooking(false)}
          onBooked={fetchAppointments}
        />
      )}

      {appointmentToReschedule && (
        <Reschedule
          appointment={appointmentToReschedule}
          onClose={() => setAppointmentToReschedule(null)}
          onRescheduled={async (updatedAppointment) => {
            setAppointmentToReschedule(null);
            await fetchAppointments();
            setSelectedAppointment(updatedAppointment);
          }}
        />
      )}

      <DashboardGreeting user={user} />

      <div className="flex flex-col w-full lg:flex-row justify-between gap-6 lg:gap-10 py-8">
        <UpcomingAppointment
          appointment={upcomingAppointment}
          loading={delayedLoading}
          error={error}
          onBookAppointment={() => setShowBooking(true)}
          onView={handleView}
          onReschedule={handleReschedule}
        />

        <QuickActions onBookAppointment={() => setShowBooking(true)} />
      </div>

      <h2 className="py-3 text-lg md:text-[24px] font-medium fontOutfit">
        Recent Activities
      </h2>

      <div className="border border-[#D7D7D7] rounded-xl p-4">
        <RecentActivities activities={activities} />
      </div>
    </div>
  )
}