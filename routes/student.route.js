//routes for student.controller.js

import express from "express";

import {createPost, getStudentIfisSlcTakenIsFalse, getAllStudents, 
    updateStudentBySrn, patchStudentBySrn, 
    deleteStudentBySrn,
     getStudentsByQueryParams, uploadDressSizePdf, uploadDressSizeConfirmationForm,
     GetStudentsBySlc, GetMBStudents, MarkMBStudentAttendance, StudentAbsenteeCalling,
     StudentAttendanceDashboard, GetAllMbStudentsData, CreateStudent,
     UpdateStudentBySrn,
     StudentAbsenteeCallingDashboard,
     CreateStudentFormAPI,
     GetStudents,
     DownloadStudentData,
     getstudentAddRequest,
     studentAddUpdatedApi,
     GetMBStudentsForAttendance
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

router.post("/mb-student-absentee-calling-dashboard", StudentAbsenteeCallingDashboard)

router.post("/get-all-mb-student-data", GetAllMbStudentsData);

router.post("/create-mb-student-data", CreateStudent);

router.post("/update-mb-student-data", UpdateStudentBySrn);

// router.post("/create-student-form", CreateStudentFormAPI);



router.post("/create-student-form", CreateStudentFormAPI); // For Add
router.post("/remove-student", CreateStudentFormAPI); // For Remove
router.post("/slc-release", CreateStudentFormAPI); // For SLC Release

router.post("/get-students", GetStudents); // For student data


router.post("/download-students-data", DownloadStudentData); // For download students data

router.post("/get-student-add-request", getstudentAddRequest)

router.post("/update-student-add-request", studentAddUpdatedApi)



router.post("/get-mb-students-for-attendance", GetMBStudentsForAttendance)



export default router;