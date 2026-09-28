"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = void 0;
const Activity_1 = require("../Models/Activity");
const mongoose_1 = __importDefault(require("mongoose"));
const getActivities = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const activities = await Activity_1.Activity.find({ userId: new mongoose_1.default.Types.ObjectId(req.user.id) })
            .sort({ timestamp: -1 })
            .limit(10);
        return res.status(200).json({ success: true, activities });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.getActivities = getActivities;
