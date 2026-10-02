import { Router } from "express";
import {  getDepartments ,getDepartmentById } from "../controller/DepartmentController";
import { publicCache } from "../middlewares/Performance";

const router = Router();

// Public and rarely edited, so browsers may reuse them for 5 minutes.
router.get("/departments", publicCache(300), getDepartments);
router.get("/departments/:id", publicCache(300), getDepartmentById);
// Older singular path, kept so existing callers keep working.
router.get("/department/:id", publicCache(300), getDepartmentById);

export default router;