import type { Request, Response } from "express";
import { RECORD_TYPE_LABELS, type IMedicalRecord, type IRecordAttachment } from "../Models/MedicalRecord";
import { downloadName, readDocument } from "../Services/documentStorage";
import { writeRecordPdf } from "../Services/recordPdf";
import { sendError } from "./sendError";

type RecordLike = Pick<IMedicalRecord, "title" | "type" | "department" | "visitDate" | "summary" | "sections"> & {
  attachment?: IRecordAttachment | null;
  doctor?: unknown;
};
type PatientLike = { FirstName: string; LastName: string; UserId: string };

// What a browser may see of a record's file: never where it's stored.
export function toPublicRecord<T extends { attachment?: IRecordAttachment | null }>(record: T) {
  const { attachment, ...rest } = record;
  return {
    ...rest,
    attachment: attachment
      ? { contentType: attachment.contentType, bytes: attachment.bytes, originalName: attachment.originalName }
      : null,
  };
}

// Sends a record for download, for patients, doctors and admins alike: the
// uploaded file when staff attached one, otherwise a PDF generated from the
// record's text. Medical documents must never be cached.
export async function sendRecordDownload(req: Request, res: Response, record: RecordLike, patient: PatientLike) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (record.attachment) {
      const file = await readDocument(record.attachment);
      res.setHeader("Content-Type", record.attachment.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName(record.title, record.attachment.contentType)}"`);
      return res.send(file);
    }

    const author = record.doctor as { docName?: string } | undefined;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName(record.title, "application/pdf")}"`);
    writeRecordPdf(
      {
        title: record.title,
        typeLabel: RECORD_TYPE_LABELS[record.type],
        department: record.department,
        visitDate: record.visitDate,
        doctorName: author?.docName,
        patientName: `${patient.FirstName} ${patient.LastName}`,
        patientId: patient.UserId,
        summary: record.summary,
        sections: record.sections ?? [],
      },
      res
    );
  } catch (error) {
    if (res.headersSent) {
      req.log.error({ err: error }, "Record download failed mid-stream");
      return res.end();
    }
    return sendError(req, res, error);
  }
}
