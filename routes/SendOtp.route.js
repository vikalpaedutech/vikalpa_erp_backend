//routes for SendOtp.route.js

import express from "express";

import { sendOtp } from "../controllers/SendOtp.controller.js";



const router = express.Router();

router.post('/send-otp', sendOtp);

export default router;