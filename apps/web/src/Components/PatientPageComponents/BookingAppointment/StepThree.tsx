import { useState } from "react";
import type { IDoctor } from "../../../types/doctor";

type Props = {
  doctor: IDoctor | null;
  onSelectDateTime: (date: string, time: string) => void;
};

export default function StepThree({
  doctor,
  onSelectDateTime,
}: Props) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!doctor) {
    return (
      <p className="fontOutfit text-[#3E3B3B]">
        Please select a doctor
      </p>
    );
  }

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pickedDate = e.target.value;
    const today = new Date();
    const chosen = new Date(pickedDate);

    if (chosen < new Date(today.toDateString())) {
      setError("You cannot select a past date.");
      setSelectedDate(null);
      return;
    }

    setError(null);
    setSelectedDate(pickedDate);
    setSelectedTime(null);
  };

  const getDayName = (dateStr: string) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return days[new Date(dateStr).getDay()];
  };

  const handleTimeClick = (slotLabel: string) => {
    if (!selectedDate || selectedTime) return;

    setSelectedTime(slotLabel);
    onSelectDateTime(selectedDate, slotLabel);
  };

  const selectedDay = selectedDate
    ? getDayName(selectedDate)
    : null;

  const matchingSlots = selectedDay
    ? doctor.availableTime.filter(
        (slot) => slot.day === selectedDay
      )
    : [];

  return (
    <div className="w-full">
      <label
        htmlFor="date"
        className="block pb-3 text-base sm:text-lg font-medium fontOutfit"
      >
        Select a date
      </label>

      <input
        id="date"
        type="date"
        onChange={handleDateChange}
        className="my-2 w-full rounded-md border border-[#D7D7D7] px-4 py-2 text-sm sm:text-base text-[#606060]"
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <h1 className="pt-5 pb-3 text-base sm:text-lg font-medium fontOutfit">
        Time Slot
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {!selectedDate ? (
          <p className="col-span-full text-sm fontOutfit text-[#3E3B3B]">
            Pick a day to see available slots
          </p>
        ) : matchingSlots.length > 0 ? (
          matchingSlots.map((slot, idx) => {
            const timeLabel = `${slot.start}`;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTimeClick(timeLabel)}
                className={`h-14 w-full rounded-lg border border-[#DDDDDD] text-sm sm:text-base font-normal transition
                ${
                  selectedTime === timeLabel
                    ? "bg-[#28574E] text-white"
                    : "bg-white text-[#3E3B3B] hover:bg-[#F5F5F5]"
                }`}
              >
                {timeLabel}
              </button>
            );
          })
        ) : (
          <p className="col-span-full text-sm fontOutfit text-[#3E3B3B]">
            Doctor is not available on the selected day. Please check the
            doctor's profile to confirm their availability.
          </p>
        )}
      </div>
    </div>
  );
}