//routes for cronAttendance.controller.js

import express from "express";

import {createPost} from "../controllers/district.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/district', createPost);


export default router;