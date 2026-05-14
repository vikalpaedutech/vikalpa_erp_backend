

import express from "express"

// import { createPost, GetDistrictBlockSchoolByParams } from "../controllers/district_block_school.controller.js";

import {createPost, GetDistrictBlockSchoolByParams} from "../controllers/district_block_school.controller.js"

const router = express();


router.post("/create_district_block_buniyaadCenter_data", createPost);

router.post("/get-district-block-schools", GetDistrictBlockSchoolByParams)

 



export default router;