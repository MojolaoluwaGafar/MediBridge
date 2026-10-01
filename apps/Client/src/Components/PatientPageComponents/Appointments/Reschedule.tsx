import { useState } from "react";
import { X, CircleAlert } from "lucide-react";

import Button from "../../Button";
import ViewRescheduledAppointment from "./ViewRescheduledAppointment";
import RescheduledConfirmationModal from "./RescheduledConfirmationModal";
import { appointmentService } from "../../../API/services/appointmentService";
import SlotPicker from "../BookingAppointment/SlotPicker";
import { usePatientTab } from "../../../Hooks/Portal/usePatientTab";
import { apiErrorMessage, apiFieldErrors } from "../../../utils/apiError";
import { formatDateString, todayDateString } from "../../../utils/formatDate";

import type { IAppointment } from "../../../types/appointment";

type Props = {
  appointment: IAppointment;
  onClose: () => void;
  onRescheduled: (appointment: IAppointment) => void;
};

export default function Reschedule({
  appointment,
  onClose,
  onRescheduled,
}: Props) {
  const doctor = appointment.doctor;

  const [selectedDate, setSelectedDate] = useState<string | null>(appointment.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(appointment.time);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const { goToTab } = usePatientTab();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [updatedAppointment, setUpdatedAppointment] =
    useState<IAppointment | null>(null);

  // Same rule as the server (RESCHEDULE_NOTICE_DAYS): whole days between
  // today and the appointment, from date strings so time zones can't shift it.
  const daysUntil = Math.round(
    (Date.parse(`${appointment.date}T00:00:00Z`) - Date.parse(`${todayDateString()}T00:00:00Z`)) / 86_400_000
  );
  const canReschedule = appointment.status === "confirmed" && daysUntil >= 7;

  const handleNext = () => {
    if (!selectedDate || !selectedTime) return;

    setShowReview(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { appointment: updatedAppointment } =
        await appointmentService.rescheduleAppointment({
          id: appointment._id,
          date: selectedDate,
          time: selectedTime,
        });

      setUpdatedAppointment(updatedAppointment);

      setShowReview(false);
      setShowConfirmation(true);
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't reschedule this appointment. Please try again."));
      // The slot went (or the date isn't valid): pick again with fresh slots.
      if (apiFieldErrors(err).some((e) => e.field === "date" || e.field === "time")) {
        setSelectedTime(null);
        setSlotRefresh((n) => n + 1);
        setShowReview(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (showConfirmation && selectedDate && selectedTime) {
    const day = formatDateString(selectedDate);

    return (
      <RescheduledConfirmationModal
        docName={doctor.docName}
        day={day}
        time={selectedTime}
        onMessageDoctor={() => {
          onClose();
          if (doctor._id) goToTab("messages", { doctor: doctor._id });
        }}
        onViewAppointment={() => {
          if (!updatedAppointment) return;
          onRescheduled(updatedAppointment);
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

  if (showReview && selectedDate && selectedTime) {
    return (
      <ViewRescheduledAppointment
        appointment={appointment}
        newDate={selectedDate}
        newTime={selectedTime}
        saving={saving}
        error={error}
        onBack={() => setShowReview(false)}
        onClose={onClose}
        onRescheduled={handleConfirmReschedule}
      />
    );
  }

  if (!canReschedule) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 sm:p-8 text-center">
          <CircleAlert
            size={40}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="mb-2 text-xl font-semibold">
            Unable to Reschedule
          </h2>

          <p className="mb-6 text-gray-600">
            {appointment.status !== "confirmed"
              ? "Only upcoming appointments can be rescheduled."
              : "Appointments can only be rescheduled at least 7 days before the scheduled date. Please contact the hospital to change it."}
          </p>

          <Button
            type="button"
            content="Close"
            onClick={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">

        <button
          type="button"
          className="absolute right-5 top-5"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h1 className="px-6 pt-6 fontOutfit text-xl sm:text-2xl font-semibold">
          Reschedule Appointment
        </h1>

        <p className="px-6 text-sm sm:text-base fontOutfit text-[#605E5E]">
          Select a new appointment date and time.
        </p>

        <div className="mt-5 h-px bg-[#E7E4E4]" />

        <div className="px-4 py-6 sm:px-6">

          <div className="mb-6 flex items-start gap-3 rounded-lg bg-[#EAF4FF] p-4">
            <CircleAlert
              size={20}
              color="#0079FF"
              className="shrink-0 mt-0.5"
            />

            <p className="text-sm text-[#3E3B3B]">
              You can only reschedule appointments at least 7 days before the
              scheduled date.
            </p>
          </div>

          <SlotPicker
            doctorId={doctor._id}
            appointmentId={appointment._id}
            date={selectedDate}
            time={selectedTime}
            refreshKey={slotRefresh}
            onDateChange={(date) => {
              setSelectedDate(date);
              setSelectedTime(null);
              setError(null);
            }}
            onTimeChange={setSelectedTime}
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              content="Keep Appointment"
              width="w-full sm:w-auto"
              onClick={onClose}
            />

            <Button
              type="button"
              content="Next"
              width="w-full sm:w-auto"
              onClick={handleNext}
              disabled={!selectedDate || !selectedTime}
            />

          </div>

        </div>
      </div>
    </div>
  );
}