import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doctor } from "../Models/Doctor";
import { linkDoctorAccount, unlinkDoctorAccount, listDoctorAccounts } from "../Services/doctorAccountService";
import { isServiceError } from "../Services/errors";

dotenv.config();

// Links a doctor profile to a login so that person can use the doctor portal.
// Until the admin portal exists, this is how doctor accounts are set up.
//
//   npm run link:doctor -- --list
//   npm run link:doctor -- --doctor "Dr. Elizabeth" --account D001
//   npm run link:doctor -- --doctor <profile id> --account doctor@hospital.org
//   npm run link:doctor -- --doctor "Dr. Elizabeth" --unlink
//
// --doctor takes the profile's ID or its exact name. --account takes the
// login's User ID or email. The login must already exist (created by the
// hospital like any patient account, then activated). The person must sign
// in again afterwards for the doctor role to take effect.

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function resolveDoctorId(value: string) {
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const matches = await Doctor.find({ docName: value }, { _id: 1 }).lean();
  if (matches.length === 1) return String(matches[0]._id);
  throw new Error(matches.length ? `More than one doctor is called "${value}". Use the profile ID from --list.` : `No doctor called "${value}". Run with --list to see them.`);
}

async function main() {
  await mongoose.connect(process.env.DB_CONNECTION_URL!, { dbName: process.env.DB_NAME || "hospitalDB" });

  if (process.argv.includes("--list")) {
    for (const d of await listDoctorAccounts()) {
      console.log(`${d.id}  ${d.name} (${d.department})  ->  ${d.account ? `${d.account.userId} <${d.account.email}>` : "not linked"}`);
    }
    return;
  }

  const doctor = arg("doctor");
  if (!doctor) throw new Error('Pass --doctor "<name or id>" (and --account <UserId or email>, or --unlink). Use --list to see doctors.');
  const doctorId = await resolveDoctorId(doctor);

  if (process.argv.includes("--unlink")) {
    const result = await unlinkDoctorAccount(doctorId);
    console.log(`Unlinked ${result.doctor.name}.`);
    return;
  }

  const account = arg("account");
  if (!account) throw new Error("Pass --account <UserId or email>, or --unlink.");
  const result = await linkDoctorAccount(doctorId, account);
  console.log(`Linked ${result.doctor.name} to ${result.account.userId} <${result.account.email}>. They need to sign in again.`);
}

main()
  .catch((error) => {
    console.error(isServiceError(error) || error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
