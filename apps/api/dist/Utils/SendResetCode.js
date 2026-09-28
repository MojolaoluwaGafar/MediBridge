"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetCode = void 0;
const SendMail_1 = require("../Utils/SendMail");
const CodeReq_1 = require("../MailTemplates/CodeReq");
const sendResetCode = (email, FirstName, code) => {
    const subject = "Your Activation Code";
    const html = (0, CodeReq_1.ResetTemplate)(FirstName, code);
    return (0, SendMail_1.SendEmail)({ to: email, subject, html });
};
exports.sendResetCode = sendResetCode;
