"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendActivationCode = void 0;
const SendMail_1 = require("../Utils/SendMail");
const Activate_1 = require("../MailTemplates/Activate");
const sendActivationCode = (email, FirstName, code) => {
    const subject = "Your Activation Code";
    const html = (0, Activate_1.ActivationTemplate)(FirstName, code);
    return (0, SendMail_1.SendEmail)({ to: email, subject, html });
};
exports.sendActivationCode = sendActivationCode;
