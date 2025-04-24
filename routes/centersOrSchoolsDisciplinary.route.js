// /Backend/routes/centersOrSchoolsDisciplinary.route.js

//This is route for  centersOrSchoolDisciplinary.controller.js

import express from "express";

import { createCenterOrSchoolDisciplinary, getCenterOrSchoolDisciplinaryDataByUserId } from "../controllers/centerOrSchoolDisciplinary.controller.js";

const router = express();

router.post('/centerOrSchoolDisciplinary', createCenterOrSchoolDisciplinary );
router.get("/centerOrSchoolDisciplinary-by-userId/:userId",getCenterOrSchoolDisciplinaryDataByUserId )



export default router;