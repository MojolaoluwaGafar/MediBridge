import { useState } from "react";
import Button from "../../Button";
import Tabs from "./Tabs";
import { useAppointments } from "../../../Hooks/Appointments/useAppointments";
import Card from "./Card";
import { useAppointmentModals } from "../../../Hooks/Appointments/useAppointmentModals";
import ViewAppointmentModal from "../DashBoard/ViewAppointmentModal";
import Reschedule from "./Reschedule";
import BookAppointmentModal from "../DashBoard/BookAppointmentModal";
import { useCancelAppointment } from "../../../Hooks/Appointments/useCancelAppointment";
import { isCompleted, isUpcoming } from "../../../utils/appointmentStatus";
import EmptyAppointmentState from "../DashBoard/EmptyAppointmentState";

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<string>("Upcoming");
  const [showBooking, setShowBooking] = useState<boolean>(false);

  const { appointments, fetchAppointments } = useAppointments();

  const {
    selectedAppointment,
    setSelectedAppointment,
    appointmentToReschedule,
    setAppointmentToReschedule,
    handleView,
    handleReschedule,
  } = useAppointmentModals();

  // Each appointment belongs to exactly one tab. Past confirmed visits count
  // as completed even before the server has marked them.
  const tabOf = (appointment: (typeof appointments)[number]) =>
    isUpcoming(appointment) ? "Upcoming" : isCompleted(appointment) ? "Completed" : appointment.status === "cancelled" ? "Cancelled" : null;

  const upcomingCount = appointments.filter((a) => tabOf(a) === "Upcoming").length;
  const completedCount = appointments.filter((a) => tabOf(a) === "Completed").length;
  const cancelledCount = appointments.filter((a) => tabOf(a) === "Cancelled").length;

  const { requestCancel, dialog: cancelDialog } = useCancelAppointment(() => void fetchAppointments().catch(() => {}));

  const tabs = [
    {
      key: "Upcoming",
      label: "Upcoming",
      appointment: upcomingCount,
    },
    {
      key: "Completed",
      label: "Completed",
      appointment: completedCount,
    },
    {
      key: "Cancelled",
      label: "Cancelled",
      appointment: cancelledCount,
    },
  ];

  const filteredAppointments = appointments.filter((appointment) => tabOf(appointment) === activeTab);
  // Soonest first for upcoming (the server's order); most recent first for past ones.
  if (activeTab !== "Upcoming") filteredAppointments.reverse();

  return (
    <>
      {cancelDialog}

      {selectedAppointment && (
        <ViewAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
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

      {showBooking && (
        <BookAppointmentModal
          onClose={() => setShowBooking(false)}
          onBooked={fetchAppointments}
        />
      )}

      <div className="w-full">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div>
            <h1 className="fontOutfit font-semibold text-2xl">
              Appointments
            </h1>

            <p className="text-[#707070] text-base font-light">
              Manage your visits and continue your care.
            </p>
          </div>

          <Button
            onClick={() => setShowBooking(true)}
            width="w-full lg:w-[250px]"
            type="button"
            content="Book New Appointment"
          />

        </div>

        <div className="mt-6 overflow-x-auto">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        <div className="mt-8">
          {filteredAppointments.length === 0 ? (
            <EmptyAppointmentState
              title={`No ${activeTab.toLowerCase()} appointments`}
              description={
                activeTab === "Upcoming"
                  ? "You don't have any upcoming appointments. Once you book one, it will appear here."
                  : activeTab === "Completed"
                  ? "You haven't completed any appointments yet."
                  : "You don't have any cancelled appointments."
              }
              showButton={activeTab === "Upcoming"}
              buttonText="Book Appointment"
              onButtonClick={() => setShowBooking(true)}
            />
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <Card
                  key={appointment._id}
                  appointment={appointment}
                  onView={handleView}
                  onReschedule={handleReschedule}
                  onCancel={requestCancel}
                  onBookAgain={() => setShowBooking(true)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}