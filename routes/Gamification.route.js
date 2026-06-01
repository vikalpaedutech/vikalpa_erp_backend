//routes for district.controller.js

import express from "express";

import { callingAbsentee, ClaimGamificationPoint, CreateGamificationPointLogic, disciplinary, fetchUserGamificationPoints, GamificationPointAssigningToUsers, pdfUpload, selfAttendancePoint, studentAttendance } from "../controllers/Gamification.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/create-gamification-point-logic', CreateGamificationPointLogic);

router.post('/update-gamification-points', GamificationPointAssigningToUsers);

router.post('/self-attendance-point', selfAttendancePoint);

router.post('/student-attendance-point', studentAttendance);

router.post('/pdf-upload-point', pdfUpload);

router.post('/calling-absentee-point', callingAbsentee);


router.post('/disciplinary-point', disciplinary);


router .post('/claim-gamification-point', ClaimGamificationPoint)



router.post('/fetch-gamification-points', fetchUserGamificationPoints)

export default router;