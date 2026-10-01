import axios from "axios";
import dotenv from "dotenv";
import { logger } from "../Utils/logger";
import { maskPhone } from "../Utils/phone";
dotenv.config();

// Which service delivers text messages, chosen with SMS_PROVIDER:
//   termii  - Nigerian provider; delivers OTPs to DND-registered lines
//   twilio  - international provider
//   console - development only: prints the message to the server log
//   none    - SMS disabled; codes go by email only
// Defaults to "console" in development and "none" in production, so the app
// works before any SMS account exists.
type SmsProviderName = "termii" | "twilio" | "console" | "none";

const isProduction = process.env.NODE_ENV === "production";

function providerName(): SmsProviderName {
  const configured = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (configured === "termii" || configured === "twilio" || configured === "none") return configured;
  if (configured === "console" && !isProduction) return "console";
  if (configured === "console") {
    logger.warn("SMS_PROVIDER=console is not allowed in production; SMS disabled");
    return "none";
  }
  return isProduction ? "none" : "console";
}

// `to` must be E.164 (see normalizePhone).
async function sendWithTermii(to: string, text: string) {
  const baseUrl = process.env.TERMII_BASE_URL || "https://v3.api.termii.com";
  await axios.post(
    `${baseUrl}/api/sms/send`,
    {
      api_key: process.env.TERMII_API_KEY,
      to: to.replace(/^\+/, ""),
      from: process.env.TERMII_SENDER_ID,
      sms: text,
      type: "plain",
      // "dnd" reaches numbers on Nigeria's Do-Not-Disturb list, which blocks
      // the "generic" route; OTPs need it.
      channel: process.env.TERMII_CHANNEL || "dnd",
    },
    { timeout: 10_000 }
  );
}

async function sendWithTwilio(to: string, text: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const form = new URLSearchParams({ To: to, Body: text });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    form.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  } else {
    form.set("From", process.env.TWILIO_FROM_NUMBER!);
  }
  await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, form, {
    auth: { username: sid, password: process.env.TWILIO_AUTH_TOKEN! },
    timeout: 10_000,
  });
}

// Sends a text message. Never throws: SMS is a second channel next to email,
// so a failed text must not fail the request. Returns whether it was sent.
export async function sendSms(to: string, text: string): Promise<boolean> {
  const provider = providerName();
  if (provider === "none") return false;

  try {
    if (provider === "termii") await sendWithTermii(to, text);
    else if (provider === "twilio") await sendWithTwilio(to, text);
    else logger.info({ to: maskPhone(to), text }, "SMS (console provider, not actually sent)");

    if (provider !== "console") logger.info({ to: maskPhone(to), provider }, "SMS sent");
    return true;
  } catch (error: any) {
    // Log only the provider's reply: the request itself carries the API key.
    logger.error(
      { to: maskPhone(to), provider, status: error.response?.status, details: error.response?.data, message: error.message },
      "SMS failed to send"
    );
    return false;
  }
}

export function sendActivationSms(to: string, firstName: string, code: string) {
  return sendSms(
    to,
    `Hello ${firstName}, your MediBridge activation code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`
  );
}

export function sendResetSms(to: string, firstName: string, code: string) {
  return sendSms(
    to,
    `Hello ${firstName}, your MediBridge verification code is ${code}. It expires in 15 minutes. If you did not request this, ignore this message.`
  );
}
