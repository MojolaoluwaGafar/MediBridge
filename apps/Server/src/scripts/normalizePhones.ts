import mongoose from "mongoose";
import dotenv from "dotenv";
import { normalizePhone } from "../Utils/phone";
import { logger } from "../Utils/logger";

dotenv.config();

// Rewrites every user's PhoneNumber and RegisteredNumber in E.164
// (+2348031234567). Activation already matches old formats, so this is for
// consistent data, not a prerequisite.
//
//   npm run migrate:phones              dry run: shows what would change
//   npm run migrate:phones -- --apply   writes the changes
//
// Numbers that cannot be parsed, or that would collide with another patient's
// RegisteredNumber once normalized, are reported and left untouched.
async function normalizePhones(apply: boolean) {
  await mongoose.connect(process.env.DB_CONNECTION_URL!, {
    dbName: process.env.DB_NAME || "hospitalDB",
  });
  // The raw collection bypasses the model's setters and validators, so every
  // stored value is read exactly as it is.
  const users = mongoose.connection.db!.collection("users");

  const docs = await users
    .find({}, { projection: { UserId: 1, PhoneNumber: 1, RegisteredNumber: 1 } })
    .toArray();

  const claimed = new Map<string, string>();
  for (const doc of docs) {
    const registered = normalizePhone(doc.RegisteredNumber);
    if (registered) claimed.set(registered, claimed.has(registered) ? "DUPLICATE" : String(doc._id));
  }

  let changed = 0;
  let skipped = 0;
  for (const doc of docs) {
    const update: Record<string, string> = {};
    for (const field of ["PhoneNumber", "RegisteredNumber"] as const) {
      const current = doc[field];
      const normalized = normalizePhone(current);
      if (!normalized) {
        logger.warn({ UserId: doc.UserId, field }, "Unparseable phone number left as is; fix it by hand");
        skipped++;
        continue;
      }
      if (field === "RegisteredNumber" && claimed.get(normalized) === "DUPLICATE") {
        logger.warn({ UserId: doc.UserId, field }, "Normalized number is shared by several patients; left as is");
        skipped++;
        continue;
      }
      if (normalized !== current) update[field] = normalized;
    }

    if (Object.keys(update).length > 0) {
      changed++;
      logger.info({ UserId: doc.UserId, fields: Object.keys(update) }, apply ? "Normalized" : "Would normalize");
      if (apply) await users.updateOne({ _id: doc._id }, { $set: update });
    }
  }

  logger.info(
    { users: docs.length, changed, skipped, applied: apply },
    apply ? "Phone normalization finished" : "Dry run finished; re-run with --apply to write changes"
  );
}

normalizePhones(process.argv.includes("--apply"))
  .catch((error) => {
    logger.error({ err: error }, "Phone normalization failed");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
