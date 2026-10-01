import mongoose from "mongoose";
import Department from "../Models/Department";
import { ServiceError } from "./errors";

export function listDepartments() {
  return Department.find().sort({ field: 1 });
}

export async function getDepartment(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ServiceError(404, "Department not found.");
  const department = await Department.findById(id);
  if (!department) throw new ServiceError(404, "Department not found.");
  return department;
}
