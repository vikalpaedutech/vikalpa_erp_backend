//routes for studentDisciplinary.controller.js

import express from "express";

import { createDisciplinaryOrInteraction } from "../controllers/studentDisciplinary.controller.js";

const router = express.Router();

router.post('/studentdisciplinaryOrInteraction', createDisciplinaryOrInteraction);

export default router;