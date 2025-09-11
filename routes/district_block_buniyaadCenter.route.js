

import express from "express"

import { createPost, GetDistrictBlockSchoolByParams } from "../controllers/district_block_buniyaadCenters.controller.js";

const router = express();


router.post("/create_district_block_buniyaadCenter_data", createPost);

router.post("/get-district-block-schools", GetDistrictBlockSchoolByParams)

 



export default router;