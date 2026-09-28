import { CalendarX } from "lucide-react";
import Button from "../../Button";

type Props = {
  title: string;
  description: string;
  buttonText?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
};

export default function EmptyAppointmentState({
  title,
  description,
  buttonText = "Book Appointment",
  showButton = true,
  onButtonClick,
}: Props) {
  return (
    <div className="w-full h-80 rounded-xl border mx-auto lg:m-0 border-[#D7D7D7] flex flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="bg-[#EBEAEA] h-16 w-16 rounded-md flex items-center justify-center">
        <CalendarX size={35} />
      </span>

      <h2 className="text-[20px] font-medium">{title}</h2>

      <p className="max-w-md text-[14px] text-[#666666]">
        {description}
      </p>

      {showButton && onButtonClick && (
        <Button
          type="button"
          className="mt-4"
          width="w-[194px]"
          content={buttonText}
          onClick={onButtonClick}
        />
      )}
    </div>
  );
}