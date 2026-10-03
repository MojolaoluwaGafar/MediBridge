import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { authMiddleware, requireRole } from "../middlewares/Auth";
import { avatarUpload, AVATAR_MAX_BYTES } from "../config/Cloudinary";
import { documentUpload, DOCUMENT_MAX_BYTES } from "../Services/documentStorage";
import * as admin from "../controller/AdminController";

const router = Router();

// Multer errors (too big, wrong field) as a friendly 400.
const receive =
  (upload: ReturnType<typeof multer>, field: string, maxBytes: number, what: string) =>
  (req: Request, res: Response, next: NextFunction) =>
    upload.single(field)(req, res, (error: unknown) => {
      if (!error) return next();
      const message =
        error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
          ? `${what} must be smaller than ${maxBytes / (1024 * 1024)} MB`
          : error instanceof multer.MulterError
            ? `That isn't an accepted ${what.toLowerCase()}`
            : "We couldn't receive that file. Please try again.";
      return res.status(400).json({ success: false, message, errors: [{ field, message }] });
    });

// Admin only.
router.use("/admin", authMiddleware, requireRole("admin"));

router.get("/admin/overview", admin.getOverview);

router.get("/admin/patients", admin.listPatients);
router.post("/admin/patients", admin.createPatient);
router.get("/admin/patients/:id", admin.getPatient);
router.patch("/admin/patients/:id", admin.updatePatient);
router.post("/admin/patients/:id/records", receive(documentUpload, "file", DOCUMENT_MAX_BYTES, "Files"), admin.uploadRecord);
router.get("/admin/patients/:id/records/:recordId/file", admin.downloadRecord);
router.delete("/admin/records/:id", admin.deleteRecord);

router.get("/admin/doctors", admin.listDoctors);
router.post("/admin/doctors", admin.createDoctor);
router.patch("/admin/doctors/:id", admin.updateDoctor);
router.put("/admin/doctors/:id/availability", admin.setDoctorHours);
router.post("/admin/doctors/:id/photo", receive(avatarUpload, "photo", AVATAR_MAX_BYTES, "Photos"), admin.uploadDoctorPhoto);
router.post("/admin/doctors/:id/login", admin.createDoctorLogin);
// Link an existing login, or unlink. Until the portal existed this was done
// with `npm run link:doctor`, which still works.
router.put("/admin/doctors/:id/account", admin.linkDoctorAccount);
router.delete("/admin/doctors/:id/account", admin.unlinkDoctorAccount);

router.get("/admin/departments", admin.listDepartments);
router.post("/admin/departments", admin.createDepartment);
router.patch("/admin/departments/:id", admin.updateDepartment);

router.get("/admin/admins", admin.listAdmins);
router.post("/admin/admins", admin.createAdmin);

export default router;
