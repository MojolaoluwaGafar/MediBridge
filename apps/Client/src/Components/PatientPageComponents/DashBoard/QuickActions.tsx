import {
  CalendarDays,
  Astroid,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router";
type Props = {
  onBookAppointment: () => void;
};

export default function QuickActions({
  onBookAppointment,
}: Props) {
  const navigate = useNavigate()
  return (
    <div className="w-full lg:max-w-[391px] border border-[#D7D7D7] rounded-xl p-4 sm:p-5 md:p-6">
      <p className="pb-4 text-xl sm:text-2xl font-medium">
        Quick Actions
      </p>

      <div className="flex flex-col gap-4 sm:gap-5">
        <button
          onClick={onBookAppointment}
          type="button"
          className="w-full min-h-[60px] border border-[#E7E4E4] rounded-lg flex items-center gap-3 px-4 bg-white transition hover:bg-gray-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#E3FDF7] flex-shrink-0">
            <CalendarDays color="#28574E" size={22} />
          </span>

          <span className="text-sm sm:text-base font-medium text-left">
            Book Appointment
          </span>
        </button>

        <button
        onClick={()=> {
          navigate("/support")
        }}
          type="button"
          className="w-full min-h-[60px] border border-[#E7E4E4] rounded-lg flex items-center gap-3 px-4 bg-white transition hover:bg-gray-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#E3FDF7] flex-shrink-0">
            <Astroid color="#28574E" size={22} />
          </span>

          <span className="text-sm sm:text-base font-medium text-left">
            Chat With AI
          </span>
        </button>

        <button
        onClick={()=>{
          navigate("/underConstruction")
        }}
          type="button"
          className="w-full min-h-[60px] border border-[#E7E4E4] rounded-lg flex items-center gap-3 px-4 bg-white transition hover:bg-gray-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#E3FDF7] flex-shrink-0">
            <FileText color="#28574E" size={22} />
          </span>

          <span className="text-sm sm:text-base font-medium text-left">
            Medical Records
          </span>
        </button>
      </div>
    </div>
  );
}