import mongoose from "mongoose";
import Department from "../Models/Department";
import { Doctor } from "../Models/Doctor";
import { ServiceError } from "./errors";

// availableSpecialist is the live number of doctors taking bookings in each
// department (the stored value was typed in by hand and went stale).
export async function listDepartments() {
  const [departments, counts] = await Promise.all([
    Department.find().sort({ field: 1 }).lean(),
    Doctor.aggregate([{ $match: { availability: true } }, { $group: { _id: "$department", n: { $sum: 1 } } }]),
  ]);
  const byField = new Map(counts.map((c) => [c._id as string, c.n as number]));
  return departments.map((d) => ({ ...d, availableSpecialist: byField.get(d.field) ?? 0 }));
}

export async function getDepartment(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ServiceError(404, "Department not found.");
  const department = await Department.findById(id).lean();
  if (!department) throw new ServiceError(404, "Department not found.");
  return department;
}
