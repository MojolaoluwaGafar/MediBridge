"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DoctorController_1 = require("../controller/DoctorController");
const router = (0, express_1.Router)();
router.get("/doctors", DoctorController_1.getDoctors);
router.get("/doctors/:id", DoctorController_1.getDoctorById);
exports.default = router;
