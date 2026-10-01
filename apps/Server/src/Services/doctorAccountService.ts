import mongoose from "mongoose";
import { Doctor } from "../Models/Doctor";
import { User } from "../Models/User";
import { ServiceError } from "./errors";

// A doctor has two records: the public Doctor profile (name, department,
// hours) and a User login. Linking them gives the login the "doctor" role and
// lets the doctor portal, Messages and urgency changes know which profile is
// theirs. Used by the admin API and by `npm run link:doctor`.

async function findDoctor(doctorId: string) {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) throw new ServiceError(404, "Doctor profile not found");
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ServiceError(404, "Doctor profile not found");
  return doctor;
}

// `account` is the login's User ID (e.g. "D001") or email address.
export async function linkDoctorAccount(doctorId: string, account: string) {
  const doctor = await findDoctor(doctorId);
  const key = account.trim();
  const user = await User.findOne(key.includes("@") ? { Email: key.toLowerCase() } : { UserId: key });
  if (!user) throw new ServiceError(404, `No account found for ${key}`, "account");
  if (user.role === "admin") throw new ServiceError(400, "Admin accounts can't be linked to a doctor profile", "account");

  const linkedElsewhere = await Doctor.findOne({ userId: user._id, _id: { $ne: doctor._id } });
  if (linkedElsewhere) {
    throw new ServiceError(409, `That account is already linked to ${linkedElsewhere.docName}`, "account");
  }

  // Unlink whoever had this profile before, so they lose doctor access.
  if (doctor.userId && !doctor.userId.equals(user._id as mongoose.Types.ObjectId)) {
    await User.updateOne({ _id: doctor.userId, role: "doctor" }, { role: "user" });
  }

  user.role = "doctor";
  await user.save();
  doctor.userId = user._id as mongoose.Types.ObjectId;
  await doctor.save();

  return { doctor: { id: doctor.id, name: doctor.docName }, account: { id: user.id, userId: user.UserId, email: user.Email } };
}

// Removes the link. The login keeps working but goes back to the patient role.
// The person must sign in again before the new role takes effect.
export async function unlinkDoctorAccount(doctorId: string) {
  const doctor = await findDoctor(doctorId);
  if (!doctor.userId) return { doctor: { id: doctor.id, name: doctor.docName }, account: null };

  await User.updateOne({ _id: doctor.userId, role: "doctor" }, { role: "user" });
  doctor.userId = undefined;
  await doctor.save();
  return { doctor: { id: doctor.id, name: doctor.docName }, account: null };
}

// Every doctor profile and the login linked to it, for the admin portal.
export async function listDoctorAccounts() {
  const doctors = await Doctor.find({}, { docName: 1, department: 1, userId: 1 })
    .populate("userId", "UserId Email FirstName LastName")
    .sort({ docName: 1 })
    .lean();

  return doctors.map((d) => {
    const account = d.userId as unknown as { _id: unknown; UserId: string; Email: string } | undefined;
    return {
      id: String(d._id),
      name: d.docName,
      department: d.department,
      account: account ? { id: String(account._id), userId: account.UserId, email: account.Email } : null,
    };
  });
}
