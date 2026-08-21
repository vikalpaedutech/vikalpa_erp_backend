
import express from 'express';
const router = express.Router();

import {
    CreateDailyWork,
    CreateDailyWorkStatus,
    GetAllDailyWork,
    GetDailyWorkById,
    GetDailyWorkStatus,
    GetLatestStatus,
    UpdateDailyWork,
    DeleteDailyWork,
    CompleteDailyWork, // 🆕 New route for completion
    GetReportData
} from '../controllers/DPR.controller.js';

// POST Routes
router.post('/create-task', CreateDailyWork);
router.post('/create-status', CreateDailyWorkStatus);

// 🆕 Complete Task Route (with auto-calculation)
router.put('/complete-task/:id', CompleteDailyWork);

router.get('/report-data', GetReportData);

// GET Routes
router.get('/tasks', GetAllDailyWork);
router.get('/task/:id', GetDailyWorkById);
router.get('/statuses', GetDailyWorkStatus);
router.get('/status/:taskId/latest', GetLatestStatus);

// PUT Route
router.put('/task/:id', UpdateDailyWork);

// DELETE Route
router.delete('/task/:id', DeleteDailyWork);

export default router;