//Routes for user.controller.js



import express from "express";
import { GetStudentAttendanceDashboard, UpdateTaAttendance } from "../controllers/TaVerification.controller.js";

const router = express.Router();



router.post("/get-ta-verification-dashboard", GetStudentAttendanceDashboard)

router.post("/update-ta-attendance", UpdateTaAttendance)

export default router;
