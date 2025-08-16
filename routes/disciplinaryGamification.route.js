//routes for disciplinaryGamification.controller.js

import express from "express";

import { disciplinaryGamification } from "../controllers/disciplinaryGamification.controller.js";

const router = express.Router();

router.post('/disciplinary-gamification', disciplinaryGamification);



export default router;