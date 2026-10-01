import bcrypt from "bcrypt";
import crypto from "crypto";
import { User, IUser } from "../Models/User";
import { sendActivationCode } from "../Utils/SendActivationEmail";
import { sendResetCode } from "../Utils/SendResetCode";
import { sendActivationSms, sendResetSms } from "./sms";
import { normalizePhone, samePhone } from "../Utils/phone";
import { ServiceError } from "./errors";

const ACTIVATION_CODE_TTL_MS = 5 * 60 * 1000;
const RECOVERY_CODE_TTL_MS = 15 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

// How a flow identifies the patient: the id from their token if they have
// one, otherwise the email or UserId they typed.
export interface UserLookup {
  id?: string;
  email?: string;
  UserId?: string;
}

// Result of sending a one-time code. `phone` is where the SMS went, if one did.
export interface CodeDelivery {
  user: IUser;
  phone: string | null;
  smsSent: boolean;
}

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Codes are texted to the number the hospital registered for the patient,
// never to a number supplied in the request.
function smsNumberFor(user: IUser): string | null {
  return normalizePhone(user.RegisteredNumber) ?? normalizePhone(user.PhoneNumber);
}

function findUser({ id, email, UserId }: UserLookup) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (id) return User.findById(id);
  if (normalizedEmail) return User.findOne({ Email: normalizedEmail });
  if (UserId) return User.findOne({ UserId });
  return null;
}

async function setNewPassword(lookup: UserLookup, password: string, notFoundMessage: string) {
  const user = await findUser(lookup);
  if (!user) throw new ServiceError(404, notFoundMessage);

  user.Password = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await user.save();
  return user;
}

// Checks the patient against the hospital's records and sends an activation
// code by email and, when a number is on file, by SMS.
export async function startActivation(UserId: string, Email: string, RegisteredNumber: string): Promise<CodeDelivery> {
  // Compare phone numbers by value, not by text, so "+234 803 123 4567"
  // matches a stored "08031234567". Same error for every mismatch so the
  // response never reveals which detail was wrong.
  const user = await User.findOne({ UserId: UserId.trim(), Email: Email.trim().toLowerCase() });
  if (!user || !samePhone(user.RegisteredNumber, RegisteredNumber)) {
    throw new ServiceError(404, "Patient not found");
  }
  if (user.isActive) {
    throw new ServiceError(400, "Patient Account already activated");
  }

  const code = generateCode();
  user.activationCode = code;
  user.activationCodeExpires = new Date(Date.now() + ACTIVATION_CODE_TTL_MS);
  await user.save();

  const phone = smsNumberFor(user);
  const [, smsSent] = await Promise.all([
    sendActivationCode(user.Email, user.FirstName, code),
    phone ? sendActivationSms(phone, user.FirstName, code) : Promise.resolve(false),
  ]);
  return { user, phone, smsSent };
}

export async function activateAccount(lookup: UserLookup, code: string) {
  const user = await findUser(lookup);
  if (!user) throw new ServiceError(404, "Patient not found");

  if (user.activationCode !== code) throw new ServiceError(400, "Invalid code");
  if (!user.activationCodeExpires) throw new ServiceError(400, "No activation code expiry set");
  if (user.activationCodeExpires < new Date()) throw new ServiceError(400, "Code expired");

  user.isActive = true;
  user.activationCode = null;
  user.activationCodeExpires = null;
  await user.save();
  return user;
}

export function setPassword(lookup: UserLookup, password: string) {
  return setNewPassword(lookup, password, "Patient not found");
}

export async function authenticate(UserId: string, password: string) {
  const user = await User.findOne({ UserId });
  if (!user) throw new ServiceError(404, "User not found");
  if (!user.Password) throw new ServiceError(400, "No Password set for this account");

  const passwordMatch = await bcrypt.compare(password, user.Password);
  if (!passwordMatch) throw new ServiceError(401, "Invalid Credentials");
  return user;
}

export async function startPasswordRecovery(email: string): Promise<CodeDelivery> {
  const user = await User.findOne({ Email: email });
  if (!user) throw new ServiceError(404, "User not found");

  const code = generateCode();
  user.activationCode = code;
  user.activationCodeExpires = new Date(Date.now() + RECOVERY_CODE_TTL_MS);
  await user.save();

  const phone = smsNumberFor(user);
  const [, smsSent] = await Promise.all([
    sendResetCode(user.Email, user.FirstName, code),
    phone ? sendResetSms(phone, user.FirstName, code) : Promise.resolve(false),
  ]);
  return { user, phone, smsSent };
}

export async function verifyRecoveryCode(code: string, email?: string) {
  const user = await User.findOne({
    activationCode: code,
    ...(email ? { Email: email } : {}),
  });
  if (!user) throw new ServiceError(404, "Invalid code");
  if (!user.activationCodeExpires || user.activationCodeExpires < new Date()) {
    throw new ServiceError(400, "Code expired");
  }

  user.activationCode = null;
  user.activationCodeExpires = null;
  await user.save();
  return user;
}

export function resetPassword(lookup: UserLookup, password: string) {
  return setNewPassword(lookup, password, "User not found");
}
