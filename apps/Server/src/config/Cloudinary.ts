import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer"
dotenv.config();

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Profile photos: images only, at most 2 MB, held in memory and then sent to
// Cloudinary with uploadImage(). Multer enforces the limits before anything
// is uploaded. (This replaced multer-storage-cloudinary, which only supports
// the outdated Cloudinary v1 SDK.)
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (AVATAR_TYPES.includes(file.mimetype)) return callback(null, true);
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "photo"));
  },
});

// Uploads an image buffer and resolves with its URL and public ID (needed to
// delete it later).
export function uploadImage(buffer: Buffer, options: UploadApiOptions): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: "image", ...options }, (error, result) => {
      if (error || !result) return reject(error ?? new Error("Upload failed"));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

// Profile photos are cropped to a 400x400 square around the face on upload,
// so the portal never downloads a full-size phone photo.
export const uploadAvatar = (buffer: Buffer) =>
  uploadImage(buffer, {
    folder: "MediBridge/avatars",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

export default cloudinary;
