// /BACKEND/routes/Concerns.route.js

import express from "express";

import {uploadFile, createConcern, getConcernsByQueryParameters, PatchConcernsByQueryParams, getIndividualConcerns, getIndividualLeave } from "../controllers/Concerns.controller.js";

const router = express();

router.post('/create-concern', uploadFile,  createConcern)
router.get('/get-concerns-by-query-parameters', getConcernsByQueryParameters)
router.patch('/patch-concern-by-query-parameters', PatchConcernsByQueryParams)
router.get('/get-individual-concerns', getIndividualConcerns)
router.get('/get-individual-leave', getIndividualLeave)
export default router;