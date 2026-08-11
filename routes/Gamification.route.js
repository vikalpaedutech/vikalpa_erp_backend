//routes for district.controller.js

import express from "express";

import { callingAbsentee, ClaimGamificationPoint, 
    CreateGamificationPointLogic, disciplinary,
     fetchUserGamificationPoints, gamificationDashboardV2,
       marks, pdfUpload, 
      selfAttendancePoint, studentAttendance, CreateGamificationContestant, 
      GamificationRankDashboard, GamificationRankDashboardGeneral, updateMonthlyRankings,
    } from "../controllers/Gamification.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/create-gamification-point-logic', CreateGamificationPointLogic);

// router.post('/update-gamification-points', GamificationPointAssigningToUsers);

router.post('/self-attendance-point', selfAttendancePoint);

router.post('/student-attendance-point', studentAttendance);

router.post('/pdf-upload-point', pdfUpload);

router.post('/calling-absentee-point', callingAbsentee);


router.post('/disciplinary-point', disciplinary);

router.post('/marks-point', marks)


router .post('/claim-gamification-point', ClaimGamificationPoint)



router.post('/fetch-gamification-points', fetchUserGamificationPoints)


router.post('/gamification-dashboard-v2', gamificationDashboardV2)


router.post('/create-gamification-contestant', CreateGamificationContestant)

router.post('/gamification-rank-dashboard', GamificationRankDashboard)

router.post('/gamification-rank-dashboard-all', GamificationRankDashboardGeneral);

router.post('/update-ranks', updateMonthlyRankings);



// router.get('/update-ranks', updateMonthlyRankings);

export default router;