//routes for marks.controller.js

import express from "express";

import {createPost, getPost, getAllMarksUsinQueryParams, updateMarksBySrnAndExamId} from "../controllers/marks.controller.js";
import { createMarksRecordCron } from "../controllers/marks.controller.js";
//creating express router.

const router = express.Router();

//Post route 

router.post('/marks', createPost);
// router.get('/marks', getPost);
router.get('/marks', getAllMarksUsinQueryParams);
router.put('/marks',updateMarksBySrnAndExamId )
router.post("/initiate-test", createMarksRecordCron )


export default router;