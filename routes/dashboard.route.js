// /BACKEND/routeS/dashboard.route.js


import express from "express"

import { attendancePdfUploadStatusCountByClass, 
    studentAndAttendanceAndAbsenteeCallingCount,


    getStudentCountsByClass,
    getTodayAttendanceSummaryByClass,
    getAbsenteeCallingSummary,
    PresentAbsentCallingDashboard,
    uploadedAttendancePdfDashboard

 } from "../controllers/dashboard.controller.js"

const router = express();


router.post("/attendance-count", studentAndAttendanceAndAbsenteeCallingCount);
router.post("/attendance-pdf-count", attendancePdfUploadStatusCountByClass);


// ✅ New routes
router.post("/student-count-by-class", getStudentCountsByClass);
router.post("/attendance-summary-today", getTodayAttendanceSummaryByClass);
router.post("/absentee-calling-summary", getAbsenteeCallingSummary);



router.post("/totalstudent-present-absent-calling-count", PresentAbsentCallingDashboard)

router.post ("/uploaded-attendance-pdf-dashboard", uploadedAttendancePdfDashboard)
export default router;