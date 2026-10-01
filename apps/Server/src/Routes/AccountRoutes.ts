import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth";
import {
  getAccount,
  updateAccount,
  changePassword,
  receivePhoto,
  updatePhoto,
  removePhoto,
} from "../controller/AccountController";

const router = Router();

// Every signed-in role has an account, so these routes are not role-limited.
router.get("/account", authMiddleware, getAccount);
router.patch("/account", authMiddleware, updateAccount);
router.patch("/account/password", authMiddleware, changePassword);
router.put("/account/photo", authMiddleware, receivePhoto, updatePhoto);
router.delete("/account/photo", authMiddleware, removePhoto);

export default router;
