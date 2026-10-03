import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import * as recordService from "../Services/recordService";
import { sendRecordDownload } from "../Utils/recordDownload";
import { sendError } from "../Utils/sendError";

export const getRecords = async (req: AuthRequest, res: Response) => {
  try {
    const records = await recordService.listPatientRecords(req.user!.id);
    return res.status(200).json({ success: true, records });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const getRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await recordService.getPatientRecord(req.user!.id, req.params.id as string);
    return res.status(200).json({ success: true, record });
  } catch (error) {
    return sendError(req, res, error);
  }
};

// The uploaded file when staff attached one, otherwise a generated PDF.
export const downloadRecordPdf = async (req: AuthRequest, res: Response) => {
  try {
    const { record, patient } = await recordService.getRecordForDownload(req.user!.id, req.params.id as string);
    return sendRecordDownload(req, res, record, patient);
  } catch (error) {
    return sendError(req, res, error);
  }
};
