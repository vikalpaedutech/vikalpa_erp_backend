// /BACKEND/routeS/dashboard.route.js


import express from "express"

import { studentAndAttendanceAndAbsenteeCallingCount } from "../controllers/dashboard.controller.js"

const router = express();


router.post("/attendance-count", studentAndAttendanceAndAbsenteeCallingCount);

export default router;