//routes for district.controller.js

import express from "express";

import { createObjectiveOfCalling, createCallings, getCallingsByAssignedTo
    ,updateCalling, getObjectiveOfCall, callingDashboardByUserId, callilngDashboardOfAllUsers
 } from "../controllers/calling.controller.js";

//creating express router.

const router = express.Router();

//Post route 

router.post('/create-objective-of-calling', createObjectiveOfCalling);


router.post('/create-calling', createCallings);

router.post('/get-calling', getCallingsByAssignedTo);

router.post('/update-calling', updateCalling);


router.post('/get-objective-of-calls', getObjectiveOfCall);




router.post('/dashboard-objective-of-callings', callingDashboardByUserId);

router.post('/calling-dashboard-of-all-users', callilngDashboardOfAllUsers);




export default router;