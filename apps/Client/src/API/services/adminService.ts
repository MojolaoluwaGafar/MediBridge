import api from "../index";
import type {
  IAdminDepartment,
  IAdminDoctor,
  IAdminOverview,
  IAdminPatientDetail,
  IAdminRecord,
  IDepartmentPayload,
  IDoctorPayload,
  IFlag,
  IPeoplePage,
  IPerson,
  IPersonPayload,
  UploadRecordType,
} from "../../types/admin";
import type { IAvailabilityPayload, IAvailabilityRes } from "../../types/doctorPortal";

// The admin portal's API (/api/admin/*). Admin logins only.
export const adminService = {
  async getOverview(): Promise<IAdminOverview> {
    const { data } = await api.get<IAdminOverview>("/api/admin/overview");
    return data;
  },

  async listPatients(q = "", page = 1): Promise<IPeoplePage> {
    const { data } = await api.get<IPeoplePage>("/api/admin/patients", { params: { q, page } });
    return data;
  },

  async createPatient(payload: IPersonPayload): Promise<IPerson> {
    const { data } = await api.post<{ patient: IPerson }>("/api/admin/patients", payload);
    return data.patient;
  },

  async getPatient(id: string): Promise<IAdminPatientDetail> {
    const { data } = await api.get<IAdminPatientDetail>(`/api/admin/patients/${id}`);
    return data;
  },

  async updatePatient(id: string, payload: Partial<IPersonPayload>): Promise<IPerson> {
    const { data } = await api.patch<{ patient: IPerson }>(`/api/admin/patients/${id}`, payload);
    return data.patient;
  },

  async uploadRecord(
    patientId: string,
    fields: { type: UploadRecordType; title: string; department: string; visitDate: string; summary: string },
    file: File
  ): Promise<IAdminRecord> {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, value));
    form.append("file", file);
    const { data } = await api.post<{ record: IAdminRecord }>(`/api/admin/patients/${patientId}/records`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.record;
  },

  async downloadRecord(patientId: string, recordId: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/api/admin/patients/${patientId}/records/${recordId}/file`, { responseType: "blob" });
    return data;
  },

  async deleteRecord(recordId: string) {
    await api.delete(`/api/admin/records/${recordId}`);
  },

  async listDoctors(): Promise<IAdminDoctor[]> {
    const { data } = await api.get<{ doctors: IAdminDoctor[] }>("/api/admin/doctors");
    return data.doctors;
  },

  async createDoctor(payload: IDoctorPayload): Promise<string> {
    const { data } = await api.post<{ id: string }>("/api/admin/doctors", payload);
    return data.id;
  },

  async updateDoctor(id: string, payload: Partial<IDoctorPayload>) {
    await api.patch(`/api/admin/doctors/${id}`, payload);
  },

  async setDoctorHours(id: string, payload: IAvailabilityPayload): Promise<IAvailabilityRes> {
    const { data } = await api.put<IAvailabilityRes>(`/api/admin/doctors/${id}/availability`, payload);
    return data;
  },

  async uploadDoctorPhoto(id: string, file: File): Promise<string> {
    const form = new FormData();
    form.append("photo", file);
    const { data } = await api.post<{ docImg: string }>(`/api/admin/doctors/${id}/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.docImg;
  },

  async createDoctorLogin(id: string, payload: IPersonPayload): Promise<IPerson> {
    const { data } = await api.post<{ account: IPerson }>(`/api/admin/doctors/${id}/login`, payload);
    return data.account;
  },

  async linkDoctorAccount(id: string, account: string) {
    await api.put(`/api/admin/doctors/${id}/account`, { account });
  },

  async unlinkDoctorAccount(id: string) {
    await api.delete(`/api/admin/doctors/${id}/account`);
  },

  async listDepartments(): Promise<IAdminDepartment[]> {
    const { data } = await api.get<{ departments: IAdminDepartment[] }>("/api/admin/departments");
    return data.departments;
  },

  async createDepartment(payload: IDepartmentPayload) {
    await api.post("/api/admin/departments", payload);
  },

  async updateDepartment(id: string, payload: Partial<IDepartmentPayload>) {
    await api.patch(`/api/admin/departments/${id}`, payload);
  },

  async listAdmins(q = "", page = 1): Promise<IPeoplePage> {
    const { data } = await api.get<IPeoplePage>("/api/admin/admins", { params: { q, page } });
    return data;
  },

  async createAdmin(payload: IPersonPayload): Promise<IPerson> {
    const { data } = await api.post<{ account: IPerson }>("/api/admin/admins", payload);
    return data.account;
  },

  async listFlags(status: "new" | "reviewed" | "" = "new"): Promise<IFlag[]> {
    const { data } = await api.get<{ flags: IFlag[] }>("/api/flags", { params: status ? { status } : {} });
    return data.flags;
  },

  async reviewFlag(id: string, note?: string) {
    await api.patch(`/api/flags/${id}/review`, { note });
  },
};
