import React from "react"
import Button from "../../Button";
import { CalendarDays, Clock } from "lucide-react";
import type { IAppointment } from "../../../types/appointment";
import { usePatientTab } from "../../../Hooks/Portal/usePatientTab";
import { displayStatus, isCompleted, isUpcoming } from "../../../utils/appointmentStatus";
import { formatDateString } from "../../../utils/formatDate";
import Avatar from "../../PortalComponents/Avatar";

type AppointmentCardProps = {
    appointment: IAppointment;
    onView: (appointment: IAppointment) => void;
    onReschedule: (appointment: IAppointment) => void;
    onCancel: (appointment: IAppointment) => void;
    // Opens booking again, e.g. for a follow-up after a completed visit.
    onBookAgain?: () => void;
};

// Actions depend on where the appointment is: upcoming ones can be changed,
// completed ones lead to the visit's records, cancelled ones can be rebooked.
function Card({ appointment, onView, onReschedule, onCancel, onBookAgain }: AppointmentCardProps) {
    const { doctor, date, time } = appointment;
    const { goToTab } = usePatientTab();
    const status = displayStatus(appointment);
    const upcoming = isUpcoming(appointment);
    const completed = isCompleted(appointment);

    return (
    <div className="w-full relative rounded-xl border border-[#D7D7D7] p-5 flex flex-col gap-5">
        <span className={`absolute top-3 right-3 rounded-3xl px-4 h-9 flex items-center justify-center text-sm ${status.className}`}>
            {status.label}
        </span>

        <div className="flex flex-col sm:flex-row gap-3 sm:pr-28">
            <Avatar name={doctor.docName} image={doctor.docImg} size="xl" />
            <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-[#141313] fontOutfit font-medium text-lg sm:text-[20px] break-words">{doctor.docName}</h2>
                <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
                    {doctor.department} Department
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-[#605E5E]">
                    <p className="flex items-center gap-2">
                        <CalendarDays size={18} color="#605E5E" /> {formatDateString(date)}
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock size={18} color="#605E5E" /> {time}
                    </p>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap w-full sm:items-center gap-3 sm:gap-x-5">
            <Button type="button" size="sm" width="w-full sm:w-[164px]" content="View Details" onClick={() => onView(appointment)} />

            {upcoming && (
                <>
                    <Button type="button" size="sm" width="w-full sm:w-[164px]" content="Reschedule" variant="outline"
                        onClick={() => onReschedule(appointment)} />
                    {doctor._id && (
                        <button className="text-[#3E3B3B] fontOutfit font-normal hover:underline" type="button"
                            onClick={() => goToTab("messages", { doctor: doctor._id! })}>
                            Message
                        </button>
                    )}
                    <button type="button" className="text-red-600 font-normal hover:underline" onClick={() => onCancel(appointment)}>
                        Cancel
                    </button>
                </>
            )}

            {completed && (
                <>
                    <Button type="button" size="sm" width="w-full sm:w-[164px]" variant="outline" content="Visit records"
                        onClick={() => goToTab("medRecords")} />
                    {onBookAgain && (
                        <Button type="button" size="sm" width="w-full sm:w-[164px]" variant="outline" content="Book Follow Up"
                            onClick={onBookAgain} />
                    )}
                </>
            )}

            {appointment.status === "cancelled" && onBookAgain && (
                <Button type="button" size="sm" width="w-full sm:w-[164px]" variant="outline" content="Book again"
                    onClick={onBookAgain} />
            )}
        </div>
    </div>
  );
}

export default React.memo(Card)
