//routes for disciplinaryGamification.controller.js

import express from "express";

import { disciplinaryGamification, getDisciplinaryGamificationDocumentsForCurrentDate } from "../controllers/disciplinaryGamification.controller.js";

const router = express.Router();

router.post('/disciplinary-gamification', disciplinaryGamification);

router.get('/get-disciplinary-docs-current-date-only', getDisciplinaryGamificationDocumentsForCurrentDate)


export default router;