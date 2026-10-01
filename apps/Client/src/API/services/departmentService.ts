import { PublicApi } from "../index";
import type { IDepartment } from "../../types/department";

// Departments are public, so these calls use PublicApi (no auth header).
export const departmentService = {
  async getDepartments(): Promise<IDepartment[]> {
    const { data } = await PublicApi.get<IDepartment[]>(
      "/api/departments"
    );

    return data;
  },

  // The API returns the department document itself.
  async getDepartment(id: string): Promise<IDepartment> {
    const { data } = await PublicApi.get<IDepartment>(
      `/api/departments/${id}`
    );

    return data;
  },
};
