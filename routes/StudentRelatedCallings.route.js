// BACKEND/routes/StudentRelatedCallings.route.js

import express from 'express';

import { CreateCalling, GetStudentRelatedCallingData, PatchStudentRelatedCallings } from '../controllers/StudentRelatedCallings.controller.js';


//creating express router.

const router = express.Router();

router.post('/create-students-related-callings', CreateCalling);
router.get('/get-students-related-calling', GetStudentRelatedCallingData)
router.patch('/patch-student-related-calling', PatchStudentRelatedCallings)

export default router;