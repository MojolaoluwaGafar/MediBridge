import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";
import { normalizePhone } from "../Utils/phone";

// Leaves an invalid number as typed so the validator below can reject it.
const toE164 = (value: string) => normalizePhone(value) ?? value;

// Rejects invalid numbers when a phone is set or changed. Existing records
// with an old unparseable number still save (e.g. during activation) until
// the number is corrected; `npm run migrate:phones` lists them.
const phoneValidator = (path: "PhoneNumber" | "RegisteredNumber") =>
  function (this: unknown, value: string) {
    const doc = this as mongoose.Document | undefined;
    if (doc && typeof doc.isModified === "function" && !doc.isNew && !doc.isModified(path)) return true;
    return normalizePhone(value) !== null;
  };

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
  ProfileImage? : string | null;
  ProfileImageId? : string | null;
  PasswordTicketHash? : string | null;
  PasswordTicketPurpose? : "activation" | "recovery" | null;
  PasswordTicketExpires? : Date | null;
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
  // Phone numbers are stored in E.164 (+2348031234567) however they are typed.
  PhoneNumber : {
    type : String,
    required : true,
    set : toE164,
    validate : [phoneValidator("PhoneNumber"), "Invalid phone number"],
  },
  RegisteredNumber: {
    type: String,
    required: true,
    unique: true,
    set : toE164,
    validate : [phoneValidator("RegisteredNumber"), "Invalid phone number"],
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
  // Profile photo URL, and its Cloudinary public ID so a replaced photo can be deleted.
  ProfileImage : {
    type : String,
    default : null
  },
  ProfileImageId : {
    type : String,
    default : null
  },
  // Proof that the patient just verified an emailed code, required to set or
  // reset the password. Only a SHA-256 hash is stored, it is single-use and
  // expires after a few minutes. See authService.issuePasswordTicket.
  PasswordTicketHash : {
    type : String,
    default : null,
    index : { sparse : true },
  },
  PasswordTicketPurpose : {
    type : String,
    enum : ["activation", "recovery", null],
    default : null
  },
  PasswordTicketExpires : {
    type : Date,
    default : null
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);
