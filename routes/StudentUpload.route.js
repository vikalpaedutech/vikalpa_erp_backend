//routes for student.controller.js

import express from "express";
import multer from "multer";

import { createStudentUploadObjective, DeletUploads, GetStudentsForUploads, getStudentUploadsObjectives, StudentUploadDashboard, UplaoadStudentFiles } from "../controllers/StudentUpload.controller.js";

//creating express router.

const router = express.Router();
// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
});
//Post route 

router.post('/create-student-upload-objective', createStudentUploadObjective);

router.post('/upload-student-file',  upload.single("file"), UplaoadStudentFiles);



router.post('/get-student-objectives',  getStudentUploadsObjectives);


router.post('/get-student-for-uploads',  GetStudentsForUploads);

router.post('/delete-student-uploads',  DeletUploads);

router.post('/student-upload-dashboard',  StudentUploadDashboard);


export default router;