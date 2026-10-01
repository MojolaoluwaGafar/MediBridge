import { useDoctorSlots } from "../../../Hooks/Doctors/useDoctorSlots";
import { todayDateString } from "../../../utils/formatDate";

type Props = {
  doctorId: string | undefined;
  date: string | null;
  time: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  // When rescheduling, so the appointment's current slot counts as free.
  appointmentId?: string;
  // Bump this to reload slots, e.g. after the server says a slot was just taken.
  refreshKey?: number;
};

// Date input plus the doctor's real slots for that day, from the server.
// Booked and already-started slots are shown but can't be picked.
export default function SlotPicker({ doctorId, date, time, onDateChange, onTimeChange, appointmentId, refreshKey = 0 }: Props) {
  const { slots, loading, error } = useDoctorSlots(doctorId, date, appointmentId, refreshKey);
  const freeCount = slots.filter((s) => s.available).length;

  return (
    <div className="w-full">
      <label htmlFor="appointment-date" className="block pb-3 text-base sm:text-lg font-medium fontOutfit">
        Select a date
      </label>
      <input
        id="appointment-date"
        type="date"
        min={todayDateString()}
        value={date ?? ""}
        onChange={(event) => event.target.value && onDateChange(event.target.value)}
        className="my-2 w-full rounded-md border border-[#D7D7D7] px-4 py-2 text-sm sm:text-base text-[#606060]"
      />

      <h3 className="pt-5 pb-3 text-base sm:text-lg font-medium fontOutfit">Time slot</h3>

      {!date ? (
        <p className="text-sm fontOutfit text-[#3E3B3B]">Pick a day to see available times.</p>
      ) : loading ? (
        <p className="text-sm text-[#757575]">Loading available times…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm fontOutfit text-[#3E3B3B]">
          The doctor doesn't see patients on this day. Please choose another date.
        </p>
      ) : (
        <>
          {freeCount === 0 && (
            <p className="pb-3 text-sm text-[#3E3B3B]">Every slot on this day is taken. Please choose another date.</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Time slot">
            {slots.map((slot) => {
              const selected = time === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!slot.available}
                  title={slot.reason === "booked" ? "Already booked" : slot.reason === "past" ? "This time has passed" : undefined}
                  onClick={() => onTimeChange(slot.time)}
                  className={`h-12 w-full rounded-lg border text-sm sm:text-base transition disabled:cursor-not-allowed disabled:border-dashed disabled:bg-[#F5F5F5] disabled:text-[#B0B0B0] disabled:line-through ${
                    selected ? "border-[#28574E] bg-[#28574E] text-white" : "border-[#DDDDDD] bg-white text-[#3E3B3B] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
