import { useApiQuery } from "../Api/useApiQuery";
import { departmentService } from "../../API/services/departmentService";
import type { IDepartment } from "../../types/department";

export const useDepartments = () =>
  useApiQuery<IDepartment[]>(
    departmentService.getDepartments,
    "Failed to load departments"
  );

export const useDepartment = (id?: string) =>
  useApiQuery(
    () => departmentService.getDepartment(id!),
    "Failed to load department",
    { enabled: !!id }
  );