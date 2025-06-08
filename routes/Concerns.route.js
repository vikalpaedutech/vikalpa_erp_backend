// /BACKEND/routes/Concerns.route.js

import express from "express";

import {uploadFile, createConcern, getConcernsByQueryParameters } from "../controllers/Concerns.controller.js";

const router = express();

router.post('/create-concern', uploadFile,  createConcern)
router.get('/get-concerns-by-query-parameters', getConcernsByQueryParameters)


export default router;