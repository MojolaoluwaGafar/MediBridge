import { Request, Response } from "express";
import { Doctor } from "../Models/Doctor";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find();
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
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    return res.status(200).json({ success: true, doctor });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};