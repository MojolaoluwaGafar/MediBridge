// Sample data for the doctor and admin portal previews. Every name, ID and
// record here is made up.
import type { AuthUser } from "../types/auth";
import type {
  DoctorAppointment,
  PortalActivity,
  PortalDoctor,
  PortalPatient,
  SafetyFlag,
} from "../types/portal";
import type { SharedRecord, VisitNote } from "../Components/DoctorPageComponents/PatientProfile";

export const TODAY = "2026-10-01";

export const doctorUser: AuthUser = {
  id: "d1",
  firstname: "Sarah",
  lastname: "Al-Mansoor",
  email: "sarah.almansoor@example.com",
  role: "doctor",
};

export const adminUser: AuthUser = {
  id: "a1",
  firstname: "Ada",
  lastname: "Obi",
  email: "ada.obi@example.com",
  role: "admin",
};

const patient = (id: string, firstname: string, lastname: string, extra: Partial<PortalPatient> = {}): PortalPatient => ({
  _id: id,
  firstname,
  lastname,
  patientId: `MB-${id}`,
  ...extra,
});

export const patients = {
  elena: patient("72109", "Elena", "Rostova", { email: "elena.rostova@example.com", phone: "+234 803 555 0142" }),
  marcus: patient("84092", "Marcus", "Vance"),
  david: patient("30911", "David", "Chen", { email: "david.chen@example.com", phone: "+234 806 555 0199" }),
  amara: patient("65301", "Amara", "Okafor"),
  tunde: patient("41277", "Tunde", "Bakare"),
  grace: patient("59018", "Grace", "Eze"),
};

export const doctorAppointments: DoctorAppointment[] = [
  {
    _id: "ap1", patient: patients.tunde, department: "Cardiology", date: TODAY, time: "08:30",
    reason: "Routine blood pressure review", status: "completed", shareRecords: false,
  },
  {
    _id: "ap2", patient: patients.elena, department: "Cardiology", date: TODAY, time: "10:00",
    reason: "Chest pain when climbing stairs for the past week, and my home blood pressure readings are around 150/95.",
    status: "confirmed", shareRecords: true,
    urgency: { level: "urgent", reason: "Mentions chest pain on exertion", source: "keyword+ai" },
  },
  {
    _id: "ap3", patient: patients.marcus, department: "Cardiology", date: TODAY, time: "11:30",
    reason: "Follow-up on new blood pressure medication", status: "confirmed", shareRecords: false,
    urgency: { level: "routine", reason: "No warning signs matched", source: "keyword" },
  },
  {
    _id: "ap4", patient: patients.david, department: "Cardiology", date: TODAY, time: "14:00",
    reason: "Lipid panel and kidney results review", status: "confirmed", shareRecords: true,
  },
  {
    _id: "ap5", patient: patients.amara, department: "Cardiology", date: "2026-10-02", time: "09:00",
    reason: "Palpitations at night, no chest pain", status: "confirmed", shareRecords: false,
    urgency: { level: "routine", reason: "No warning signs matched", source: "keyword" },
  },
  {
    _id: "ap6", patient: patients.grace, department: "Cardiology", date: "2026-10-03", time: "13:00",
    reason: "Fainted twice this week while standing up", status: "confirmed", shareRecords: true,
    urgency: { level: "urgent", reason: "Mentions fainting", source: "keyword+ai" },
  },
  {
    _id: "ap7", patient: patients.elena, department: "Cardiology", date: "2026-09-20", time: "09:00",
    reason: "ECG and lipid panel", status: "completed", shareRecords: true,
  },
  {
    _id: "ap8", patient: patients.elena, department: "Cardiology", date: "2026-08-02", time: "14:30",
    reason: "Palpitations follow-up", status: "cancelled",
  },
  {
    _id: "ap9", patient: patients.elena, department: "Cardiology", date: "2026-03-11", time: "11:00",
    reason: "New patient consultation", status: "completed",
  },
];

export const doctorActivities: PortalActivity[] = [
  { id: "da1", kind: "record", title: "Records shared", detail: "Elena Rostova shared her medical records with you.", time: "Today, 7:42 AM" },
  { id: "da2", kind: "confirmed", title: "New booking", detail: "Grace Eze booked 3 Oct, 1:00 PM. Marked urgent.", time: "Yesterday, 6:15 PM" },
];

export const elenaRecords: SharedRecord[] = [
  { id: "r1", title: "ECG report", date: "2026-09-20", kind: "PDF" },
  { id: "r2", title: "Lipid panel", date: "2026-09-20", kind: "Lab result" },
  { id: "r3", title: "Discharge summary", date: "2026-03-03", kind: "PDF" },
];

export const elenaNotes: VisitNote[] = [
  {
    id: "n1", date: "2026-09-20", author: "Dr. Sarah Al-Mansoor",
    text: "Sinus rhythm with occasional ectopic beats. Start amlodipine 5 mg daily. Recheck blood pressure in 4 weeks.",
  },
];

export const flags: SafetyFlag[] = [
  {
    _id: "f1", source: "chat", level: "emergency", category: "medical", status: "new",
    message: "I've had crushing chest pain for 20 minutes and my left arm feels numb",
    reason: 'Matched "crushing chest pain"', flaggedAt: `${TODAY}T08:42:00`, patient: patients.tunde,
  },
  {
    _id: "f2", source: "booking", level: "urgent", category: "medical", status: "new",
    message: "Fainted twice this week while standing up",
    reason: "Mentions fainting", flaggedAt: "2026-09-30T18:15:00", patient: patients.grace,
  },
  {
    _id: "f3", source: "chat", level: "urgent", category: "self_harm", status: "new",
    message: "I've been having thoughts of self harm lately and I don't know who to talk to",
    reason: 'Matched "self harm"', flaggedAt: "2026-09-30T22:05:00", patient: null,
  },
  {
    _id: "f4", source: "booking", level: "urgent", category: "medical", status: "reviewed",
    message: "Chest pain when climbing stairs for the past week",
    reason: "Mentions chest pain on exertion", flaggedAt: "2026-09-29T09:10:00", patient: patients.elena,
    reviewedBy: "Dr. Sarah Al-Mansoor", reviewNote: "Moved her appointment to the first slot today.",
  },
];

export const adminActivities: PortalActivity[] = [
  { id: "aa1", kind: "flag", title: "Emergency flag", detail: "AI chat from Tunde Bakare flagged as an emergency.", time: "Today, 8:42 AM" },
  { id: "aa2", kind: "note", title: "Flag reviewed", detail: "Dr. Sarah Al-Mansoor reviewed Elena Rostova's booking flag.", time: "29 Sep, 9:30 AM" },
];

export const portalDoctors: PortalDoctor[] = [
  { _id: "doc1", docName: "Dr. Sarah Al-Mansoor", department: "Cardiology", availability: true, accountEmail: "sarah.almansoor@example.com", appointmentsThisWeek: 18 },
  { _id: "doc2", docName: "Dr. Chinedu Okoro", department: "Pediatrics", availability: true, accountEmail: null, appointmentsThisWeek: 12 },
  { _id: "doc3", docName: "Dr. Lizzy Adeyemi", department: "Obstetrics & Gynaecology", availability: true, accountEmail: "lizzy.adeyemi@example.com", appointmentsThisWeek: 9 },
  { _id: "doc4", docName: "Dr. Musa Ibrahim", department: "Dentistry", availability: false, accountEmail: null, appointmentsThisWeek: 0 },
];
