"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SupportController_1 = require("../controller/SupportController");
const router = (0, express_1.Router)();
router.post("/aiChat", SupportController_1.sendMessage);
exports.default = router;
