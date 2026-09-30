import type { IDoctor } from "./doctor";

export interface IAppointment {
    _id: string;
    department: string;
    doctor: IDoctor;
    date: string;
    time: string;
    reason: string;
    shareRecords?: boolean;
    status: "pending" | "confirmed" | "cancelled";
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