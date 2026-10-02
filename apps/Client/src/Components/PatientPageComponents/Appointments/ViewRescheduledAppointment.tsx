import Button from "../../Button";
import DoctorPhoto from "../../PortalComponents/DoctorPhoto";
import { X } from "lucide-react";
import type { IAppointment } from "../../../types/appointment";
import { formatDateString } from "../../../utils/formatDate";

type Props = {
  appointment: IAppointment;
  newDate: string;
  newTime: string;
  onBack: () => void;
  onClose: () => void;
  onRescheduled: () => void;
  saving?: boolean;
  error?: string | null;
};

export default function ViewRescheduledAppointment({
  appointment,
  newDate,
  newTime,
  onBack,
  onClose,
  onRescheduled,
  saving = false,
  error = null,
}: Props) {
  const { doctor, department, reason } = appointment;

  const formattedDate = formatDateString(newDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">

        <div className="relative px-4 pt-5 sm:px-6">
          <h1 className="pr-8 fontOutfit text-xl font-semibold sm:text-[22px]">
            Review Your Rescheduled Appointment
          </h1>

          <p className="pb-3 text-[15px] text-[#605E5E] fontOutfit sm:text-[16px]">
            Please confirm your updated appointment details.
          </p>

          <button
            type="button"
            className="absolute right-4 top-5 sm:right-6"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-px w-full bg-[#E7E4E4]" />

        <div className="px-4 py-5 sm:px-6">

          <h1 className="pb-4 text-[18px] font-medium fontOutfit">
            Review Your Appointment
          </h1>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <DoctorPhoto name={doctor.docName} image={doctor.docImg} className="h-20 w-20 rounded" />

            <div className="flex flex-col gap-1">
              <h1 className="text-[18px] font-medium text-[#141313] fontOutfit sm:text-[20px]">
                {doctor.docName}
              </h1>

              <p className="text-[15px] font-light text-[#605E5E] fontOutfit sm:text-[16px]">
                {department} Department
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 border-t border-[#D9D9D9] pt-5 sm:grid-cols-2">

            <ul className="space-y-2 text-[16px] font-light text-[#757575] fontOutfit">
              <li>Department</li>
              <li>Date</li>
              <li>Time</li>
              <li>Reason</li>
            </ul>

            <ul className="space-y-2 break-words text-[16px] font-normal fontOutfit sm:text-right">
              <li>{department}</li>
              <li>{formattedDate}</li>
              <li>{newTime}</li>
              <li>{reason}</li>
            </ul>

          </div>

          {error && <p role="alert" className="mt-6 text-sm text-red-600">{error}</p>}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              content="Back"
              onClick={onBack}
              className="w-full bg-gray-200 hover:bg-gray-300 sm:w-auto"
            />

            <Button
              type="button"
              content={saving ? "Saving…" : "Confirm Appointment"}
              disabled={saving}
              onClick={onRescheduled}
              className="w-full sm:w-auto"
            />

          </div>

        </div>
      </div>
    </div>
  );
}