// Backend/routes/UploadAttendancePdf.route.js

import express from "express";
import {GetDataBySchoolId, uploadAttendancePdfFile, PatchAttendancePdf, createAttendancePdfCronJob,
    uploadAttendancePdf, getAttendancePdf
} from "../controllers/UploadAttendancePdf.controller.js";



const router = express();

//router.get("/attendancepdf/:schoolId/:dateOfUpload", GetDataBySchoolId)

router.post("/attendancepdf", GetDataBySchoolId)
router.patch("/attendancepdf-upload", uploadAttendancePdfFile,  PatchAttendancePdf)
router.post("/initiate-attendance-pdf", createAttendancePdfCronJob)



//version 2 route

router.post("/upload-attendance-pdf", uploadAttendancePdfFile, uploadAttendancePdf)


router.post("/get-attendance-pdf", getAttendancePdf)


export default router;

