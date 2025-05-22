//BACKEND/routes/userAttendance.route.js

import express from "express"

const router = express();

import { cronJobUserAttendance, GetAttendanceByUserId, PatchUserAttendanceByUserId } from "../controllers/userAttendance.controller.js";


router.get('/attendanceby-userid', GetAttendanceByUserId);
router.patch('/updatedattendanceby-userid', PatchUserAttendanceByUserId)
router.post('/initiate-user-attendance', cronJobUserAttendance );

export default router;