//routes for student.controller.js

import express from "express";

import {createPost, getStudentIfisSlcTakenIsFalse, getAllStudents, 
    updateStudentBySrn, patchStudentBySrn, 
    deleteStudentBySrn,
     getStudentsByQueryParams, uploadDressSizePdf, uploadDressSizeConfirmationForm,
     GetStudentsBySlc, GetMBStudents, MarkMBStudentAttendance, StudentAbsenteeCalling,
     StudentAttendanceDashboard, GetAllMbStudentsData
    } from "../controllers/student.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/student', createPost);
router.get("/student", getStudentIfisSlcTakenIsFalse);
router.get("/student", getAllStudents);
router.put("/student/:studentSrn", updateStudentBySrn);
router.patch("/student/:studentSrn", patchStudentBySrn);
router.delete("/student/:studentSrn", deleteStudentBySrn);
router.get("/student-queryparams", getStudentsByQueryParams);

// Upload dress size PDF for a student
router.patch(
  "/students/:studentSrn/dress-size-upload",
  uploadDressSizePdf,
  uploadDressSizeConfirmationForm
);


router.post('/student-data-for-ame', GetStudentsBySlc)





//version 2 routes 11-May-2026

router.post("/get-mb-student-data", GetMBStudents);
router.post("/mark-mb-student-data", MarkMBStudentAttendance);

router.post("/mb-student-absentee-callig", StudentAbsenteeCalling)

router.post("/mb-student-attendance-dashboard", StudentAttendanceDashboard)

router.post("/get-all-mb-student-data", GetAllMbStudentsData);


export default router;