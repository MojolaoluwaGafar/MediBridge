import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

export interface IUser extends Document {
  UserId: string;
  FirstName : string;
  LastName : string;
  Email: string;
  PhoneNumber : string;
  RegisteredNumber: string;
  Password?: string;
  role: "user" | "doctor" | "admin";
  isActive : boolean;
  activationCode? : string | null;
  activationCodeExpires? : Date | null;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  UserId: {
    type: String,
    required: true,
    unique: true,
  },
  FirstName : {
    type : String,
    required : true,
  },
  LastName : {
    type : String,
    required : true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid Email"],
  },
  PhoneNumber : {
    type : String,
    required : true,
  },
  RegisteredNumber: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "user",
  },
  isActive : {
    type : Boolean,
    default : false,
  },
  activationCode : {
    type : String,
    default : null
  },
  activationCodeExpires : {
    type : Date,
    default : null
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);
