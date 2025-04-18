//routes for district.controller.js

import express from "express";

import {createPost, getDistrict, getDistrictById} from "../controllers/district.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/district', createPost)

router.get("/district", getDistrict)

router.get("/district/:districtId", getDistrictById)


export default router;