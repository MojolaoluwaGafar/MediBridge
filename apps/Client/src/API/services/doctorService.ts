import api from "../index";
import type {
  IGetDoctorsRes,
  IGetDoctorRes,
  IDoctorSlotsRes,
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

  // The doctor's slots on one date. Pass the appointment being rescheduled so
  // its own slot shows as free.
  async getSlots(id: string, date: string, appointmentId?: string): Promise<IDoctorSlotsRes> {
    const { data } = await api.get<IDoctorSlotsRes>(`/api/doctors/${id}/slots`, {
      params: { date, ...(appointmentId ? { appointmentId } : {}) },
    });

    return data;
  },
};
