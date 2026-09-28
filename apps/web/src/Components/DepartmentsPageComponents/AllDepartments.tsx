import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Venus,
  Stethoscope,
  Ambulance,
  Activity,
  ShieldPlus,
  Smile,
} from "lucide-react";

import DepartmentCard from "./DepartmentCard";
import ViewDepartmentModal from "./ViewDepartmentModal";
import { useDepartments } from "../../Hooks/Departments/useDepartments";
import type { IDepartment } from "../../types/department";
import type { ElementType } from "react";
import BookAppointmentModal from "../PatientPageComponents/DashBoard/BookAppointmentModal";
import { useAppointments } from "../../Hooks/Appointments/useAppointments";

const departmentIcons: Record<string, ElementType> = {
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Venus,
  Stethoscope,
  Ambulance,
  Activity,
  ShieldPlus,
  Smile,
  Tooth: Smile,
  FirstAid: ShieldPlus,
  MentalHealth: Brain,
};

interface Props {
  searchTerm: string;
}

type DepartmentWithIcon = Omit<IDepartment, "icon"> & {
  icon: ElementType;
  overview?: string;
  services?: string[];
  image?: string;
};

export default function AllDepartments({ searchTerm }: Props) {
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentWithIcon | null>(null);

  const { data, loading } = useDepartments();
  // const { fetchAppointments } = useAppointments();

  const departments = useMemo<DepartmentWithIcon[]>(
    () =>
      data?.map((department) => ({
        ...department,
        icon: departmentIcons[department.icon] ?? Heart,
        overview: department.details?.overview,
        services: department.details?.services,
        image: department.details?.image,
      })) ?? [],
    [data]
  );

  const itemsPerPage = 8;

  const filteredDepartments = useMemo(
    () =>
      departments
        .filter((d) => activeTab === "All" || d.category === activeTab)
        .filter((d) =>
          d.field.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [departments, activeTab, searchTerm]
  );

  const totalItems = filteredDepartments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const displayedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const btnClass =
    "border border-[#E8E8E8] rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  return (
    <div className="py-10 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto">

        <div className="flex flex-wrap justify-center md:justify-between w-full gap-3 px-5 md:px-20">
          {[
            "All",
            "Medical",
            "Surgical",
            "Diagnostics",
            "Mental Health",
            "Emergency",
            "Women & Children",
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 md:px-8 whitespace-nowrap h-10 md:h-12.5 rounded-[28px] text-sm md:text-[16px] ${
                activeTab === tab
                  ? "bg-[#28574E] text-white"
                  : "bg-[#E5E5E5] hover:bg-gray-800 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 py-8 md:py-10 px-5 md:px-20">
          {displayedDepartments.map((department) => (
            <DepartmentCard
              key={department._id}
              {...department}
              onView={() => setSelectedDepartment(department)}
            />
          ))}
        </div>

        <div className="py-5 flex flex-col md:flex-row justify-between items-center gap-4 px-5 md:px-20">
          <p className="text-sm md:text-base">
            Showing{" "}
            {totalItems === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
            –
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </p>

          <div className="flex items-center gap-2">
            <button
              className={btnClass}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft />
            </button>
            <button
              className={btnClass}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft />
            </button>
            <button
              className={btnClass}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight />
            </button>
            <button
              className={btnClass}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight />
            </button>
          </div>
        </div>
      </div>

      {selectedDepartment && (
        <ViewDepartmentModal
          {...selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onBooking={() => setShowBooking(true)}
        />
      )}

      {showBooking && (
        <BookAppointmentModal
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
