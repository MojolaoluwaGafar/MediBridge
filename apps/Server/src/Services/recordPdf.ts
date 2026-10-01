import PDFDocument from "pdfkit";
import type { Writable } from "stream";

const BRAND = "#28574E";
const MUTED = "#605E5E";

export interface RecordPdfInput {
  title: string;
  typeLabel: string;
  department: string;
  visitDate: Date;
  doctorName?: string;
  patientName: string;
  patientId: string;
  summary?: string;
  sections: { heading: string; body: string }[];
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

// Writes a one-record PDF to `out` (usually the HTTP response). Kept free of
// Express and Mongoose so the doctor portal or an email job can reuse it.
export function writeRecordPdf(record: RecordPdfInput, out: Writable) {
  const doc = new PDFDocument({ size: "A4", margin: 56, info: { Title: record.title, Author: "MediBridge" } });
  doc.pipe(out);

  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(20).text("MediBridge");
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text("Patient medical record");
  doc.moveDown(1.5);

  doc.fillColor("black").font("Helvetica-Bold").fontSize(16).text(record.title);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(record.typeLabel);
  doc.moveDown();

  const details: [string, string][] = [
    ["Patient", `${record.patientName} (${record.patientId})`],
    ["Date of visit", formatDate(record.visitDate)],
    ["Department", record.department],
    ["Doctor", record.doctorName ?? "Not recorded"],
  ];
  for (const [label, value] of details) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(`${label}: `, { continued: true });
    doc.fillColor("black").text(value);
  }

  doc.moveDown();
  doc
    .strokeColor("#D7D7D7")
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown();

  if (record.summary) {
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(12).text("Summary");
    doc.fillColor("black").font("Helvetica").fontSize(11).text(record.summary);
    doc.moveDown();
  }

  for (const section of record.sections) {
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(12).text(section.heading);
    doc.fillColor("black").font("Helvetica").fontSize(11).text(section.body);
    doc.moveDown();
  }

  doc.moveDown();
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .text(
      `Downloaded from the MediBridge patient portal on ${formatDate(new Date())}. Contact the hospital if anything in this record looks wrong.`
    );

  doc.end();
}
