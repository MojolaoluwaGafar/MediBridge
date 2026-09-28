"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middlewares/Auth");
const ActivityController_1 = require("../controller/ActivityController");
const router = express_1.default.Router();
router.get("/activities", Auth_1.authMiddleware, ActivityController_1.getActivities);
exports.default = router;
