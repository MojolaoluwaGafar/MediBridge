import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/Auth";
import { passwordChangeLimiter } from "../middlewares/RateLimiter";
import { avatarUpload, AVATAR_MAX_BYTES } from "../config/Cloudinary";
import { getAccount, changePassword, uploadAvatar, removeAvatar } from "../controller/AccountController";

const router = Router();

// Turns multer's errors (file too big, wrong type) into a 400 the page can show.
const receivePhoto = (req: Request, res: Response, next: NextFunction) =>
  avatarUpload.single("photo")(req, res, (error: unknown) => {
    if (!error) return next();
    const message =
      error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? `Photos must be smaller than ${AVATAR_MAX_BYTES / (1024 * 1024)} MB`
        : error instanceof multer.MulterError
          ? "Photos must be JPG, PNG or WebP images"
          : "We couldn't upload that photo. Please try again.";
    return res.status(400).json({ success: false, message });
  });

router.get("/account", authMiddleware, getAccount);
router.patch("/account/password", authMiddleware, passwordChangeLimiter, changePassword);
router.post("/account/avatar", authMiddleware, receivePhoto, uploadAvatar);
router.delete("/account/avatar", authMiddleware, removeAvatar);

export default router;
