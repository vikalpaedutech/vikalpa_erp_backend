// /BACKEND/routeS/dashboard.route.js


import express from "express"

import { attendancePdfUploadStatusCountByClass, studentAndAttendanceAndAbsenteeCallingCount,


    getStudentCountsByClass,
    getTodayAttendanceSummaryByClass,
    getAbsenteeCallingSummary

 } from "../controllers/dashboard.controller.js"

const router = express();


router.post("/attendance-count", studentAndAttendanceAndAbsenteeCallingCount);
router.post("/attendance-pdf-count", attendancePdfUploadStatusCountByClass);


// ✅ New routes
router.post("/student-count-by-class", getStudentCountsByClass);
router.post("/attendance-summary-today", getTodayAttendanceSummaryByClass);
router.post("/absentee-calling-summary", getAbsenteeCallingSummary);

export default router;