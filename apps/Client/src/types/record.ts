// Mirrors RECORD_TYPES in apps/Server/src/Models/MedicalRecord.ts.
export type RecordType =
  | "consultation"
  | "lab_result"
  | "prescription"
  | "imaging"
  | "discharge_summary";

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  consultation: "Consultation notes",
  lab_result: "Lab results",
  prescription: "Prescriptions",
  imaging: "Imaging",
  discharge_summary: "Discharge summaries",
};

export interface IRecordDoctor {
  _id: string;
  docName: string;
  docImg?: string;
  department: string;
}

export interface IMedicalRecord {
  _id: string;
  type: RecordType;
  title: string;
  department: string;
  visitDate: string;
  summary?: string;
  sections: { heading: string; body: string }[];
  doctor?: IRecordDoctor | null;
  createdAt: string;
  updatedAt: string;
}
