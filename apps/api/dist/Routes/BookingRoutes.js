"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middlewares/Auth");
const BookingController_1 = require("../controller/BookingController");
const router = express_1.default.Router();
router.post("/bookAppointment", Auth_1.authMiddleware, BookingController_1.bookAppointment);
router.get("/appointments", Auth_1.authMiddleware, BookingController_1.getAppointments);
router.patch("/appointment/:id/reschedule", Auth_1.authMiddleware, BookingController_1.rescheduleAppointment);
router.patch("/appointment/:id/cancel", Auth_1.authMiddleware, BookingController_1.cancelAppointment);
exports.default = router;
