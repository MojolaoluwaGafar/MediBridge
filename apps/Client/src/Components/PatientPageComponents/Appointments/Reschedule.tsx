import { useMemo, useState } from "react";
import { X, CircleAlert } from "lucide-react";

import Button from "../../Button";
import ViewRescheduledAppointment from "./ViewRescheduledAppointment";
import RescheduledConfirmationModal from "./RescheduledConfirmationModal";
import { appointmentService } from "../../../API/services/appointmentService";

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

  const [selectedDate, setSelectedDate] = useState(appointment.date);
  const [selectedTime, setSelectedTime] = useState(appointment.time);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [updatedAppointment, setUpdatedAppointment] =
    useState<IAppointment | null>(null);

  const appointmentDate = useMemo(
    () => new Date(appointment.date),
    [appointment.date]
  );

  const today = useMemo(() => new Date(), []);

  const canReschedule = useMemo(() => {
    const diff = appointmentDate.getTime() - today.getTime();

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days >= 7;
  }, [appointmentDate, today]);

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pickedDate = e.target.value;

    const chosen = new Date(pickedDate);
    const today = new Date();

    if (chosen < new Date(today.toDateString())) {
      setError("You cannot select a past date.");
      return;
    }

    setError(null);
    setSelectedDate(pickedDate);
    setSelectedTime("");
  };

  const getDayName = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

  const matchingSlots = useMemo(() => {
    if (!selectedDate) return [];

    const selectedDay = getDayName(selectedDate);

    return doctor.availableTime.filter(
      (slot) => slot.day === selectedDay
    );
  }, [doctor.availableTime, selectedDate]);

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) return;

    setShowReview(true);
  };

  const handleConfirmReschedule = async () => {
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
      console.error(err);
    }
  };

  if (showConfirmation) {
    const parsedDate = new Date(selectedDate);

    const day = parsedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return (
      <RescheduledConfirmationModal
        docName={doctor.docName}
        day={day}
        time={selectedTime}
        onMessageDoctor={() => {
          console.log("message");
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

  if (showReview) {
    return (
      <ViewRescheduledAppointment
        appointment={appointment}
        newDate={selectedDate}
        newTime={selectedTime}
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
            Appointments can only be rescheduled at least 7 days before the
            scheduled date.
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

          <label className="mb-2 block font-medium">
            Select a New Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full rounded-md border border-[#D7D7D7] p-3"
          />

          {error && (
            <p className="mt-2 text-red-500">
              {error}
            </p>
          )}

          <h2 className="mt-6 mb-3 font-medium">
            Time Slots
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {!selectedDate ? (
              <p className="text-gray-500 sm:col-span-2 lg:col-span-3">
                Select a date first.
              </p>
            ) : matchingSlots.length > 0 ? (
              matchingSlots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => handleTimeClick(slot.start)}
                  className={`h-14 rounded-lg border transition ${
                    selectedTime === slot.start
                      ? "bg-[#28574E] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {slot.start}
                </button>
              ))
            ) : (
              <p className="text-gray-500 sm:col-span-2 lg:col-span-3">
                No available slots for this day.
              </p>
            )}

          </div>

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