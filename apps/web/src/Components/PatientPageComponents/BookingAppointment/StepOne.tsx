/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Input from "../../Input";
import type { ComponentType } from "react";
import {
  Search,
  HeartPulse,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
} from "lucide-react";
import type { IDoctor } from "../../../types/doctor";
import { useDoctors } from "../../../Hooks/Doctors/useDoctors";

interface ISelectDep {
  icon: ComponentType<any>;
  iconCol: string;
  iconBg: string;
  department: string;
  availableDoctors: number;
}

const Card = ({
  icon: Icon,
  department,
  availableDoctors,
  iconCol,
  iconBg,
  isSelected,
  onClick,
}: ISelectDep & { isSelected?: boolean; onClick: () => void }) => {
  const isDisabled = availableDoctors === 0;

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4 cursor-pointer transition
      ${
        isSelected
          ? "border-[#28574E] shadow-md"
          : "border-[#DDDDDD] hover:bg-[#F5F5F5] hover:shadow-md"
      }
      ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon color={iconCol} size={20} />
      </span>

      <div className="flex flex-col gap-1 overflow-hidden">
        <p className="fontOutfit text-sm sm:text-base font-semibold">
          {department}
        </p>

        <p className="fontOutfit text-xs sm:text-sm md:text-base font-light text-[#605E5E]">
          {availableDoctors === 0
            ? "No doctors available"
            : `${availableDoctors} ${
                availableDoctors === 1 ? "Doctor" : "Doctors"
              }`}
        </p>
      </div>
    </div>
  );
};

export default function StepOne({
  onSelect,
}: {
  onSelect: (dep: string) => void;
  DRs: IDoctor[];
}) {
  const [selectedDep, setSelectedDep] = useState<string | null>(null);

  const { doctors, fetchDoctors, loading, error } = useDoctors();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const departments: ISelectDep[] = [
    {
      icon: HeartPulse,
      iconCol: "#FC0707",
      iconBg: "bg-[#FFF4F3]",
      department: "Cardiology",
      availableDoctors: doctors.filter(
        (d) => d.department === "Cardiology"
      ).length,
    },
    {
      icon: Brain,
      iconCol: "#00454B",
      iconBg: "bg-[#CFDFE0]",
      department: "Neurology",
      availableDoctors: doctors.filter(
        (d) => d.department === "Neurology"
      ).length,
    },
    {
      icon: Eye,
      iconCol: "#5F330E",
      iconBg: "bg-[#FAEFE7]",
      department: "Ophthalmology",
      availableDoctors: doctors.filter(
        (d) => d.department === "Ophthalmology"
      ).length,
    },
    {
      icon: Bone,
      iconCol: "#8519FF",
      iconBg: "bg-[#FEE2FF]",
      department: "Orthopedics",
      availableDoctors: doctors.filter(
        (d) => d.department === "Orthopedics"
      ).length,
    },
    {
      icon: Baby,
      iconCol: "#2B00FF",
      iconBg: "bg-[#ECE6FF]",
      department: "OB-GYN",
      availableDoctors: doctors.filter(
        (d) => d.department === "OB-GYN"
      ).length,
    },
    {
      icon: Stethoscope,
      iconCol: "#F9A836",
      iconBg: "bg-[#FFF5E8]",
      department: "Pediatrics",
      availableDoctors: doctors.filter(
        (d) => d.department === "Pediatrics"
      ).length,
    },
  ];

  return (
    <div className="w-full">
      <h1 className="fontOutfit text-base sm:text-lg font-medium">
        What brings you in today?
      </h1>

      <div className="relative w-full py-4 sm:pt-3 sm:pb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </span>

        <Input
          placeholder="Search symptoms, department or condition..."
          className="w-full pl-10"
          type="text"
        />
      </div>

      <h1 className="mb-4 fontOutfit text-base sm:text-lg font-medium">
        Or Select a department
      </h1>

      {loading ? (
        <p>Loading Doctors...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {departments.map((dep, idx) => (
            <Card
              key={idx}
              {...dep}
              isSelected={selectedDep === dep.department}
              onClick={() => {
                setSelectedDep(dep.department);
                onSelect(dep.department);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}