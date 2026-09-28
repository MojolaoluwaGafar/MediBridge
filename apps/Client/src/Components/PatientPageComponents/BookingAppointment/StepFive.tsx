type Props = {
  docImg: string;
  docName: string;
  department: string;
  availability: boolean;
  date: string;
  time: string;
  reason: string;
  shareRecords: boolean;
  setShareRecords: (value: boolean) => void;
};

export default function StepFive({
  docImg,
  docName,
  department,
  date,
  time,
  reason,
  shareRecords,
  setShareRecords,
}: Props) {
  const parsedDate = new Date(date);

  const formattedDate = parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="pb-4 text-lg font-medium fontOutfit">
        Review Your Appointment
      </h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          className="h-24 w-20 rounded object-cover sm:h-[77px] sm:w-[70px]"
          src={docImg}
          alt="doctorImg"
        />

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium text-[#141313] fontOutfit">
            {docName}
          </h1>

          <p className="text-sm sm:text-base font-light text-[#605E5E] fontOutfit">
            {department} Department
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[#D9D9D9] pt-5">
        <div className="flex justify-between gap-6">
          <ul className="space-y-3 text-sm sm:text-base font-light text-[#757575] fontOutfit">
            <li>Department</li>
            <li>Date</li>
            <li>Time</li>
            <li>Reason</li>
          </ul>

          <ul className="space-y-3 text-right text-sm sm:text-base font-normal fontOutfit break-words max-w-[60%]">
            <li>{department}</li>
            <li>{formattedDate}</li>
            <li>{time}</li>
            <li>{reason}</li>
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="recordSharing"
          className="text-base sm:text-lg font-medium fontOutfit"
        >
          Record Sharing
        </label>

        <div className="mt-2 flex items-center gap-2">
          <input
            id="recordSharing"
            className="custom-checkbox"
            type="checkbox"
            checked={shareRecords}
            onChange={(e) => setShareRecords(e.target.checked)}
          />

          <span className="text-sm sm:text-base">Medical History</span>
        </div>
      </div>
    </div>
  );
}