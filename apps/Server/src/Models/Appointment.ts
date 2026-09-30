import mongoose, { Schema, Document } from "mongoose";
import type { IDoctor } from "../types/doctor";
import type { TriageLevel } from "../Services/triage";

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
    status: "pending" | "confirmed" | "cancelled";
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
        enum : ["pending", "confirmed", "cancelled"],
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

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema);