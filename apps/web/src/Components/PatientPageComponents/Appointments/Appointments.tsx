import { useState } from "react";
import Button from "../../Button";
import Tabs from "./Tabs";
import { useAppointments } from "../../../Hooks/Appointments/useAppointments";
import Card from "./Card";
import { useAppointmentModals } from "../../../Hooks/Appointments/useAppointmentModals";
import ViewAppointmentModal from "../DashBoard/ViewAppointmentModal";
import Reschedule from "./Reschedule";
import BookAppointmentModal from "../DashBoard/BookAppointmentModal";
import { appointmentService } from "../../../API/services/appointmentService";
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

  const completedCount = appointments.filter(
    (appointment) => appointment.status.toLowerCase() === "completed"
  ).length;

  const upcomingCount = appointments.filter(
    (appointment) =>
      appointment.status.toLowerCase() === "confirmed" ||
      appointment.status.toLowerCase() === "upcoming"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status.toLowerCase() === "cancelled"
  ).length;

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

  const filteredAppointments = appointments.filter((appointment) => {
    switch (activeTab) {
      case "Upcoming":
        return (
          appointment.status.toLowerCase() === "confirmed" ||
          appointment.status.toLowerCase() === "upcoming"
        );

      case "Completed":
        return appointment.status.toLowerCase() === "completed";

      case "Cancelled":
        return appointment.status.toLowerCase() === "cancelled";

      default:
        return true;
    }
  });

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
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
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}