//routes for studentDisciplinary.controller.js

import express from "express";

import { createDisciplinaryOrInteraction, GetDisciplinaryDataByQueryParams } from "../controllers/studentDisciplinary.controller.js";

const router = express.Router();

router.post('/studentdisciplinaryOrInteraction', createDisciplinaryOrInteraction);
router.get('/get-student-copychecking-and-disciplinary-data', GetDisciplinaryDataByQueryParams)
export default router;