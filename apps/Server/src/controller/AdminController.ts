import { Response } from "express";
import type { ZodType } from "zod";
import type { AuthRequest } from "../middlewares/Auth";
import * as admin from "../Services/adminService";
import * as doctorAccountService from "../Services/doctorAccountService";
import { uploadAvatar } from "../config/Cloudinary";
import { sendRecordDownload } from "../Utils/recordDownload";
import { sendError, sendValidationError } from "../Utils/sendError";
import { AvailabilitySchema } from "../Validation/doctorSchema";
import {
  DepartmentSchema,
  DoctorProfileSchema,
  ListQuery,
  PersonSchema,
  UpdateDepartmentSchema,
  UpdateDoctorProfileSchema,
  UpdatePersonSchema,
  UploadRecordSchema,
} from "../Validation/adminSchema";

// Admin portal handlers. All routes are admin-only (see AdminRoutes).

type Handler = (req: AuthRequest, res: Response) => Promise<unknown>;
const handle = (fn: Handler) => async (req: AuthRequest, res: Response) => {
  try {
    await fn(req, res);
  } catch (error) {
    sendError(req, res, error);
  }
};

// Parses the body (or query) or answers 400 with field errors.
function parse<T>(schema: ZodType<T>, value: unknown, res: Response): T | null {
  const parsed = schema.safeParse(value ?? {});
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return null;
  }
  return parsed.data;
}

const param = (req: AuthRequest, name: string) => String(req.params[name]);

export const getOverview = handle(async (_req, res) => {
  res.status(200).json({ success: true, ...(await admin.getOverview()) });
});

// ----- Patients -----

export const listPatients = handle(async (req, res) => {
  const query = parse(ListQuery, req.query, res);
  if (!query) return;
  res.status(200).json({ success: true, ...(await admin.listPeople("user", query.q, query.page)) });
});

export const createPatient = handle(async (req, res) => {
  const body = parse(PersonSchema, req.body, res);
  if (!body) return;
  const patient = await admin.createPerson("user", body);
  res.status(201).json({ success: true, message: "Patient registered. They can now activate their account.", patient });
});

export const getPatient = handle(async (req, res) => {
  res.status(200).json({ success: true, ...(await admin.getPatient(param(req, "id"))) });
});

export const updatePatient = handle(async (req, res) => {
  const body = parse(UpdatePersonSchema, req.body, res);
  if (!body) return;
  const patient = await admin.updatePerson(param(req, "id"), "user", body);
  res.status(200).json({ success: true, message: "Patient details saved", patient });
});

// ----- Documents -----

export const uploadRecord = handle(async (req, res) => {
  const body = parse(UploadRecordSchema, req.body, res);
  if (!body) return;
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Choose a file to upload", errors: [{ field: "file", message: "Required" }] });
  }
  const record = await admin.uploadRecord(req.user!.id, param(req, "id"), body, req.file);
  res.status(201).json({ success: true, message: "Document added. The patient can now see it.", record });
});

export const downloadRecord = handle(async (req, res) => {
  const { record, patient } = await admin.getRecordForDownload(param(req, "id"), param(req, "recordId"));
  await sendRecordDownload(req, res, record, patient);
});

export const deleteRecord = handle(async (req, res) => {
  await admin.deleteUploadedRecord(req.user!.id, param(req, "id"));
  res.status(200).json({ success: true, message: "Document removed" });
});

// ----- Doctors -----

export const listDoctors = handle(async (_req, res) => {
  res.status(200).json({ success: true, doctors: await admin.listDoctors() });
});

export const createDoctor = handle(async (req, res) => {
  const body = parse(DoctorProfileSchema, req.body, res);
  if (!body) return;
  const id = await admin.createDoctor(body);
  res.status(201).json({ success: true, message: "Doctor added", id });
});

export const updateDoctor = handle(async (req, res) => {
  const body = parse(UpdateDoctorProfileSchema, req.body, res);
  if (!body) return;
  const id = await admin.updateDoctor(param(req, "id"), body);
  res.status(200).json({ success: true, message: "Doctor saved", id });
});

export const setDoctorHours = handle(async (req, res) => {
  const body = parse(AvailabilitySchema, req.body, res);
  if (!body) return;
  res.status(200).json({ success: true, message: "Hours saved", ...(await admin.setDoctorHours(param(req, "id"), body)) });
});

export const uploadDoctorPhoto = handle(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Choose a photo" });
  const { url } = await uploadAvatar(req.file.buffer);
  await admin.setDoctorPhoto(param(req, "id"), url);
  res.status(200).json({ success: true, message: "Photo updated", docImg: url });
});

export const createDoctorLogin = handle(async (req, res) => {
  const body = parse(PersonSchema, req.body, res);
  if (!body) return;
  const account = await admin.createDoctorLogin(param(req, "id"), body);
  res.status(201).json({ success: true, message: "Login created. The doctor can now activate it.", account });
});

// Body: { account } — an existing login's ID or email.
export const linkDoctorAccount = handle(async (req, res) => {
  const account = typeof req.body?.account === "string" ? req.body.account : "";
  if (!account.trim()) {
    return res.status(400).json({ success: false, message: "Enter the doctor's User ID or email", errors: [{ field: "account", message: "Required" }] });
  }
  const result = await doctorAccountService.linkDoctorAccount(param(req, "id"), account);
  res.status(200).json({ success: true, ...result });
});

export const unlinkDoctorAccount = handle(async (req, res) => {
  const result = await doctorAccountService.unlinkDoctorAccount(param(req, "id"));
  res.status(200).json({ success: true, ...result });
});

// ----- Departments -----

export const listDepartments = handle(async (_req, res) => {
  res.status(200).json({ success: true, departments: await admin.listDepartments() });
});

export const createDepartment = handle(async (req, res) => {
  const body = parse(DepartmentSchema, req.body, res);
  if (!body) return;
  const id = await admin.createDepartment(body);
  res.status(201).json({ success: true, message: "Department added", id });
});

export const updateDepartment = handle(async (req, res) => {
  const body = parse(UpdateDepartmentSchema, req.body, res);
  if (!body) return;
  const id = await admin.updateDepartment(param(req, "id"), body);
  res.status(200).json({ success: true, message: "Department saved", id });
});

// ----- Staff (admin) accounts -----

export const listAdmins = handle(async (req, res) => {
  const query = parse(ListQuery, req.query, res);
  if (!query) return;
  res.status(200).json({ success: true, ...(await admin.listPeople("admin", query.q, query.page)) });
});

export const createAdmin = handle(async (req, res) => {
  const body = parse(PersonSchema, req.body, res);
  if (!body) return;
  const account = await admin.createPerson("admin", body);
  res.status(201).json({ success: true, message: "Admin account created. They can now activate it.", account });
});
