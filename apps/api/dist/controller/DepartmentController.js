"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentById = exports.getDepartments = void 0;
const Department_1 = __importDefault(require("../Models/Department"));
const getDepartments = async (_req, res) => {
    try {
        const departments = await Department_1.default.find().sort({ field: 1 });
        res.status(200).json(departments);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch departments." });
    }
};
exports.getDepartments = getDepartments;
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department_1.default.findById(req.params.id);
        if (!department) {
            return res.status(404).json({
                message: "Department not found.",
            });
        }
        res.status(200).json(department);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch department.",
        });
    }
};
exports.getDepartmentById = getDepartmentById;
