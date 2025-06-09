//routes for school.controller.js

import express from "express";

import {createPost, getSchool, getSchoolsByBlockId, getSchoolsBySchoolId} from "../controllers/school.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/school', createPost);

router.get('/school', getSchool);

router.get('/school-by-blockid/:blockId', getSchoolsByBlockId);

router.get('/school-by-schoolId', getSchoolsBySchoolId);


export default router;