import mongoose, { Schema, Document } from "mongoose";

export interface IDoctorDoc extends Document {
    docImg: string;
    docName: string;
    department: string;
    YOE: number;
    availability: boolean;
    about: string;
    availableTime: {
        day: string; 
        start: string; 
        end: string }[];
    gender: "male" | "female" | "other";
    userId?: mongoose.Types.ObjectId;
}

const DoctorSchema = new Schema<IDoctorDoc>({
    docImg: { 
        type: String 
    },
    docName: { 
        type: String, 
        required: true 
    },
    department: { 
        type: String, 
        required: true 
    },
    YOE: { 
        type: Number, 
        required: true 
    },
    availability: { 
        type: Boolean, 
        default: true 
    },
    about: { 
        type: String 
    },
    availableTime: [{
        day: { 
            type: String 
        },
        start: { 
            type: String 
        },
        end: { 
            type: String 
        },
    },
    ],
    gender: { 
        type: String, 
        enum: ["male", "female" ], 
        required: true 
    },
    // The doctor's login account. Set when a doctor account is created for
    // this profile; the doctor portal and doctor AI assistant rely on it.
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        sparse: true
    },
});

export const Doctor = mongoose.model<IDoctorDoc>("Doctor", DoctorSchema);
