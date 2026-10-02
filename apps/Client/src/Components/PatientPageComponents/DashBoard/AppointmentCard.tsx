import React from "react"
import Button from "../../Button";
import { CalendarDays, Clock } from "lucide-react";
import type { IAppointment } from "../../../types/appointment";
import { usePatientTab } from "../../../Hooks/Portal/usePatientTab";
import { displayStatus } from "../../../utils/appointmentStatus";
import { formatDateString } from "../../../utils/formatDate";
import Avatar from "../../PortalComponents/Avatar";

type AppointmentCardProps = {
    appointment: IAppointment;
    onView: (appointment: IAppointment) => void;
    onReschedule: (appointment: IAppointment) => void;
    onCancel: (appointment: IAppointment) => void;
};

// The dashboard's "next appointment" card. Only upcoming appointments reach it.
function AppointmentCard({ appointment, onView, onReschedule, onCancel }: AppointmentCardProps) {
    const { doctor, date, time } = appointment;
    const { goToTab } = usePatientTab();
    const status = displayStatus(appointment);

    return (
    <div className="w-full rounded-xl border border-[#D7D7D7] p-4 sm:p-6 flex flex-col justify-between gap-5">
        <div className="flex flex-col sm:flex-row gap-3 relative sm:pr-28">
            <Avatar name={doctor.docName} image={doctor.docImg} size="lg" />
            <div className="min-w-0">
                <h2 className="text-[#141313] fontOutfit font-medium text-lg sm:text-[20px] break-words">{doctor.docName}</h2>
                <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
                    {doctor.department} Department
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[#605E5E]">
                    <p className="flex items-center gap-2">
                        <CalendarDays size={18} color="#605E5E" /> {formatDateString(date)}
                    </p>
                    <p className="flex items-center gap-2 whitespace-nowrap">
                        <Clock size={18} color="#605E5E" /> {time}
                    </p>
                </div>
            </div>

            <span className={`absolute top-0 right-0 rounded-3xl px-4 h-9 flex items-center justify-center text-sm ${status.className}`}>
                {status.label}
            </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-x-4">
            <Button type="button" size="sm" width="w-full sm:w-[164px]" content="View Details" onClick={() => onView(appointment)} />
            <Button type="button" size="sm" width="w-full sm:w-[164px]" content="Reschedule" variant="outline" onClick={() => onReschedule(appointment)} />
            {doctor._id && (
                <button type="button" className="text-[#3E3B3B] fontOutfit hover:underline" onClick={() => goToTab("messages", { doctor: doctor._id! })}>
                    Message
                </button>
            )}
            <button type="button" className="text-red-600 font-normal hover:underline" onClick={() => onCancel(appointment)}>Cancel</button>
        </div>
    </div>
  );
}

export default React.memo(AppointmentCard)
