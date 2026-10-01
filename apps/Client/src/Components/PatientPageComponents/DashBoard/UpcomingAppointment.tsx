import AppointmentCard from "./AppointmentCard";
import type { IAppointment } from "../../../types/appointment";
import EmptyAppointmentState from "./EmptyAppointmentState";

type Props = {
  loading?: boolean;
  error: string | null;
  appointment: IAppointment | null;
  onView: (appointment: IAppointment) => void;
  onBookAppointment: () => void;
  onReschedule: (appointment: IAppointment) => void;
  // From the Dashboard, which owns the appointment list and refreshes it.
  onCancel: (appointment: IAppointment) => void;
};

export default function UpcomingAppointmentSection({
  loading,
  error,
  appointment,
  onView,
  onBookAppointment,
  onReschedule,
  onCancel,
}: Props) {
  return (
    <div className="w-full xl:w-2/3 flex flex-col gap-4 fontOutfit">
      <p className="text-xl sm:text-2xl font-medium">
        Upcoming Appointment
      </p>

      {loading ? (
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
          onCancel={onCancel}
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