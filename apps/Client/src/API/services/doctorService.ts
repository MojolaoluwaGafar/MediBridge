import api from "../index";
import type {
  IGetDoctorsRes,
  IGetDoctorRes,
} from "../../types/apiReqRes";

export const doctorService = {
  async getDoctors(): Promise<IGetDoctorsRes> {
    const { data } = await api.get<IGetDoctorsRes>(
      "/api/doctors"
    );

    return data;
  },

  async getDoctor(id: string): Promise<IGetDoctorRes> {
    const { data } = await api.get<IGetDoctorRes>(
      `/api/doctors/${id}`
    );

    return data;
  },
};