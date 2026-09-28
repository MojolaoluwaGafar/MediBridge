import mongoose, { Schema, Document } from "mongoose";
import type { IDoctor } from "../types/doctor";

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
    }
    },
    { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema);