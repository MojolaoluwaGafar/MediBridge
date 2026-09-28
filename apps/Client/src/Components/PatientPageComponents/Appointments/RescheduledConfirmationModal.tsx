import icon from "../../../assets/Frame.svg"
import Button from "../../Button"

type Props = {
  docName: string;
  day: string;
  time: string;
  onClose: () => void;
  onMessageDoctor: ()=> void;
  onViewAppointment: ()=> void;
}

export default function RescheduledConfirmationModal({ docName, day, time, onMessageDoctor, onViewAppointment }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-100 text-center">
        <div className="bg-[#EAF9E8] rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4">
          <img src={icon} alt="confirmation icon" className="w-7 h-10" />
        </div>

        <p className="text-[20px] fontOutfit font-semibold mb-2">Rescheduled Successfully</p>
        <p className="text-[16px] text-[#3E3B3B] mb-6">
          Your appointment with <span className="font-medium">{docName}</span> is now rescheduled on {day} at {time}.
        </p>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            content="Message Doctor"
            variant="outline"
            onClick={onMessageDoctor}
          />
          <Button
            type="button"
            content="View Appointment"
            onClick={onViewAppointment}
          />
        </div>
      </div>
    </div>
  )
}
