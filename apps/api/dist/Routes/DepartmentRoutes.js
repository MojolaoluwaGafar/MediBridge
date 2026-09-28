"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DepartmentController_1 = require("../controller/DepartmentController");
const router = (0, express_1.Router)();
router.get("/departments", DepartmentController_1.getDepartments);
router.get("/department/:id", DepartmentController_1.getDepartmentById);
exports.default = router;
