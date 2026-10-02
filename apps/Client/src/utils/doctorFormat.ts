import type { IDoctorAppointment } from "../types/doctorPortal";

// Date and name formatting for the doctor portal.

const parseDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// "Tue, 29 Sep"
export const shortDate = (date: string) =>
  parseDate(date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

// "29 Sep 2026"
export const mediumDate = (date: string) =>
  parseDate(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// "Today", "Tomorrow" or "Thursday 8 October"
export const dayHeading = (date: string, today: string) => {
  const diff = Math.round((parseDate(date).getTime() - parseDate(today).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return parseDate(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

export const patientName = (a: { patient: { firstname: string; lastname: string } | null }) =>
  a.patient ? `${a.patient.firstname} ${a.patient.lastname}` : "Former patient";

// "9:30 AM" -> minutes since midnight, for comparing with now.
export const minutesOf = (label: string) => {
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hours = Number(match[1]) % 12;
  if (match[3]?.toUpperCase() === "PM") hours += 12;
  if (!match[3]) hours = Number(match[1]);
  return hours * 60 + Number(match[2]);
};

// A confirmed visit can be marked completed once its start time has passed.
export const hasStarted = (a: Pick<IDoctorAppointment, "date" | "time">, today: string) => {
  if (a.date < today) return true;
  if (a.date > today) return false;
  const now = new Date();
  return minutesOf(a.time) <= now.getHours() * 60 + now.getMinutes();
};
