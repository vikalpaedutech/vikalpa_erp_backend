//BACKEND/routes/userAttendance.route.js

import express from "express"

const router = express();

import {uploadFile, cronJobUserAttendance, GetAttendanceByUserId, PatchUserAttendanceByUserId, 
    getFilteredUserAttendanceSummary, 
    patchUserAttendanceWithoutImage, 
    GetAttendanceDataOfUsersByMonthAndYear, getUserAttendanceSummaryData,



    markUserAttendance, getUserAttendanceData,
    userSelfAttendanceDashboard
 } from "../controllers/userAttendance.controller.js";
import { GetNotificationByUserIdOnQueryParams } from "../utils/notificatino.utils.js";

router.get('/attendanceby-userid', GetAttendanceByUserId);
router.patch('/updatedattendanceby-userid', uploadFile, PatchUserAttendanceByUserId)
router.post('/initiate-user-attendance', cronJobUserAttendance );
router.post('/user-attendance-summary', getFilteredUserAttendanceSummary )
router.patch('/patch-user-attendance-without-image', patchUserAttendanceWithoutImage)

//NOTIFICATION CONTROLLER

router.get('/get-notification', GetNotificationByUserIdOnQueryParams)

router.post('/individual-user-attendance-dash', GetAttendanceDataOfUsersByMonthAndYear)

router.post('/user-attendance-summary-data', getUserAttendanceSummaryData)



//New Routes 07-05-2026
router.post ('/mark-user-attendance', uploadFile, markUserAttendance)

router.post ('/get-user-attendance', getUserAttendanceData)

router.post ('/user-self-attendance-dashboard', userSelfAttendanceDashboard)




export default router;