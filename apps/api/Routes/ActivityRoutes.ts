import express from "express"
import { authMiddleware } from "../middlewares/Auth"
import { getActivities } from "../controller/ActivityController";

const router = express.Router()

router.get("/activities", authMiddleware, getActivities)



export default router;