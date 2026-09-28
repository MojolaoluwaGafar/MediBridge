"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const departmentSchema = new mongoose_1.Schema({
    field: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    availableSpecialist: {
        type: Number,
        default: 0,
    },
    icon: {
        type: String,
        required: true,
    },
    iconBgColor: String,
    iconColor: String,
    details: {
        overview: {
            type: String,
            required: true,
        },
        services: {
            type: [String],
            default: [],
        },
        image: {
            type: String,
            default: "",
        },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Department", departmentSchema);
