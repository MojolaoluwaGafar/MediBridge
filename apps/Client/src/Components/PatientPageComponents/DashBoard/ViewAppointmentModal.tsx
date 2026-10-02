import Button from "../../Button";
import type { IAppointment } from "../../../types";
import { usePatientTab } from "../../../Hooks/Portal/usePatientTab";
import { formatDateString } from "../../../utils/formatDate";
import Avatar from "../../PortalComponents/Avatar";
type Props = {
  appointment: IAppointment;
  onClose: () => void;
};

export default function ViewAppointmentModal({
  appointment,
  onClose,
}: Props) {
  const formattedDate = formatDateString(appointment.date);

  const { goToTab } = usePatientTab();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
      role="button"
      aria-label="Close modal"
    >
      <div
        className="w-131.75 max-w-full max-h-[90vh] overflow-y-auto scrollbar-none relative rounded-lg bg-white p-5 sm:p-6"
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

        <div className="flex gap-3 mt-3 border-t border-b py-5 border-[#D9D9D9]">
          <Avatar name={appointment.doctor.docName} image={appointment.doctor.docImg} size="lg" />

          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-[#141313] fontOutfit font-medium text-lg sm:text-[20px] break-words">
              {appointment.doctor.docName}
            </h1>

            <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
              {appointment.department} Department
            </p>
          </div>
        </div>

        {/* One row per detail, so a long value wraps beside its own label. */}
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 pt-5 text-[16px] fontOutfit">
          <dt className="text-[#757575] font-light">Department</dt>
          <dd className="font-normal">{appointment.department}</dd>
          <dt className="text-[#757575] font-light">Date</dt>
          <dd className="font-normal">{formattedDate}</dd>
          <dt className="text-[#757575] font-light">Time</dt>
          <dd className="font-normal">{appointment.time}</dd>
          <dt className="text-[#757575] font-light">Reason</dt>
          <dd className="font-normal break-words">{appointment.reason || "—"}</dd>
        </dl>

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
            disabled={!appointment.doctor._id}
            onClick={() => {
              onClose();
              goToTab("messages", { doctor: appointment.doctor._id ?? "" });
            }}
          />
        </div>
      </div>
    </div>
  );
}