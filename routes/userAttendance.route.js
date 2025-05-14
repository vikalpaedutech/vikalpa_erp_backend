//BACKEND/routes/userAttendance.route.js

import express from "express"

const router = express();

import { GetAttendanceByUserId, PatchUserAttendanceByUserId } from "../controllers/userAttendance.controller.js";


router.get('/attendanceby-userid', GetAttendanceByUserId);
router.patch('/updatedattendanceby-userid', PatchUserAttendanceByUserId)


export default router;