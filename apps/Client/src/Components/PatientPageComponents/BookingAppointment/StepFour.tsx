import { useState } from "react";

type Props = {
  onSelectReason: (reason: string) => void;
};

export default function StepFour({ onSelectReason }: Props) {
  const [reason, setReason] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    onSelectReason(value);
  };

  return (
    <div className="w-full">
      <label
        htmlFor="reason"
        className="block pb-3 text-base sm:text-lg font-medium fontOutfit"
      >
        Reason for Visit <span className="text-red-500">*</span>
      </label>

      <textarea
        id="reason"
        value={reason}
        onChange={handleChange}
        placeholder="Briefly describe your symptoms or reason for this appointment..."
        className="min-h-[120px] w-full rounded-lg border border-[#D7D7D7] p-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#28574E]"
      />
    </div>
  );
}