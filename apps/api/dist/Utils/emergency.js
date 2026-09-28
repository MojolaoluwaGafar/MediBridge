"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmergency = isEmergency;
const emergencyKeywords = [
    "kill myself",
    "end my life",
    "suicide plan",
    "how to commit suicide"
];
function isEmergency(message) {
    return emergencyKeywords.some(keyword => message.toLowerCase().includes(keyword));
}
