import bcrypt from "bcrypt";
import { User, type IUser } from "../Models/User";
import cloudinary from "../config/Cloudinary";
import type { ChangePasswordInput } from "../Validation/accountSchema";
import { logger } from "../Utils/logger";
import { ServiceError } from "./errors";

// What the Account Settings page shows. Name, email, Patient ID and phone are
// read-only here: the hospital sets them, and email and phone are used to
// recover the account, so changing them needs a verified flow of its own.
export const toProfile = (user: IUser) => ({
  id: user._id,
  userId: user.UserId,
  firstname: user.FirstName,
  lastname: user.LastName,
  email: user.Email,
  phone: user.PhoneNumber,
  role: user.role,
  img: user.ProfileImage ?? null,
});

async function findUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ServiceError(404, "Account not found");
  return user;
}

// Deleting an old photo is housekeeping; never fail the request over it.
export async function deletePhoto(publicId?: string | null) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn({ err, publicId }, "Could not delete old profile photo");
  }
}

export async function getProfile(userId: string) {
  return toProfile(await findUser(userId));
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await findUser(userId);
  if (!user.Password) throw new ServiceError(404, "Account not found");

  // 400, not 401: the client signs people out on 401 and 403.
  const matches = await bcrypt.compare(input.currentPassword, user.Password);
  if (!matches) throw new ServiceError(400, "Your current password is incorrect", "currentPassword");

  user.Password = await bcrypt.hash(input.newPassword, 12);
  await user.save();
}

// `url` and `publicId` come from the Cloudinary upload (multer-storage-cloudinary
// puts them in req.file.path and req.file.filename).
export async function setPhoto(userId: string, url: string, publicId: string) {
  const user = await User.findById(userId);
  if (!user) {
    await deletePhoto(publicId);
    throw new ServiceError(404, "Account not found");
  }

  const previousId = user.ProfileImageId;
  user.ProfileImage = url;
  user.ProfileImageId = publicId;
  await user.save();
  await deletePhoto(previousId);
  return toProfile(user);
}

export async function removePhoto(userId: string) {
  const user = await findUser(userId);
  const previousId = user.ProfileImageId;
  user.ProfileImage = null;
  user.ProfileImageId = null;
  await user.save();
  await deletePhoto(previousId);
  return toProfile(user);
}
