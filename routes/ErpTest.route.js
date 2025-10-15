//Routes for ErpTest.controller.

//Routes for user.controller.js



import express from "express";

import { ChangePassword, selfAttendance, studentAttendance, 
    downloadAttendancePdfFormat, uploadAttendancePdfFormat,
uploadMarks, handlingConcern, GetErpTestByUnqUserObjectId, Disciplinary, CopyChecking,
updateErpTestAnswer, absenteeCalling,
closeConcernController, UpdateMarks } from "../controllers/ErpTest.controller.js";

const router = express.Router();

// POST route to create a new user
router.post("/change-password", ChangePassword);

router.post("/self-attendance", selfAttendance);

router.post("/student-attendance-test", studentAttendance);

router.post("/download-attendance-pdf-format", downloadAttendancePdfFormat);

router.post("/upload-attendance-pdf", uploadAttendancePdfFormat);

router.post("/upload-marks-test", uploadMarks);

router.post("/concern-test", handlingConcern);

router.post("/erp-test-data-by-unquserobjectid", GetErpTestByUnqUserObjectId);

router.post("/erp-test-disciplinary", Disciplinary);

router.post("/erp-test-copychecking", CopyChecking);

router.post("/erp-test-absenteecalling", absenteeCalling);

router.post("/erp-test-closeconcern", closeConcernController);

router.post("/test-marks", UpdateMarks);


/**
 * @route   PATCH /erpTest/:id
 * @desc    Update any field of an ErpTest document
 * @body    { field: string, value: any }
 */
router.patch('/:id', updateErpTestAnswer);

export default router;
