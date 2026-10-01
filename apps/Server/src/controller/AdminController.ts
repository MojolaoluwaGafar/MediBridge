import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import * as doctorAccountService from "../Services/doctorAccountService";
import { sendError } from "../Utils/sendError";

export const getDoctorAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await doctorAccountService.listDoctorAccounts();
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    return sendError(req, res, error);
  }
};

// Body: { account } — the login's User ID or email.
export const linkDoctorAccount = async (req: AuthRequest, res: Response) => {
  try {
    const account = typeof req.body?.account === "string" ? req.body.account : "";
    if (!account.trim()) {
      return res.status(400).json({ success: false, message: "Enter the doctor's User ID or email", errors: [{ field: "account", message: "Required" }] });
    }
    const result = await doctorAccountService.linkDoctorAccount(req.params.id as string, account);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const unlinkDoctorAccount = async (req: AuthRequest, res: Response) => {
  try {
    const result = await doctorAccountService.unlinkDoctorAccount(req.params.id as string);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return sendError(req, res, error);
  }
};
