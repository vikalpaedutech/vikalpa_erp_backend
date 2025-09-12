import express from "express";
import { selfAttendanceGamification, createGamificationData,
    studentAttendanceGamification
 } from "../controllers/Gamification.controller.js";

const router = express.Router();

router.post('/self-attendance-gamification', selfAttendanceGamification)

router.post('/create-gamification-data', createGamificationData)

router.post('/student-attendance-gamification', studentAttendanceGamification)

export default router;
