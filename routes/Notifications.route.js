// /BACKEND/routes/Notification.route.js

import express from "express";

import { getNotificationsByUserId, patchNotificationByConcernTypeAndRole } from "../controllers/Notifications.controller.js";


const router = express();

router.get('/get-notification-by-userid', getNotificationsByUserId)

router.patch('/patch-notification-by-concerynType-and-role', patchNotificationByConcernTypeAndRole)


export default router;