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
});

export const Doctor = mongoose.model<IDoctorDoc>("Doctor", DoctorSchema);
