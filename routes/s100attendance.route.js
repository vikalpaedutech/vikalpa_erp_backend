//routes for s1ooattendance.controller.js

import express from "express";

import { getS100Attendances, updateAttendanceStatus, getAttendanceSummaryByClass } from "../controllers/s100attendance.controller.js";

const router = express.Router();

router.get('/gets100-attendances', getS100Attendances);

router.patch('/patchs100-attendances', updateAttendanceStatus);


router.get('/s100-attendance-summary', getAttendanceSummaryByClass);

export default router;

