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

function Card({ appointment, onView, onReschedule, onCancel }: AppointmentCardProps) {
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

    const normalizedStatus = status.toLowerCase();

    const avatar = doctor.docImg ?? "/images/default-avatar.png"
    
    return (
    <div className="w-full relative rounded-xl border border-[#D7D7D7] p-5 lg:h-40 flex justify-between items-center">
        <div className="flex flex-col lg:flex lg:flex-row gap-2">
            <img className="w-21.75 h-21.5 rounded-[4.01px] object-cover" src={avatar} alt={doctor.docName} />
            <div className="flex flex-col gap-1">
                <h1 className="text-[#141313] fontOutfit font-medium text-[20px]">{doctor.docName}</h1>
                <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
                    {doctor.department} Department
                </p>
                <div className="flex gap-2 text-[14px] text-[#605E5E]">
                    <p className="flex items-center gap-2">
                        <CalendarDays size={18} color="#605E5E" /> {formattedDate}
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock size={18} color="#605E5E" /> {time}
                    </p>
                </div>
            </div>
            
            <span className="absolute top-3 right-3 bg-[#E0F8F3] text-[#28574E] rounded-3xl h-10 w-26 flex items-center justify-center">
                {status}
            </span>
        <div className="flex flex-col lg:flex lg:flex-row w-full items-center gap-5 mt-8">
            <Button type="button" width="w-full lg:w-[164px]" content="View Details" onClick={() => onView(appointment)} />
              {(normalizedStatus === "confirmed" || normalizedStatus === "upcoming") && (
                <>
                <Button type="button" width="w-full lg:w-[164px]" content="Reschedule" variant="outline"
                onClick={() => onReschedule(appointment)}/>

                <button className="text-[#3E3B3B] fontOutfit font-normal" type="button">Message</button>
                
                <button type="button" className="text-red-600 font-normal" onClick={()=> onCancel(appointment._id)}>Cancel</button>
                </>
            )}
             {normalizedStatus === "completed" && (
              <>
                <Button
                  type="button"
                  width="w-full lg:w-[164px]"
                  content="View Summary"
                  onClick={() => onView(appointment)}
                />

                <Button
                  type="button"
                  width="w-full lg:w-[164px]"
                  variant="outline"
                  content="Book Follow Up"
                />
              </>
            )}
        </div>
        </div>

    </div>
  );
}

export default React.memo(Card)