// import { PublicApi } from "../index";
import type { IDepartment } from "../../types/department";
import type {
//   IGetDepartmentsRes,
  IGetDepartmentRes,
} from "../../types/apiReqRes";
import Axios from "axios"

const PublicApi = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const departmentService = {
  async getDepartments(): Promise<IDepartment[]> {
    const { data } = await PublicApi.get<IDepartment[]>(
      "/api/departments"
    );

    return data;
  },

  async getDepartment(id: string): Promise<IGetDepartmentRes> {
    const { data } = await PublicApi.get<IGetDepartmentRes>(
      `/api/departments/${id}`
    );

    return data;
  },
};