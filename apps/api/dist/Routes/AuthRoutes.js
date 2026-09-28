"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controller/AuthController");
const router = express_1.default.Router();
router.post("/verifyUser", AuthController_1.VerifyUser);
router.post("/verifyCode", AuthController_1.verifyCode);
router.post("/setPassword", AuthController_1.SetPassword);
router.post("/login", AuthController_1.login);
router.post("/codeReq", AuthController_1.ForgotPassword);
router.post("/verifyRecoveryCode", AuthController_1.verifyRecoveryCode);
router.post("/resetPassword", AuthController_1.resetPassword);
exports.default = router;
