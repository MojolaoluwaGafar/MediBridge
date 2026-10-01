import { Response } from "express";
import mongoose from "mongoose";
import { MedicalRecord, type RecordType } from "../Models/MedicalRecord";
import { User } from "../Models/User";
import type { IDoctor } from "../types/doctor";
import type { AuthRequest } from "../middlewares/Auth";
import { writeRecordPdf } from "../Services/recordPdf";

const TYPE_LABELS: Record<RecordType, string> = {
  consultation: "Consultation notes",
  lab_result: "Lab result",
  prescription: "Prescription",
  imaging: "Imaging report",
  discharge_summary: "Discharge summary",
};

// Patients only ever see their own records. Doctor access (for appointments
// where the patient chose to share records) comes with the doctor portal.
const ownRecord = (req: AuthRequest, id: string) =>
  MedicalRecord.findOne({ _id: id, patient: new mongoose.Types.ObjectId(req.user!.id) })
    .populate("doctor", "docName docImg department");

export const getRecords = async (req: AuthRequest, res: Response) => {
  try {
    const records = await MedicalRecord.find({ patient: new mongoose.Types.ObjectId(req.user!.id) })
      .sort({ visitDate: -1 })
      .populate("doctor", "docName docImg department")
      .lean();

    return res.status(200).json({ success: true, records });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const getRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid record ID" });
    }

    const record = await ownRecord(req, id).lean();
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    return res.status(200).json({ success: true, record });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const downloadRecordPdf = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid record ID" });
    }

    const [record, patient] = await Promise.all([
      ownRecord(req, id).lean(),
      User.findById(req.user!.id, { FirstName: 1, LastName: 1, UserId: 1 }).lean(),
    ]);
    if (!record || !patient) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const doctor = record.doctor as unknown as IDoctor | undefined;
    const fileName = `${record.title.replace(/[^\w-]+/g, "-").replace(/-+/g, "-")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    // Medical documents must not sit in shared or browser caches.
    res.setHeader("Cache-Control", "no-store");

    writeRecordPdf(
      {
        title: record.title,
        typeLabel: TYPE_LABELS[record.type],
        department: record.department,
        visitDate: record.visitDate,
        doctorName: doctor?.docName,
        patientName: `${patient.FirstName} ${patient.LastName}`,
        patientId: patient.UserId,
        summary: record.summary,
        sections: record.sections ?? [],
      },
      res
    );
  } catch (error: any) {
    if (res.headersSent) return res.end();
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
