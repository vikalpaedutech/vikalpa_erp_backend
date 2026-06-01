// /Backend/routes/centersOrSchoolsDisciplinary.route.js

//This is route for  centersOrSchoolDisciplinary.controller.js

import express from "express";

import { createSchoolDisciplinaryRecord, GetSchoolDisciplinaryData } from "../controllers/schoolDisciplinary.controller.js";

const router = express();

router.post('/create-disciplinary-record', createSchoolDisciplinaryRecord );

router.post('/get-disciplinary-record', GetSchoolDisciplinaryData );




export default router;