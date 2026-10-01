import { Request, Response } from "express";
import { listDepartments, getDepartment } from "../Services/departmentService";
import { isServiceError } from "../Services/errors";

export const getDepartments = async (
  _req: Request,
  res: Response
) => {
  try {
    const departments = await listDepartments();

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
    const department = await getDepartment(req.params.id as string);

    res.status(200).json(department);
  } catch (error) {
    if (isServiceError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({
      message: "Failed to fetch department.",
    });
  }
};
