import mongoose, { Schema, Document } from "mongoose";
import type { IDoctor } from "../types/doctor";
import type { TriageLevel } from "../Services/triage";

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface IAppointmentUrgency {
    level: TriageLevel;
    reason: string;
    source: "keyword" | "ai" | "keyword+ai" | "doctor";
    updatedAt: Date;
}

export interface IAppointment extends Document {
    department: string;
    doctor: mongoose.Types.ObjectId | IDoctor
    date: string,
    time: string;
    reason: string;
    shareRecords?: boolean;
    // "completed" is set once the appointment's date has passed (or later, by the doctor).
    status: AppointmentStatus;
    createdAt: Date;
    updatedAt: Date;
    userId?: mongoose.Types.ObjectId;
    urgency?: IAppointmentUrgency;
}


const AppointmentSchema: Schema<IAppointment> = new Schema({
    department: { 
        type: String, 
        required: true
    },
    doctor: { 
        type: Schema.Types.ObjectId, 
        ref : "Doctor",
        required: true 
    },
    date: {
        type : String,
        required : true
    },
    time : { 
        type: String, 
        required: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    shareRecords: { 
        type: Boolean, 
        default: false 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    },
    status: {
        type: String,
        enum : APPOINTMENT_STATUSES,
        default: "pending"
    },
    urgency: {
        level: {
            type: String,
            enum: ["routine", "urgent", "emergency"],
            default: "routine"
        },
        reason: { type: String },
        source: {
            type: String,
            enum: ["keyword", "ai", "keyword+ai", "doctor"]
        },
        updatedAt: { type: Date }
    }
    },
    { timestamps: true }
);

// One patient per doctor per slot. Only confirmed appointments hold a slot, so
// a cancelled one frees it. This is the final guard against two people
// booking the same slot at the same moment; the service checks first so the
// patient gets a clear message.
AppointmentSchema.index(
    { doctor: 1, date: 1, time: 1 },
    { unique: true, partialFilterExpression: { status: "confirmed" }, name: "one_confirmed_booking_per_slot" }
);

// Query indexes (see docs/architecture/performance.md). Field order follows
// equality -> sort -> range: the person, then status, then the date range.
// A patient's own list, and marking their past visits completed:
AppointmentSchema.index({ userId: 1, status: 1, date: 1 });
// A doctor's schedule, dashboard counts and free-slot lookups:
AppointmentSchema.index({ doctor: 1, status: 1, date: 1 });
// "Has this patient booked with this doctor?" (messages, patient profile):
AppointmentSchema.index({ doctor: 1, userId: 1 });
// Hospital-wide counts on the admin overview, and completing past visits.
AppointmentSchema.index({ status: 1, date: 1 });

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema);