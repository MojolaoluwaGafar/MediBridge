import type { IDoctor } from "../../../types/doctor";
import SlotPicker from "./SlotPicker";

type Props = {
  doctor: IDoctor | null;
  date: string | null;
  time: string | null;
  onSelectDateTime: (date: string | null, time: string | null) => void;
  // Bumped by the modal when the server says the chosen slot was just taken.
  refreshKey?: number;
};

// Step 3: pick a date and one of the doctor's free slots.
export default function StepThree({ doctor, date, time, onSelectDateTime, refreshKey }: Props) {
  if (!doctor) {
    return <p className="fontOutfit text-[#3E3B3B]">Please select a doctor</p>;
  }

  return (
    <SlotPicker
      doctorId={doctor._id}
      date={date}
      time={time}
      refreshKey={refreshKey}
      onDateChange={(newDate) => onSelectDateTime(newDate, null)}
      onTimeChange={(newTime) => onSelectDateTime(date, newTime)}
    />
  );
}
