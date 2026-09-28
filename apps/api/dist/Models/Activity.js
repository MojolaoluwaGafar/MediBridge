"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ActivitySchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["confirmed", "rescheduled", "cancelled"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
exports.Activity = mongoose_1.default.model("Activity", ActivitySchema);
