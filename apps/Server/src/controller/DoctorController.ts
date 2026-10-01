import { Request, Response } from "express";
import { listDoctors, getDoctor } from "../Services/doctorService";
import { isServiceError } from "../Services/errors";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await listDoctors();
    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctor(req.params.id as string);
    return res.status(200).json({ success: true, doctor });
  } catch (error: any) {
    if (isServiceError(error)) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
