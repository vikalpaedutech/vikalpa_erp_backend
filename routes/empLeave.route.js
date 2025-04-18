//routes for empLeave.controller.js

import express from "express";

import {createPost} from "../controllers/empLeave.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/leave-application', createPost);


export default router;