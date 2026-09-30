import { CircleCheck, CircleAlert } from "lucide-react";
import Button from "../Button";
import InitialsAvatar from "../PortalComponents/InitialsAvatar";
import type { PortalDoctor } from "../../types/portal";

type Props = {
  doctors: PortalDoctor[];
  onLinkAccount?: (doctor: PortalDoctor) => void;
  onAddDoctor?: () => void;
};

const nameParts = (docName: string) => {
  const parts = docName.replace(/^Dr\.?\s*/i, "").split(/\s+/);
  return { firstname: parts[0] ?? "", lastname: parts[parts.length - 1] ?? "" };
};

// Doctor profiles and whether each has a login (Doctor.userId). A doctor can
// only use the doctor portal and AI assistant once their account is linked.
export default function DoctorsList({ doctors, onLinkAccount, onAddDoctor }: Props) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="fontOutfit font-semibold text-2xl">Doctors</h1>
          <p className="text-[#707070] text-base font-light">
            Doctor profiles and their portal accounts.
          </p>
        </div>
        <Button type="button" width="w-full lg:w-[250px]" content="Add Doctor" onClick={onAddDoctor} />
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="rounded-xl border border-[#D7D7D7] bg-white p-5 flex gap-4 fontOutfit">
            {doctor.docImg ? (
              <img className="w-21.75 h-21.5 rounded-[4.01px] object-cover" src={doctor.docImg} alt={doctor.docName} />
            ) : (
              <InitialsAvatar {...nameParts(doctor.docName)} />
            )}
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <h2 className="text-[#141313] font-medium text-[20px]">{doctor.docName}</h2>
              <p className="text-[#605E5E] font-light text-[16px]">{doctor.department} Department</p>
              <p className="text-[14px] text-[#605E5E]">
                {doctor.appointmentsThisWeek} appointments this week ·{" "}
                {doctor.availability ? "Taking bookings" : "Not taking bookings"}
              </p>
              {doctor.accountEmail ? (
                <p className="mt-2 flex items-center gap-2 text-[14px] text-[#28574E]">
                  <CircleCheck size={16} /> Login linked: {doctor.accountEmail}
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <p className="flex items-center gap-2 text-[14px] text-[#B3261E]">
                    <CircleAlert size={16} /> No login linked
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    width="w-[164px]"
                    className="h-10! text-[16px]!"
                    content="Link Account"
                    onClick={() => onLinkAccount?.(doctor)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
