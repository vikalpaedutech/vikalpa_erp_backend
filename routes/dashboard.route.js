// /BACKEND/routeS/dashboard.route.js


import express from "express"

import { attendancePdfUploadStatusCountByClass, studentAndAttendanceAndAbsenteeCallingCount } from "../controllers/dashboard.controller.js"

const router = express();


router.post("/attendance-count", studentAndAttendanceAndAbsenteeCallingCount);
router.post("/attendance-pdf-count", attendancePdfUploadStatusCountByClass);

export default router;