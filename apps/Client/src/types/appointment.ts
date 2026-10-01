import type { IDoctor } from "./doctor";

export interface IAppointment {
    _id: string;
    department: string;
    doctor: IDoctor;
    date: string;
    time: string;
    reason: string;
    shareRecords?: boolean;
    // "completed" is set by the server once the appointment day has passed.
    status: "pending" | "confirmed" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    userId?: string;
    urgency?: {
        level: "routine" | "urgent" | "emergency";
        reason: string;
        source: "keyword" | "ai" | "keyword+ai" | "doctor";
        updatedAt: string;
    };
}