//BACKEND/routes/userAttendance.route.js

import express from "express"

const router = express();

import {uploadFile, cronJobUserAttendance, GetAttendanceByUserId, PatchUserAttendanceByUserId } from "../controllers/userAttendance.controller.js";
import { GetNotificationByUserIdOnQueryParams } from "../utils/notificatino.utils.js";

router.get('/attendanceby-userid', GetAttendanceByUserId);
router.patch('/updatedattendanceby-userid', uploadFile, PatchUserAttendanceByUserId)
router.post('/initiate-user-attendance', cronJobUserAttendance );



//NOTIFICATION CONTROLLER

router.get('/get-notification', GetNotificationByUserIdOnQueryParams)


export default router;