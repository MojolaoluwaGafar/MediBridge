import express from "express"
import { VerifyUser, verifyCode, SetPassword, login, ForgotPassword, verifyRecoveryCode, resetPassword } from "../controller/AuthController"
import { authMiddleware } from "../middlewares/Auth"

const router = express.Router()

router.post("/verifyUser", VerifyUser)
router.post("/verifyCode", verifyCode)
router.post("/setPassword", SetPassword)
router.post("/login", login)
router.post("/codeReq", ForgotPassword)
router.post("/verifyRecoveryCode", verifyRecoveryCode)
router.post("/resetPassword", resetPassword)

export default router;