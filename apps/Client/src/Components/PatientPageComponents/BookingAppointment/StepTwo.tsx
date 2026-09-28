import { useState, useEffect } from "react";
import DocProfileModal from "./DocProfileModal";
import { useDoctors } from "../../../Hooks/Doctors/useDoctors";
import type { IDoctor } from "../../../types/doctor";
import type { IDocProfile } from "./DocProfileModal";

export interface ISelectDoc {
  _id: string;
  docImg: string;
  docName: string;
  department: string;
  YOE: number;
  availability: boolean;
}

const Card = ({
  docImg,
  docName,
  department,
  YOE,
  availability,
  isSelected,
  onSelect,
  onViewProfile,
}: IDoctor & {
  isSelected?: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
}) => {
  return (
    <div
      className={`w-full rounded-lg border p-4 transition ${
        isSelected
          ? "border-[#28574E] shadow-md"
          : "border-[#D7D7D7] hover:bg-[#F5F5F5]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <img
          className="h-24 w-20 rounded object-cover sm:h-[77px] sm:w-[70px]"
          src={docImg}
          alt="doctorImg"
        />

        <div className="flex flex-col gap-1">
          <h1 className="fontOutfit text-lg sm:text-xl font-medium text-[#141313]">
            {docName}
          </h1>
          <p className="fontOutfit text-sm sm:text-base font-light text-[#605E5E]">
            {department} Department
          </p>
          <p className="text-sm text-[#3E3B3B]">
            {YOE} yrs Exp.{" "}
            <span
              className={availability ? "text-green-500" : "text-red-500"}
            >
              {availability ? "Available" : "Unavailable"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={onViewProfile}
          type="button"
          className="h-11 w-full rounded-md text-base font-medium fontOutfit text-[#28574E] hover:bg-[#F5F5F5]"
        >
          View Profile
        </button>

        <button
          onClick={onSelect}
          type="button"
          className={`h-11 w-full rounded-md border border-[#28574E] bg-white text-base font-medium fontOutfit text-[#28574E] hover:bg-[#28574E] hover:text-white ${
            isSelected ? "hidden" : "flex items-center justify-center"
          }`}
        >
          Select Doctor
        </button>
      </div>
    </div>
  );
};

export default function StepTwo({
  onSelectDoctor,
  selectedDepartment,
}: {
  onSelectDoctor: (doc: IDoctor) => void;
  selectedDepartment: string | null;
}) {
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [profileDoc, setProfileDoc] = useState<IDocProfile | null>(null);

  const { doctors, fetchDoctors, loading, error } = useDoctors();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = selectedDepartment
    ? doctors.filter(
        (doc) =>
          doc.department === selectedDepartment && doc.availability === true
      )
    : doctors;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="fontOutfit text-base sm:text-lg font-medium">
          Select a Doctor
        </h1>

        <p className="flex flex-wrap items-center gap-1 text-sm sm:text-base text-[#3E3B3B] fontOutfit">
          {selectedDepartment || "All Departments"}
          <span className="h-1 w-1 rounded-full bg-[#3E3B3B]"></span>
          {filteredDoctors.length} doctors available
        </p>
      </div>

      <div className="grid max-h-[420px] gap-4 overflow-y-auto py-6 scrollbar-none">
        {loading ? (
          <p>Loading doctors...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredDoctors.map((doctor, id) => (
            <Card
              key={id}
              {...doctor}
              isSelected={selectedDoctor?._id === doctor._id}
              onSelect={() => {
                setSelectedDoctor(doctor);
                onSelectDoctor(doctor);
              }}
              onViewProfile={() =>
                setProfileDoc({
                  ...doctor,
                  _id: doctor._id || "",
                  about: doctor.about || "No information available",
                  availableTime: doctor.availableTime || [],
                  onClose: () => setProfileDoc(null),
                })
              }
            />
          ))
        )}
      </div>

      {profileDoc && <DocProfileModal {...profileDoc} />}
    </div>
  );
}
