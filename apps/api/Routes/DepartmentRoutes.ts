import { Router } from "express";
import {  getDepartments ,getDepartmentById } from "../controller/DepartmentController";

const router = Router();

router.get("/departments", getDepartments);
router.get("/department/:id", getDepartmentById);

export default router;