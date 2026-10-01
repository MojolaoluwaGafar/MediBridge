import { Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User, type IUser } from "../Models/User";
import cloudinary, { avatarUpload } from "../config/Cloudinary";
import type { AuthRequest } from "../middlewares/Auth";
import { changePasswordSchema, updateProfileSchema } from "../Validation/registerSchema";

// The signed-in user's profile in the same field names the client already
// uses for the logged-in user (firstname, lastname, img...).
const toProfile = (user: IUser) => ({
  id: user._id,
  firstname: user.FirstName,
  lastname: user.LastName,
  email: user.Email,
  role: user.role,
  img: user.ProfileImage ?? null,
  patientId: user.UserId,
  phone: user.PhoneNumber,
});

const validationErrors = (issues: { path: PropertyKey[]; message: string }[]) => ({
  success: false,
  message: issues[0]?.message ?? "Validation failed",
  errors: issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
});

// Removing an old photo is best effort: a leftover file must never fail the request.
const deletePhoto = async (publicId?: string | null) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Could not delete old profile photo", error);
  }
};

export const getAccount = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: "Account not found" });

    return res.status(200).json({ success: true, profile: toProfile(user) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Only the contact phone is self-service. Name, email, Patient ID and the
// registered number identify the patient to the hospital and are used to
// activate and recover the account, so the hospital changes those.
export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(validationErrors(parsed.error.issues));

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { PhoneNumber: parsed.data.PhoneNumber },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "Account not found" });

    return res.status(200).json({ success: true, message: "Profile updated", profile: toProfile(user) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(validationErrors(parsed.error.issues));

    const user = await User.findById(req.user!.id);
    if (!user || !user.Password) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    const matches = await bcrypt.compare(parsed.data.currentPassword, user.Password);
    if (!matches) {
      // 400, not 401: the client signs people out on 401/403.
      return res.status(400).json({
        success: false,
        message: "Your current password is incorrect",
        errors: [{ field: "currentPassword", message: "Your current password is incorrect" }],
      });
    }

    user.Password = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Runs the multer upload and turns its errors (too big, wrong type) into a 400.
export const receivePhoto = (req: AuthRequest, res: Response, next: NextFunction) => {
  avatarUpload.single("photo")(req, res, (error: any) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "Please choose an image under 2 MB." });
    }
    if (error.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Anything else is the image host failing; don't show its raw error.
    console.error("Profile photo upload failed", error);
    return res.status(502).json({ success: false, message: "Couldn't upload your photo. Please try again." });
  });
};

export const updatePhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please choose an image to upload." });
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      await deletePhoto(req.file.filename);
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    const previousId = user.ProfileImageId;
    // multer-storage-cloudinary puts the URL in `path` and the public ID in `filename`.
    user.ProfileImage = req.file.path;
    user.ProfileImageId = req.file.filename;
    await user.save();
    await deletePhoto(previousId);

    return res.status(200).json({ success: true, message: "Photo updated", profile: toProfile(user) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const removePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: "Account not found" });

    const previousId = user.ProfileImageId;
    user.ProfileImage = null;
    user.ProfileImageId = null;
    await user.save();
    await deletePhoto(previousId);

    return res.status(200).json({ success: true, message: "Photo removed", profile: toProfile(user) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
