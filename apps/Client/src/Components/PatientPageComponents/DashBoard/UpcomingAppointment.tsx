import AppointmentCard from "./AppointmentCard";
import type { IAppointment } from "../../../types/appointment";
import EmptyAppointmentState from "./EmptyAppointmentState";
import { appointmentService } from "../../../API/services/appointmentService";
import { useAppointments } from "../../../Hooks/Appointments/useAppointments";

type Props = {
  loading?: boolean;
  showLoading?: boolean;
  error: string | null;
  appointment: IAppointment | null;
  onView: (appointment: IAppointment) => void;
  onBookAppointment: () => void;
  onReschedule: (appointment: IAppointment) => void;
};

export default function UpcomingAppointmentSection({
  showLoading,
  error,
  appointment,
  onView,
  onBookAppointment,
  onReschedule,
}: Props) {
  const { fetchAppointments } = useAppointments();

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full xl:w-2/3 flex flex-col gap-4 fontOutfit">
      <p className="text-xl sm:text-2xl font-medium">
        Upcoming Appointment
      </p>

      {showLoading ? (
        <div className="flex items-center justify-center min-h-[320px] rounded-xl border border-[#D7D7D7]">
          <p className="text-[#666666]">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[320px] rounded-xl border border-[#D7D7D7]">
          <p className="text-red-500">{error}</p>
        </div>
      ) : appointment ? (
        <AppointmentCard
          appointment={appointment}
          onView={onView}
          onReschedule={onReschedule}
          onCancel={handleCancel}
        />
      ) : (
        <EmptyAppointmentState
          title="No upcoming appointments"
          description="You don’t have any scheduled hospital visits yet. Once you book an appointment, it will appear here."
          onButtonClick={onBookAppointment}
        />
      )}
    </div>
  );
}