import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../Models/User";
import { Appointment } from "../Models/Appointment";
import { Activity } from "../Models/Activity";
import { logger } from "../Utils/logger";

dotenv.config();

// A patient for exercising the API by hand or from tests. The details are
// obviously fake (example.com never receives mail) so the account cannot be
// mistaken for a real patient.
export const TEST_PATIENT = {
  UserId: "PTEST001",
  FirstName: "Test",
  LastName: "Patient",
  Email: "mojolaoluwa1212+test@gmail.com",
  PhoneNumber: "07086440726",
  RegisteredNumber: "07086440726",
  password: process.env.TEST_PATIENT_PASSWORD || "TestPatient@123",
};

export interface SeedPatientOptions {
  // true (default): active with a password, ready for POST /api/auth/login.
  // false: not activated and no password, for testing the activation flow
  // (POST /api/auth/verifyUser with UserId, Email and RegisteredNumber).
  activated?: boolean;
}

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a test patient with NODE_ENV=production.");
  }
}

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_CONNECTION_URL!, {
      dbName: process.env.DB_NAME || "hospitalDB",
    });
  }
}

// Creates or resets the test patient. Safe to run repeatedly: an existing test
// patient is overwritten back to a known state rather than duplicated.
export async function seedPatient({ activated = true }: SeedPatientOptions = {}) {
  assertNotProduction();
  await connect();

  const { password, ...profile } = TEST_PATIENT;
  const update = activated
    ? {
        $set: {
          ...profile,
          role: "user",
          isActive: true,
          Password: await bcrypt.hash(password, 12),
          activationCode: null,
          activationCodeExpires: null,
        },
      }
    : {
        $set: {
          ...profile,
          role: "user",
          isActive: false,
          activationCode: null,
          activationCodeExpires: null,
        },
        $unset: { Password: 1 },
      };

  const user = await User.findOneAndUpdate({ UserId: TEST_PATIENT.UserId }, update, {
    upsert: true,
    new: true,
    runValidators: true,
  });

  logger.info(
    { id: user._id.toString(), UserId: user.UserId, activated },
    activated ? "Test patient ready to log in" : "Test patient ready for activation"
  );
  return user;
}

// Deletes the test patient and everything it created while testing routes.
export async function removeTestPatient() {
  assertNotProduction();
  await connect();

  const user = await User.findOne({ UserId: TEST_PATIENT.UserId });
  if (!user) {
    logger.info("No test patient to remove");
    return;
  }

  const [appointments, activities] = await Promise.all([
    Appointment.deleteMany({ userId: user._id }),
    Activity.deleteMany({ userId: user._id }),
  ]);
  await user.deleteOne();

  logger.info(
    { appointments: appointments.deletedCount, activities: activities.deletedCount },
    "Test patient removed"
  );
}

// CLI:
//   npm run seed:patient                 active patient with a password
//   npm run seed:patient -- --inactive   patient waiting for activation
//   npm run seed:patient -- --remove     delete the patient and its data
if (require.main === module) {
  const args = process.argv.slice(2);
  const run = args.includes("--remove")
    ? removeTestPatient()
    : seedPatient({ activated: !args.includes("--inactive") });

  run
    .then(() => {
      if (!args.includes("--remove") && !args.includes("--inactive")) {
        const port = process.env.PORT || 5000;
        logger.info(
          `Log in with: curl -X POST http://localhost:${port}/api/auth/login -H "Content-Type: application/json" -d '{"UserId":"${TEST_PATIENT.UserId}","password":"${TEST_PATIENT.password}"}'`
        );
      }
    })
    .catch((error) => {
      logger.error({ err: error }, "Test patient seed failed");
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
