//routes for studentAttendance.controller.js

import express from "express";

import {createPost, getAllAttendance, updateAttendanceBySrnAndDate, createAttendanceRecords } from "../controllers/studentAttendance.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/student-attendance', createPost);
router.get('/student-attendance', getAllAttendance)
router.put('/student-attendance', updateAttendanceBySrnAndDate)
router.post('/initiate-student-attendance', createAttendanceRecords)


export default router;