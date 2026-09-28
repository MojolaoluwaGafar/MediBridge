import React, { useMemo } from "react"
import Button from "../../Button";
import { CalendarDays, Clock } from "lucide-react";
import type { IAppointment } from "../../../types/appointment";

type AppointmentCardProps = {
    appointment: IAppointment;
    onView: (appointment: IAppointment) => void;
    onReschedule : (appointment: IAppointment)=> void;
    onCancel: (id: string) => void;
};

function AppointmentCard({ appointment, onView, onReschedule, onCancel }: AppointmentCardProps) {
    const { doctor, date, time, status } = appointment;
    const formattedDate = useMemo(
    () =>
        new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        }),
    [date]
    );

    const avatar = doctor.docImg ?? "/images/default-avatar.png"
    return (
    <div className="w-full rounded-xl border border-[#D7D7D7] p-6 lg:h-50 flex flex-col justify-between">
        <div className="flex flex-col lg:flex lg:flex-row gap-2 relative">
            <img className="w-[69.8px] h-19.25 rounded-[4.01px] object-cover" src={avatar} alt={doctor.docName} />
            <div>
                <h1 className="text-[#141313] fontOutfit font-medium text-[20px]">{doctor.docName}</h1>
                <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
                    {doctor.department} Department
                </p>
                <div className="flex flex-col lg:flex lg:flex-row lg:gap-8 text-[#605E5E]">
                    <p className="flex items-center gap-2">
                        <CalendarDays size={18} color="#605E5E" /> {formattedDate}
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock size={18} color="#605E5E" /> {time}
                    </p>
                </div>
            </div>
            
            <span className="absolute top-0 right-0 bg-[#E0F8F3] text-[#28574E] rounded-3xl h-10 w-26 flex items-center justify-center">
                {status}
            </span>
        </div>
        
        <div className="flex flex-col lg:flex lg:flex-row gap-4 mt-5">
            <Button type="button" width="w-full lg:w-[164px]" content="View Details" onClick={() => onView(appointment)} />
            <Button type="button" width="w-full lg:w-[164px]" content="Reschedule" variant="outline" onClick={()=> onReschedule(appointment)} />
            <button type="button" className="text-red-600 font-normal" onClick={()=> onCancel(appointment._id)}>Cancel</button>
        </div>
    </div>
  );
}

export default React.memo(AppointmentCard)