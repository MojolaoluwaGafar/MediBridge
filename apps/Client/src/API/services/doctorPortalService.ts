import api from "../index";
import type { IMedicalRecord } from "../../types/record";
import type {
  AppointmentView,
  IAvailabilityPayload,
  IAvailabilityRes,
  IDoctorAppointment,
  IDoctorDashboard,
  IDoctorPatientProfile,
  IDoctorPatientRow,
  IDoctorProfile,
  IVisitNote,
} from "../../types/doctorPortal";

// The doctor portal's API (/api/doctor/*). Doctor logins only.
export const doctorPortalService = {
  async getMe(): Promise<IDoctorProfile> {
    const { data } = await api.get<{ doctor: IDoctorProfile }>("/api/doctor/me");
    return data.doctor;
  },

  async getDashboard(): Promise<IDoctorDashboard> {
    const { data } = await api.get<IDoctorDashboard>("/api/doctor/dashboard");
    return data;
  },

  async getAppointments(view: AppointmentView = "upcoming"): Promise<IDoctorAppointment[]> {
    const { data } = await api.get<{ appointments: IDoctorAppointment[] }>("/api/doctor/appointments", {
      params: { view },
    });
    return data.appointments;
  },

  async completeAppointment(id: string): Promise<IDoctorAppointment> {
    const { data } = await api.patch<{ appointment: IDoctorAppointment }>(`/api/doctor/appointments/${id}/complete`);
    return data.appointment;
  },

  async cancelAppointment(id: string, reason: string): Promise<IDoctorAppointment> {
    const { data } = await api.patch<{ appointment: IDoctorAppointment }>(`/api/doctor/appointments/${id}/cancel`, {
      reason,
    });
    return data.appointment;
  },

  async setUrgency(id: string, level: string, reason?: string) {
    const { data } = await api.patch(`/api/appointment/${id}/urgency`, { level, reason });
    return data;
  },

  async getPatients(): Promise<IDoctorPatientRow[]> {
    const { data } = await api.get<{ patients: IDoctorPatientRow[] }>("/api/doctor/patients");
    return data.patients;
  },

  async getPatient(id: string): Promise<IDoctorPatientProfile> {
    const { data } = await api.get<IDoctorPatientProfile>(`/api/doctor/patients/${id}`);
    return data;
  },

  async getPatientRecord(patientId: string, recordId: string): Promise<IMedicalRecord> {
    const { data } = await api.get<{ record: IMedicalRecord }>(`/api/doctor/patients/${patientId}/records/${recordId}`);
    return data.record;
  },

  // A blob, like the patient download, so the PDF never sits at a shareable URL.
  async downloadPatientRecord(patientId: string, recordId: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/api/doctor/patients/${patientId}/records/${recordId}/pdf`, {
      responseType: "blob",
    });
    return data;
  },

  async addNote(patientId: string, body: string, appointmentId?: string): Promise<IVisitNote> {
    const { data } = await api.post<{ note: IVisitNote }>(`/api/doctor/patients/${patientId}/notes`, {
      body,
      appointmentId,
    });
    return data.note;
  },

  async updateAvailability(payload: IAvailabilityPayload): Promise<IAvailabilityRes> {
    const { data } = await api.put<IAvailabilityRes>("/api/doctor/availability", payload);
    return data;
  },

  async reviewFlag(id: string, note?: string) {
    const { data } = await api.patch(`/api/flags/${id}/review`, { note });
    return data;
  },
};
