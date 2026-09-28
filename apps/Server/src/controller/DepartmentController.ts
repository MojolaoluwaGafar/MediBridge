import { Request, Response } from "express";
import Department from "../Models/Department";

export const getDepartments = async (
  _req: Request,
  res: Response
) => {
  try {
    const departments = await Department.find().sort({ field: 1 });

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments." });
  }
};

export const getDepartmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found.",
      });
    }

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch department.",
    });
  }
};