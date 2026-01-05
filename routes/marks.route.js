// //routes for marks.controller.js

// import express from "express";

// import {createPost, getPost, getAllMarksUsinQueryParams, updateMarksBySrnAndExamId} from "../controllers/marks.controller.js";
// import { createMarksRecordCron } from "../controllers/marks.controller.js";



// //creating express router.


// const router = express.Router();

// //Post route 

// router.post('/marks', createPost);
// // router.get('/marks', getPost);
// router.get('/marks', getAllMarksUsinQueryParams);
// router.put('/marks',updateMarksBySrnAndExamId )
// router.post("/initiate-test", createMarksRecordCron )


// export default router;








// routes for marks.controller.js
import express from "express";
import multer from "multer";
import {
    createPost, 
    getPost, 
    getAllMarksUsinQueryParams, 
    updateMarksBySrnAndExamId,
    createMarksRecordCron,
    uploadTestFile // New import
} from "../controllers/marks.controller.js";

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

const router = express.Router();

// Post route 
router.post('/marks', createPost);
router.get('/marks', getAllMarksUsinQueryParams);
router.put('/marks', updateMarksBySrnAndExamId);
router.post("/initiate-test", createMarksRecordCron);
router.post('/upload-test-file', upload.single('testFile'), uploadTestFile); // New route for file upload

export default router;