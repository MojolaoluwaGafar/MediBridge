import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer"
dotenv.config();

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "MediBridge/uploads";
    let resourceType = "auto";
    return {
      folder,
      resource_type: resourceType,
    };
  },
});
export const upload = multer({ storage });

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Profile photos: images only, at most 2 MB, cropped to a 400x400 square on
// upload so the portal never has to download a full-size phone photo.
export const avatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: "MediBridge/avatars",
      resource_type: "image",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    }),
  }),
  limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (AVATAR_TYPES.includes(file.mimetype)) return callback(null, true);
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "photo"));
  },
});

export default cloudinary;

