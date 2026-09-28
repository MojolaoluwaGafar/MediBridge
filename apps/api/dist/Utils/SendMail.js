"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const brevo_1 = require("@getbrevo/brevo");
dotenv_1.default.config();
const brevoApiKey = process.env.BREVO_API_KEY?.trim();
const fromAddress = process.env.EMAIL_FROM?.trim() || "onboarding@yourdomain.com";
const brevoClient = brevoApiKey
    ? new brevo_1.BrevoClient({ apiKey: brevoApiKey })
    : null;
const createTransporter = () => {
    const user = process.env.APP_EMAIL?.trim();
    const pass = process.env.APP_PASSWORD?.replace(/\s+/g, "").trim();
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE === "true";
    if (!user || !pass) {
        throw new Error("Email credentials are not configured.");
    }
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        requireTLS: true,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        family: 4,
    });
};
const SendEmail = async ({ to, subject, html }) => {
    if (brevoClient && fromAddress && fromAddress !== "onboarding@yourdomain.com") {
        try {
            await brevoClient.transactionalEmails.sendTransacEmail({
                sender: {
                    email: fromAddress,
                    name: "MediBridge",
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            });
            console.log("Email sent via Brevo");
            return { accepted: [to], rejected: [], response: "Email sent via Brevo" };
        }
        catch (error) {
            console.error("Brevo email failed:", error.message);
        }
    }
    if (process.env.NODE_ENV === "production") {
        console.warn("Production email delivery skipped because no valid mail provider is configured.");
        return {
            accepted: [to],
            rejected: [],
            response: "Production email delivery skipped because no valid mail provider is configured.",
        };
    }
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: `"MediBridge" <${process.env.APP_EMAIL?.trim()}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent : ${info.response}`);
        return info;
    }
    catch (error) {
        console.error("Email failed to send:", error.message);
        if (error?.code) {
            console.error("SMTP code:", error.code);
        }
        if (error?.response) {
            console.error("SMTP response:", error.response);
        }
        throw new Error("Failed to send email.");
    }
};
exports.SendEmail = SendEmail;
