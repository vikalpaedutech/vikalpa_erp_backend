//routes for examAndTest.controller.js

import express from "express";

import {createPost} from "../controllers/examAndTest.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/exam-controller', createPost);


export default router;