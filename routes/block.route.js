//routes for district.controller.js

import express from "express";

import {createPost, getBlock, getBlocksByDistrictId} from "../controllers/block.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/block', createPost);
router.get("/block", getBlock);
router.get("/block-by-id", getBlocksByDistrictId);


export default router;