// Backend/routes/UploadAttendancePdf.route.js

import express from "express";
import {GetDataBySchoolId, uploadAttendancePdfFile, PatchAttendancePdf} from "../controllers/UploadAttendancePdf.controller.js";



const router = express();

router.get("/attendancepdf/:schoolId/:dateOfUpload", GetDataBySchoolId)
router.patch("/attendancepdf-upload", uploadAttendancePdfFile,  PatchAttendancePdf)




export default router;

