// Backend/routes/UploadAttendancePdf.route.js

import express from "express";
import {GetDataBySchoolId, uploadAttendancePdfFile, PatchAttendancePdf, createAttendancePdfCronJob} from "../controllers/UploadAttendancePdf.controller.js";



const router = express();

router.get("/attendancepdf/:schoolId/:dateOfUpload", GetDataBySchoolId)
router.patch("/attendancepdf-upload", uploadAttendancePdfFile,  PatchAttendancePdf)
router.post("/initiate-attendance-pdf", createAttendancePdfCronJob)


export default router;

