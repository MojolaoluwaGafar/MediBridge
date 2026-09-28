import icon from "../../../assets/Frame.svg";
import Button from "../../Button";

type Props = {
  docName: string;
  day: string;
  time: string;
  onClose: () => void;
};

export default function ConfirmationModal({
  docName,
  day,
  time,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 sm:p-6 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9E8]">
          <img
            src={icon}
            alt="confirmation icon"
            className="h-10 w-7"
          />
        </div>

        <p className="mb-2 text-lg sm:text-xl fontOutfit font-semibold">
          Appointment confirmed
        </p>

        <p className="mb-6 text-sm sm:text-base text-[#3E3B3B] leading-relaxed">
          We've booked you with{" "}
          <span className="font-medium">{docName}</span> on {day} at {time}.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          {/* <Button
            type="button"
            content="Message Doctor"
            variant="outline"
            onClick={() => console.log("Messaging doctor...")}
            className="w-full sm:w-auto"
          /> */}

          <Button
            type="button"
            content="View Appointment"
            onClick={onClose}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}