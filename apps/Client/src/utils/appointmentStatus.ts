import type { IAppointment } from "../types/appointment";
import { todayDateString } from "./formatDate";

// Still to come: confirmed and on or after today. The server also marks past
// confirmed appointments "completed", but checking the date here keeps the
// screens right even before the next refresh.
export const isUpcoming = (appointment: Pick<IAppointment, "status" | "date">) =>
  appointment.status === "confirmed" && appointment.date >= todayDateString();

export const isCompleted = (appointment: Pick<IAppointment, "status" | "date">) =>
  appointment.status === "completed" || (appointment.status === "confirmed" && appointment.date < todayDateString());

export const STATUS_STYLES: Record<IAppointment["status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-[#FFF4E0] text-[#8A5A00]" },
  confirmed: { label: "Confirmed", className: "bg-[#E0F8F3] text-[#28574E]" },
  completed: { label: "Completed", className: "bg-[#EBEBEB] text-[#3E3B3B]" },
  cancelled: { label: "Cancelled", className: "bg-[#FDECEA] text-[#8C1D18]" },
};

// The label and colours to show, treating a past confirmed visit as completed.
export const displayStatus = (appointment: Pick<IAppointment, "status" | "date">) =>
  STATUS_STYLES[isCompleted(appointment) ? "completed" : appointment.status];
