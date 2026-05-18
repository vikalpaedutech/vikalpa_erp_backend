//routes for studentAttendance.controller.js

import express from "express";

import { CreateStudentCopyChecking, DeleteStudentCopyChecking, GetCopyCheckingData } from "../controllers/studentCopyChecking.controller.js";

import { StudentCopyCheckinDashboard } from "../controllers/studentCopyChecking.controller.js";

const router = express.Router();

//Post route 

router.post('/create-student-copy-checking', CreateStudentCopyChecking);
router.post('/delete-student-copy-checking', DeleteStudentCopyChecking);
router.post('/dashboard-student-copy-checking', StudentCopyCheckinDashboard);
router.post('/get-student-copy-checking', GetCopyCheckingData);


export default router;