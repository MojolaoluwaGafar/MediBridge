import Button from "../../Button";
import type { IAppointment } from "../../../types";
import { useNavigate } from "react-router";
type Props = {
  appointment: IAppointment;
  onClose: () => void;
};

export default function ViewAppointmentModal({
  appointment,
  onClose,
}: Props) {
  const formattedDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const avatar = appointment.doctor.docImg || "/images/default-avatar.png";
   const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
      role="button"
      aria-label="Close modal"
    >
      <div
        className="w-131.75 max-w-full max-h-[90vh] overflow-y-auto scrollbar-none relative rounded-lg bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h1 className="text-[18px] fontOutfit font-medium pb-4">
            Appointment Details
          </h1>

          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mt-3 border-t border-b py-5 border-[#D9D9D9]">
          <img
            className="w-[69.8px] h-12.75 rounded-[4.01px] object-cover"
            src={avatar}
            alt={appointment.doctor.docName}
          />

          <div className="flex flex-col gap-1">
            <h1 className="text-[#141313] fontOutfit font-medium text-[20px]">
              {appointment.doctor.docName}
            </h1>

            <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
              {appointment.department} Department
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between pt-5">
          <ul className="space-y-2 text-[#757575] font-light text-[16px] fontOutfit">
            <li>Department</li>
            <li>Date</li>
            <li>Time</li>
            <li>Reason</li>
          </ul>

          <ul className="space-y-2 text-[16px] fontOutfit font-normal">
            <li>{appointment.department}</li>
            <li>{formattedDate}</li>
            <li>{appointment.time}</li>
            <li>{appointment.reason || "—"}</li>
          </ul>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            content="Close"
            onClick={onClose}
          />

          <Button
            type="button"
            content="Message Doctor"
            onClick={()=> {
              navigate("/UnderConstruction")
            }}
          />
        </div>
      </div>
    </div>
  );
}