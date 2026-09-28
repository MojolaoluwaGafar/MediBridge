"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.rescheduleAppointment = exports.getAppointments = exports.bookAppointment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BookingSchema_1 = require("../Validation/BookingSchema");
const Appointment_1 = require("../Models/Appointment");
const Activity_1 = require("../Models/Activity");
const bookAppointment = async (req, res) => {
    try {
        const parsed = BookingSchema_1.BookingSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { department, doctor, date, time, reason, shareRecords } = parsed.data;
        const appointment = await Appointment_1.Appointment.create({
            department,
            doctor: new mongoose_1.default.Types.ObjectId(doctor),
            date,
            time,
            reason,
            shareRecords,
            status: "confirmed",
            userId: new mongoose_1.default.Types.ObjectId(req.user.id),
            createdAt: new Date(),
        });
        const populatedAppointment = await Appointment_1.Appointment.findById(appointment._id).populate("doctor").lean();
        await Activity_1.Activity.create({
            userId: req.user.id,
            type: "confirmed",
            message: `${populatedAppointment?.department} with ${(populatedAppointment?.doctor).docName} – ${date}`,
        });
        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment: populatedAppointment,
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
exports.bookAppointment = bookAppointment;
const getAppointments = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const appointments = await Appointment_1.Appointment.find({
            userId: new mongoose_1.default.Types.ObjectId(req.user.id),
        }).sort({ date: 1, time: 1 }).populate("doctor");
        return res.status(200).json({
            success: true,
            appointments,
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
exports.getAppointments = getAppointments;
const rescheduleAppointment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const id = req.params.id;
        const { date, time } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
            });
        }
        const appointment = await Appointment_1.Appointment.findById(id)
            .where("userId")
            .equals(req.user.id)
            .populate("doctor");
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }
        appointment.date = date;
        appointment.time = time;
        appointment.status = "confirmed";
        await appointment.save();
        await Activity_1.Activity.create({
            userId: req.user.id,
            type: "rescheduled",
            message: `${appointment.department} with ${appointment.doctor.docName} – ${date}`,
        });
        return res.status(200).json({
            success: true,
            message: "Appointment rescheduled successfully",
            appointment,
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
exports.rescheduleAppointment = rescheduleAppointment;
const cancelAppointment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const id = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
            });
        }
        const appointment = await Appointment_1.Appointment.findById(id).where("userId").equals(req.user.id).populate("doctor");
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }
        if (appointment.status.toLowerCase() === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Appointment has already been cancelled",
            });
        }
        appointment.status = "cancelled";
        await appointment.save();
        await Activity_1.Activity.create({
            userId: req.user.id,
            type: "cancelled",
            message: `${appointment.department} with ${appointment.doctor.docName} – ${appointment.date}`,
        });
        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            appointment,
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
exports.cancelAppointment = cancelAppointment;
