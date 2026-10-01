import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";
import dotenv from "dotenv";
dotenv.config();

// Numbers typed without a country code (e.g. 0803 123 4567) are read as
// belonging to this country. Nigeria unless the hospital is elsewhere.
const DEFAULT_COUNTRY = (process.env.DEFAULT_PHONE_COUNTRY || "NG") as CountryCode;

// Converts any common way of writing a phone number ("0803 123 4567",
// "+234 803-123-4567", "(234) 8031234567") to E.164 ("+2348031234567"), the
// single format we store, compare and send SMS to. Returns null if the input
// is not a valid phone number.
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const phone = parsePhoneNumberFromString(input.trim(), DEFAULT_COUNTRY);
  return phone && phone.isValid() ? phone.number : null;
}

// True when two numbers are the same phone, however each was written.
export function samePhone(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normalizePhone(a);
  return left !== null && left === normalizePhone(b);
}

// "+2348031234567" -> "+234 *** *** 4567", safe to show in responses and logs.
export function maskPhone(e164: string): string {
  const phone = parsePhoneNumberFromString(e164);
  const lastFour = e164.slice(-4);
  return phone ? `+${phone.countryCallingCode} *** *** ${lastFour}` : `*** ${lastFour}`;
}
