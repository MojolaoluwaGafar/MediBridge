import { Router } from "express";
import {  getDepartments ,getDepartmentById } from "../controller/DepartmentController";

const router = Router();

router.get("/departments", getDepartments);
router.get("/departments/:id", getDepartmentById);
// Older singular path, kept so existing callers keep working.
router.get("/department/:id", getDepartmentById);

export default router;