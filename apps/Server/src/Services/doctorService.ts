import { Doctor } from "../Models/Doctor";
import { ServiceError } from "./errors";

export function listDoctors() {
  return Doctor.find();
}

export async function getDoctor(id: string) {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new ServiceError(404, "Doctor not found");
  return doctor;
}
