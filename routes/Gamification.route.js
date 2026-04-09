//routes for district.controller.js

import express from "express";

import { CreateGamificationPointLogic, GamificationPointAssigningToUsers } from "../controllers/Gamification.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/create-gamification-point-logic', CreateGamificationPointLogic);

router.post('/update-gamification-points', GamificationPointAssigningToUsers);





export default router;