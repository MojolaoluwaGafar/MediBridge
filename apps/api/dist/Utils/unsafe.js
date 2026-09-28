"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsafeKeywords = void 0;
exports.getUnsafeReason = getUnsafeReason;
exports.unsafeKeywords = [
    "suicide",
    "kill myself",
    "end my life",
    "self harm",
    "bomb",
    "murder",
    "hate crime",
    "overdose"
];
function getUnsafeReason(message) {
    const lowerMessage = message.toLowerCase();
    const matchedKeyword = exports.unsafeKeywords.find(keyword => lowerMessage.includes(keyword));
    return matchedKeyword || null;
}
