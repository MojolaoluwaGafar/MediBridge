"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorById = exports.getDoctors = void 0;
const Doctor_1 = require("../Models/Doctor");
const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor_1.Doctor.find();
        return res.status(200).json({
            success: true,
            doctors,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getDoctors = getDoctors;
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor_1.Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        return res.status(200).json({ success: true, doctor });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getDoctorById = getDoctorById;
