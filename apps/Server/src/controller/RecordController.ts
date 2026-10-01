import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import * as recordService from "../Services/recordService";
import { writeRecordPdf } from "../Services/recordPdf";
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

export const downloadRecordPdf = async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, pdf } = await recordService.getRecordForPdf(req.user!.id, req.params.id as string);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    // Medical documents must not be kept in shared or browser caches.
    res.setHeader("Cache-Control", "no-store");
    writeRecordPdf(pdf, res);
  } catch (error) {
    if (res.headersSent) {
      req.log.error({ err: error }, "Record PDF failed mid-stream");
      return res.end();
    }
    return sendError(req, res, error);
  }
};
