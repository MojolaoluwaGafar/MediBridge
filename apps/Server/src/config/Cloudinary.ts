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

// Profile photos: images only, max 2 MB, stored as a 400x400 face-centred crop.
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "MediBridge/avatars",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  }),
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return callback(null, true);
    callback(Object.assign(new Error("Please choose a JPG, PNG or WebP image."), { code: "INVALID_FILE_TYPE" }));
  },
});
export default cloudinary;

