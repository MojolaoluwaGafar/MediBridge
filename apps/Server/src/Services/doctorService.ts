import { Doctor } from "../Models/Doctor";
import { ServiceError } from "./errors";

// The public directory. Plain objects (lean) are all the response needs, and
// the doctor's login account (userId) is internal, so it's left out.
const PUBLIC_FIELDS = { userId: 0, __v: 0 };

export function listDoctors() {
  return Doctor.find({}, PUBLIC_FIELDS).lean();
}

export async function getDoctor(id: string) {
  const doctor = await Doctor.findById(id, PUBLIC_FIELDS).lean();
  if (!doctor) throw new ServiceError(404, "Doctor not found");
  return doctor;
}
