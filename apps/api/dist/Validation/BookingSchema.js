"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingSchema = void 0;
const zod_1 = require("zod");
exports.BookingSchema = zod_1.z.object({
    department: zod_1.z.string().min(1, "Department is required"),
    doctor: zod_1.z.string().min(1, "Doctor is required"),
    date: zod_1.z.string().min(1, "Date is required"),
    time: zod_1.z.string().min(1, "Time is required"),
    reason: zod_1.z.string().min(1, "Reason is required"),
    shareRecords: zod_1.z.boolean().optional(),
});
