import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import * as accountService from "../Services/accountService";
import { changePasswordSchema } from "../Validation/accountSchema";
import { sendError, sendValidationError } from "../Utils/sendError";

export const getAccount = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await accountService.getProfile(req.user!.id);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);

    await accountService.changePassword(req.user!.id, parsed.data);
    return res.status(200).json({ success: true, message: "Password changed" });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Choose a photo to upload" });
    }
    const profile = await accountService.setPhoto(req.user!.id, req.file.buffer);
    return res.status(200).json({ success: true, message: "Profile photo updated", profile });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const removeAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await accountService.removePhoto(req.user!.id);
    return res.status(200).json({ success: true, message: "Profile photo removed", profile });
  } catch (error) {
    return sendError(req, res, error);
  }
};
