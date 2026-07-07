import express from "express";

import { CreateTimeTable, CreateLectureAndVideos, GetTimeTable, DeleteTimeTable, DeleteLectureAndVideos, GetLectureAndVideos } from "../controllers/Academic.controller.js";
import { DeletUploads } from "../controllers/StudentUpload.controller.js";

const router = express.Router();

// Endpoint for creating an expense with file upload

router.post("/create-time-table", CreateTimeTable);


router.post("/create-lecture-videos", CreateLectureAndVideos);



router.post("/get-timetable", GetTimeTable);


router.post("/delete-time-table", DeleteTimeTable);


router.post("/get-lecture-videos", GetLectureAndVideos);

router.post("/delete-lecture-videos", DeleteLectureAndVideos);



export default router;


