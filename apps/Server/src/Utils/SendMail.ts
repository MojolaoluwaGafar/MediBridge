import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { BrevoClient } from "@getbrevo/brevo";
import { logger } from "./logger";

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const brevoApiKey = process.env.BREVO_API_KEY?.trim();
const fromAddress = process.env.EMAIL_FROM?.trim() || "onboarding@yourdomain.com";
const brevoClient = brevoApiKey
  ? new BrevoClient({ apiKey: brevoApiKey })
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

  return nodemailer.createTransport({
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
  } as any);
};

export const SendEmail = async ({ to, subject, html }: EmailOptions) => {
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

      logger.info("Email sent via Brevo");
      return { accepted: [to], rejected: [], response: "Email sent via Brevo" };
    } catch (error: any) {
      logger.error({ err: error }, "Brevo email failed");
    }
  }

  if (process.env.NODE_ENV === "production") {
    logger.warn("Production email delivery skipped because no valid mail provider is configured.");
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
    logger.info({ response: info.response }, "Email sent");
    return info;
  } catch (error: any) {
    logger.error(
      { err: error, smtpCode: error?.code, smtpResponse: error?.response },
      "Email failed to send"
    );

    throw new Error("Failed to send email.");
  }
};
