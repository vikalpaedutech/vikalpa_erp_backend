//routes for examAndTest.controller.js

import express from "express";

import {createPost, GetTests} from "../controllers/examAndTest.controller.js";


//creating express router.

const router = express.Router();

//Post route 

router.post('/exam-controller', createPost);

router.get("/get-tests", GetTests)


export default router;