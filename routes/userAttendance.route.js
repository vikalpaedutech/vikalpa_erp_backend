//BACKEND/routes/userAttendance.route.js

import express from "express"

const router = express();

import {uploadFile, cronJobUserAttendance, GetAttendanceByUserId, PatchUserAttendanceByUserId, getFilteredUserAttendanceSummary, patchUserAttendanceWithoutImage, GetAttendanceDataOfUsersByMonthAndYear } from "../controllers/userAttendance.controller.js";
import { GetNotificationByUserIdOnQueryParams } from "../utils/notificatino.utils.js";

router.get('/attendanceby-userid', GetAttendanceByUserId);
router.patch('/updatedattendanceby-userid', uploadFile, PatchUserAttendanceByUserId)
router.post('/initiate-user-attendance', cronJobUserAttendance );
router.post('/user-attendance-summary', getFilteredUserAttendanceSummary )
router.patch('/patch-user-attendance-without-image', patchUserAttendanceWithoutImage)

//NOTIFICATION CONTROLLER

router.get('/get-notification', GetNotificationByUserIdOnQueryParams)

router.post('/individual-user-attendance-dash', GetAttendanceDataOfUsersByMonthAndYear)


export default router;