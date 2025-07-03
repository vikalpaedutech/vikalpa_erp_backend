

import express from "express"

import { createPost } from "../controllers/district_block_buniyaadCenters.controller.js";

const router = express();


router.post("/create_district_block_buniyaadCenter_data", createPost);


export default router;