//routes for student.controller.js

import express from "express";

import {createPost, getStudentIfisSlcTakenIsFalse, getAllStudents, updateStudentBySrn, patchStudentBySrn, deleteStudentBySrn, getStudentsByQueryParams} from "../controllers/student.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/student', createPost);
router.get("/student", getStudentIfisSlcTakenIsFalse);
router.get("/student", getAllStudents);
router.put("/student/:studentSrn", updateStudentBySrn);
router.patch("/student/:studentSrn", patchStudentBySrn);
router.delete("/student/:studentSrn", deleteStudentBySrn);
router.get("/student-queryparams", getStudentsByQueryParams);


export default router;