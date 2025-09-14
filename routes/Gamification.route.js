import express from "express";
import { selfAttendanceGamification, createGamificationData,
    studentAttendanceGamification, attendancePdfGamification,
    studentAbsenteeCallingGamification, studentMarksGamification,
    disciplinaryGamification, getDisciplinaryGamificationData, 
    getAllGamificationData, pointClaimedUpdation
 } from "../controllers/Gamification.controller.js";

const router = express.Router();

router.post('/self-attendance-gamification', selfAttendanceGamification)

router.post('/create-gamification-data', createGamificationData)

router.post('/student-attendance-gamification', studentAttendanceGamification)

router.post('/attendance-pdf-gamification', attendancePdfGamification)

router.post('/student-absentee-calling-gamification', studentAbsenteeCallingGamification)

router.post('/student-marks-gamification', studentMarksGamification)

router.post('/center-disciplinary-gamification', disciplinaryGamification)

router.get('/get-disciplinary-gamification', getDisciplinaryGamificationData)

router.post('/get-all-gamification-data-by-unqUserObjectId', getAllGamificationData)

router.post('/update-gamification-data', pointClaimedUpdation )

export default router;
