// import mongoose from "mongoose";
// import { DailyWork, DailyWorkStatus } from "../models/DPR.js";

//Create Daily work

// export const CreateDailyWork = async (req, res) => {

//     const {unqUserObjectId, task, taskAssignedBy, startDate,
//         endDate, taskDeadline, totalHoursTakenTofinishTask, totalDaysTakenToFinishTask,
//         challengesFaceOnTask, howChallengeResolved, isDeadlineCrossed, taskStatus, reasonDeadlineCrossed
//     }

//     try {
//         const response = await DailyWork.create(req.body);

//         res.status(200).json({status: 'ok', data: response, message:"Task created successfully"})
//     } catch (error) {
//         res.status(500).json({status:'not ok', message: error})
//     }
// }




// export const GetDailyWork = async (req, res) => {
//     try {
//         // 1. Body se values lo (destructuring)
//         const { unqUserObjectId, startDate, endDate, taskStatus } = req.body;

//         // 2. Query object build karo
//         let query = {};

//         // 3. Employee ID filter (Agar aaya toh)
//         if (unqUserObjectId) {
//             query.employeeId = unqUserObjectId; // Ya aapka field naam jo bhi hai
//         }

//         // 4. Date range filter (Agar dono dates aayi toh)
//         if (startDate && endDate) {
//             query.reportDate = {
//                 $gte: new Date(startDate), // startDate se purana nahi
//                 $lte: new Date(endDate)    // endDate se naya nahi
//             };
//         } 
//         // Agar sirf startDate aayi toh
//         else if (startDate) {
//             query.reportDate = { $gte: new Date(startDate) };
//         } 
//         // Agar sirf endDate aayi toh
//         else if (endDate) {
//             query.reportDate = { $lte: new Date(endDate) };
//         }

//         // 5. Task Status Filter (Agar taskStatus aaya toh)
//         // Note: Yeh tasks array ke andar kisi bhi task ka status match karega
//         if (taskStatus) {
//             query['tasks.completionStatus'] = taskStatus;
//             // Alternative: Agar saare tasks ka status match karna ho toh $elemMatch use karo
//             // query.tasks = { $elemMatch: { completionStatus: taskStatus } };
//         }

//         // 6. Database query execute karo
//         const response = await DailyWork.find(query)
//             .sort({ reportDate: -1 }) // Latest report pehle aaye (optional)
//             .lean(); // Performance ke liye (plain JS object return karta hai)

//         // 7. Response bhejo
//         res.status(200).json({
//             status: "ok",
//             data: response, // ❌ response.data nahi, sirf response
//             count: response.length,
//             message: "Data fetched successfully"
//         });

//     } catch (error) {
//         // Error safely handle karo
//         res.status(500).json({
//             status: "not ok",
//             message: error.message || "Internal Server Error"
//         });
//     }
// };





// import mongoose from "mongoose";
// import { DailyWork, DailyWorkStatus } from "../models/DPR.js";

// // ============================================
// // CREATE DAILY WORK
// // ============================================


// export const CreateDailyWork = async (req, res) => {


//     console.log("testing create task")

//     try {
//         const {
//             unqUserObjectId,
//             task,
//             taskAssignedBy,
//             startDate,
//             endDate,
//             taskDeadline,
//             totalHoursTakenToFinishTask,
//             totalDaysTakenToFinishTask,
//             challengesFaceOnTask,
//             howChallengeResolved,
//             isDeadlineCrossed,
//             taskStatus,
//             reasonDeadlineCrossed
//         } = req.body;

//         // ✅ Validation
//         if (!unqUserObjectId || !task || !taskAssignedBy) {
//             return res.status(400).json({
//                 status: 'not ok',
//                 message: 'unqUserObjectId, task, and taskAssignedBy are required'
//             });
//         }

//         // ✅ Data prepare karo - USING EXACT MODEL FIELD NAMES
//         const newTaskData = {
//             unqUserObjectId: unqUserObjectId, // 🔥 FIXED: Directly use unqUserObjectId
//             task: task,
//             taskAssignedBy: taskAssignedBy,
//             startDate: startDate ? new Date(startDate) : null,
//             endDate: endDate ? new Date(endDate) : null,
//             taskDeadline: taskDeadline ? new Date(taskDeadline) : null,
//             totalHoursTakenToFinishTask: parseFloat(totalHoursTakenToFinishTask) || 0,
//             totalDaysTakenToFinishTask: parseFloat(totalDaysTakenToFinishTask) || 0,
//             challengesFaceOnTask: challengesFaceOnTask || '',
//             howChallengeResolved: howChallengeResolved || '',
//             isDeadlineCrossed: isDeadlineCrossed || false,
//             taskStatus: taskStatus || 'Pending',
//             reasonDeadlineCrossed: reasonDeadlineCrossed || ''
//         };

//         const response = await DailyWork.create(newTaskData);

//         res.status(201).json({
//             status: 'ok',
//             data: response,
//             message: 'Task created successfully'
//         });

//     } catch (error) {
//         console.error('CreateDailyWork Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // CREATE DAILY WORK STATUS
// // ============================================
// export const CreateDailyWorkStatus = async (req, res) => {
//     try {
//         const {
//             taskId,
//             performedHow,
//             toolsUsed,
//             challengesFaced,
//             challengesResolution,
//             actualTimeTaken,
//             workProof,
//             taskStatus,
//             supportRequired
//         } = req.body;

//         if (!taskId) {
//             return res.status(400).json({
//                 status: 'not ok',
//                 message: 'taskId is required'
//             });
//         }

//         const existingTask = await DailyWork.findById(taskId);
//         if (!existingTask) {
//             return res.status(404).json({
//                 status: 'not ok',
//                 message: 'Task not found with this taskId'
//             });
//         }

//         const statusData = {
//             taskId: taskId,
//             performedHow: performedHow || '',
//             toolsUsed: toolsUsed || [],
//             challengesFaced: challengesFaced || '',
//             challengesResolution: challengesResolution || '',
//             actualTimeTaken: parseFloat(actualTimeTaken) || 0,
//             workProof: workProof || [],
//             taskStatus: taskStatus || 'Working',
//             supportRequired: supportRequired || '',
//             date: new Date(),
//             statusUpdatedAt: new Date()
//         };

//         const response = await DailyWorkStatus.create(statusData);

//         // Update main task status if completed
//         if (taskStatus === 'Completed') {
//             await DailyWork.findByIdAndUpdate(taskId, {
//                 taskStatus: 'Completed',
//                 endDate: new Date()
//             });
//         }

//         res.status(201).json({
//             status: 'ok',
//             data: response,
//             message: 'Task status updated successfully'
//         });

//     } catch (error) {
//         console.error('CreateDailyWorkStatus Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // GET ALL DAILY WORK
// // ============================================
// export const GetAllDailyWork = async (req, res) => {
//     try {
//         const {
//             unqUserObjectId,
//             startDate,
//             endDate,
//             taskStatus,
//             isDeadlineCrossed
//         } = req.query;

//         let query = { isDeleted: false }; // 🔥 Only show non-deleted

//         if (unqUserObjectId) {
//             query.unqUserObjectId = unqUserObjectId; // 🔥 FIXED: Use unqUserObjectId
//         }

//         if (startDate || endDate) {
//             query.createdAt = {};
//             if (startDate) {
//                 query.createdAt.$gte = new Date(startDate);
//             }
//             if (endDate) {
//                 query.createdAt.$lte = new Date(endDate);
//             }
//         }

//         if (taskStatus) {
//             query.taskStatus = taskStatus;
//         }

//         if (isDeadlineCrossed !== undefined) {
//             query.isDeadlineCrossed = isDeadlineCrossed === 'true';
//         }

//         const response = await DailyWork.find(query)
//             .sort({ createdAt: -1 })
//             .lean();

//         res.status(200).json({
//             status: 'ok',
//             data: response,
//             count: response.length,
//             message: 'Tasks fetched successfully'
//         });

//     } catch (error) {
//         console.error('GetAllDailyWork Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // GET DAILY WORK BY ID
// // ============================================
// export const GetDailyWorkById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'not ok',
//                 message: 'Task ID is required'
//             });
//         }

//         const task = await DailyWork.findOne({ _id: id, isDeleted: false }).lean();

//         if (!task) {
//             return res.status(404).json({
//                 status: 'not ok',
//                 message: 'Task not found'
//             });
//         }

//         const statuses = await DailyWorkStatus.find({ taskId: id, isDeleted: false })
//             .sort({ statusUpdatedAt: -1 })
//             .lean();

//         res.status(200).json({
//             status: 'ok',
//             data: {
//                 task: task,
//                 statusHistory: statuses,
//                 totalStatusUpdates: statuses.length
//             },
//             message: 'Task with status history fetched successfully'
//         });

//     } catch (error) {
//         console.error('GetDailyWorkById Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // GET DAILY WORK STATUSES
// // ============================================
// export const GetDailyWorkStatus = async (req, res) => {
//     try {
//         const { taskId, startDate, endDate, taskStatus } = req.query;

//         let query = { isDeleted: false };

//         if (taskId) {
//             query.taskId = taskId;
//         }

//         if (startDate || endDate) {
//             query.statusUpdatedAt = {};
//             if (startDate) {
//                 query.statusUpdatedAt.$gte = new Date(startDate);
//             }
//             if (endDate) {
//                 query.statusUpdatedAt.$lte = new Date(endDate);
//             }
//         }

//         if (taskStatus) {
//             query.taskStatus = taskStatus;
//         }

//         const response = await DailyWorkStatus.find(query)
//             .sort({ statusUpdatedAt: -1 })
//             .lean();

//         res.status(200).json({
//             status: 'ok',
//             data: response,
//             count: response.length,
//             message: 'Status history fetched successfully'
//         });

//     } catch (error) {
//         console.error('GetDailyWorkStatus Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // GET LATEST STATUS
// // ============================================
// export const GetLatestStatus = async (req, res) => {
//     try {
//         const { taskId } = req.params;

//         if (!taskId) {
//             return res.status(400).json({
//                 status: 'not ok',
//                 message: 'taskId is required'
//             });
//         }

//         const latestStatus = await DailyWorkStatus.findOne({ taskId, isDeleted: false })
//             .sort({ statusUpdatedAt: -1 })
//             .lean();

//         if (!latestStatus) {
//             return res.status(404).json({
//                 status: 'not ok',
//                 message: 'No status found for this task'
//             });
//         }

//         res.status(200).json({
//             status: 'ok',
//             data: latestStatus,
//             message: 'Latest status fetched successfully'
//         });

//     } catch (error) {
//         console.error('GetLatestStatus Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // UPDATE DAILY WORK
// // ============================================
// export const UpdateDailyWork = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'not ok',
//                 message: 'Task ID is required'
//             });
//         }

//         const existingTask = await DailyWork.findOne({ _id: id, isDeleted: false });
//         if (!existingTask) {
//             return res.status(404).json({
//                 status: 'not ok',
//                 message: 'Task not found'
//             });
//         }

//         // Allowed fields for update - MATCHING MODEL FIELD NAMES
//         const allowedUpdates = [
//             'task', 'taskAssignedBy', 'startDate', 'endDate',
//             'taskDeadline', 'totalHoursTakenToFinishTask',
//             'totalDaysTakenToFinishTask', 'challengesFaceOnTask',
//             'howChallengeResolved', 'isDeadlineCrossed', 'taskStatus',
//             'reasonDeadlineCrossed'
//         ];

//         const filteredUpdate = {};
//         for (let key of allowedUpdates) {
//             if (updateData[key] !== undefined) {
//                 filteredUpdate[key] = updateData[key];
//             }
//         }

//         const response = await DailyWork.findByIdAndUpdate(
//             id,
//             filteredUpdate,
//             { new: true, runValidators: true }
//         ).lean();

//         res.status(200).json({
//             status: 'ok',
//             data: response,
//             message: 'Task updated successfully'
//         });

//     } catch (error) {
//         console.error('UpdateDailyWork Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };

// // ============================================
// // DELETE DAILY WORK
// // ============================================
// export const DeleteDailyWork = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'not ok',
//                 message: 'Task ID is required'
//             });
//         }

//         const existingTask = await DailyWork.findOne({ _id: id, isDeleted: false });
//         if (!existingTask) {
//             return res.status(404).json({
//                 status: 'not ok',
//                 message: 'Task not found'
//             });
//         }

//         // Soft delete
//         await DailyWork.findByIdAndUpdate(id, { isDeleted: true });
//         await DailyWorkStatus.updateMany(
//             { taskId: id },
//             { isDeleted: true }
//         );

//         res.status(200).json({
//             status: 'ok',
//             message: 'Task and associated statuses deleted successfully'
//         });

//     } catch (error) {
//         console.error('DeleteDailyWork Error:', error);
//         res.status(500).json({
//             status: 'not ok',
//             message: error.message || 'Internal Server Error'
//         });
//     }
// };
















import mongoose from "mongoose";
import { DailyWork, DailyWorkStatus } from "../models/DPR.js";

// ============================================
// CREATE DAILY WORK - Simplified
// ============================================
export const CreateDailyWork = async (req, res) => {
    try {
        const {
            unqUserObjectId,
            task,
            taskAssignedBy,
            taskDeadline,
            reasonDeadlineCrossed
        } = req.body;

        // ✅ Validation
        if (!unqUserObjectId || !task || !taskAssignedBy) {
            return res.status(400).json({
                status: 'not ok',
                message: 'unqUserObjectId, task, and taskAssignedBy are required'
            });
        }

        // ✅ Backend auto-calculations
        const today = new Date();
        const startDate = today;
        
        // ✅ Check if deadline is crossed
        let isDeadlineCrossed = false;
        let reasonDeadline = reasonDeadlineCrossed || '';
        
        if (taskDeadline) {
            const deadlineDate = new Date(taskDeadline);
            isDeadlineCrossed = deadlineDate < today;
            
            // If deadline crossed but no reason provided, auto-generate reason
            if (isDeadlineCrossed && !reasonDeadline) {
                reasonDeadline = 'Deadline crossed on task creation';
            }
        }

        const newTaskData = {
            unqUserObjectId: unqUserObjectId,
            task: task,
            taskAssignedBy: taskAssignedBy,
            startDate: startDate,
            endDate: null, // Will be set when completed
            taskDeadline: taskDeadline || null,
            totalHoursTakenToFinishTask: 0, // Will be calculated on completion
            totalDaysTakenToFinishTask: 0, // Will be calculated on completion
            challengesFaceOnTask: '', // Will be set on completion
            howChallengeResolved: '', // Will be set on completion
            isDeadlineCrossed: isDeadlineCrossed,
            taskStatus: 'Pending',
            reasonDeadlineCrossed: reasonDeadline
        };

        const response = await DailyWork.create(newTaskData);

        res.status(201).json({
            status: 'ok',
            data: response,
            message: 'Task created successfully'
        });

    } catch (error) {
        console.error('CreateDailyWork Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// UPDATE DAILY WORK - Mark as Completed
// ============================================
export const CompleteDailyWork = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            challengesFaceOnTask,
            howChallengeResolved,
            reasonDeadlineCrossed
        } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 'not ok',
                message: 'Task ID is required'
            });
        }

        // ✅ Find the task
        const task = await DailyWork.findOne({ _id: id, isDeleted: false });
        if (!task) {
            return res.status(404).json({
                status: 'not ok',
                message: 'Task not found'
            });
        }

        // ✅ Validation - Challenges and Resolution required for completion
        if (!challengesFaceOnTask || !howChallengeResolved) {
            return res.status(400).json({
                status: 'not ok',
                message: 'Challenges Faced and How Challenge Resolved are required to complete a task'
            });
        }

        // ✅ Backend auto-calculations
        const completionDate = new Date();
        const startDate = new Date(task.startDate);
        
        // 🔥 Calculate Total Hours (difference in hours)
        const diffMs = completionDate - startDate;
        const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
        
        // 🔥 Calculate Total Days
        const totalDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 10) / 10;
        
        // 🔥 Check if deadline was crossed
        let isDeadlineCrossed = task.isDeadlineCrossed || false;
        let reasonDeadline = reasonDeadlineCrossed || task.reasonDeadlineCrossed || '';
        
        if (task.taskDeadline) {
            const deadlineDate = new Date(task.taskDeadline);
            isDeadlineCrossed = deadlineDate < completionDate;
            
            // If deadline crossed and no reason, ask for reason
            if (isDeadlineCrossed && !reasonDeadline) {
                return res.status(400).json({
                    status: 'not ok',
                    message: 'Deadline crossed! Please provide a reason for deadline crossed.'
                });
            }
        }

        // ✅ Update task with auto-calculated values
        const updateData = {
            taskStatus: 'Completed',
            endDate: completionDate,
            totalHoursTakenToFinishTask: totalHours,
            totalDaysTakenToFinishTask: totalDays,
            challengesFaceOnTask: challengesFaceOnTask,
            howChallengeResolved: howChallengeResolved,
            isDeadlineCrossed: isDeadlineCrossed,
            reasonDeadlineCrossed: reasonDeadline || ''
        };

        const response = await DailyWork.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).lean();

        res.status(200).json({
            status: 'ok',
            data: {
                task: response,
                summary: {
                    totalHours: totalHours,
                    totalDays: totalDays,
                    completionDate: completionDate,
                    deadlineCrossed: isDeadlineCrossed
                }
            },
            message: `Task completed successfully! Total time: ${totalHours} hours (${totalDays} days)`
        });

    } catch (error) {
        console.error('CompleteDailyWork Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// GET ALL DAILY WORK (with filters)
// ============================================
export const GetAllDailyWork = async (req, res) => {
    try {
        const {
            unqUserObjectId,
            startDate,
            endDate,
            taskStatus,
            isDeadlineCrossed
        } = req.query;

        let query = { isDeleted: false };

        if (unqUserObjectId) {
            query.unqUserObjectId = unqUserObjectId;
        }

        // ✅ Date range filter (using startDate field)
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) {
                query.startDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.startDate.$lte = new Date(endDate);
            }
        }

        if (taskStatus) {
            query.taskStatus = taskStatus;
        }

        if (isDeadlineCrossed !== undefined) {
            query.isDeadlineCrossed = isDeadlineCrossed === 'true';
        }

        const response = await DailyWork.find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            status: 'ok',
            data: response,
            count: response.length,
            message: 'Tasks fetched successfully'
        });

    } catch (error) {
        console.error('GetAllDailyWork Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// GET DAILY WORK BY ID
// ============================================
export const GetDailyWorkById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'not ok',
                message: 'Task ID is required'
            });
        }

        const task = await DailyWork.findOne({ _id: id, isDeleted: false }).lean();

        if (!task) {
            return res.status(404).json({
                status: 'not ok',
                message: 'Task not found'
            });
        }

        const statuses = await DailyWorkStatus.find({ taskId: id, isDeleted: false })
            .sort({ statusUpdatedAt: -1 })
            .lean();

        res.status(200).json({
            status: 'ok',
            data: {
                task: task,
                statusHistory: statuses,
                totalStatusUpdates: statuses.length
            },
            message: 'Task with status history fetched successfully'
        });

    } catch (error) {
        console.error('GetDailyWorkById Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// CREATE DAILY WORK STATUS
// ============================================
export const CreateDailyWorkStatus = async (req, res) => {
    try {
        const {
            taskId,
            performedHow,
            toolsUsed,
            challengesFaced,
            challengesResolution,
            actualTimeTaken,
            taskStatus,
            supportRequired,
            workProof
        } = req.body;

        if (!taskId) {
            return res.status(400).json({
                status: 'not ok',
                message: 'taskId is required'
            });
        }

        const existingTask = await DailyWork.findOne({ _id: taskId, isDeleted: false });
        if (!existingTask) {
            return res.status(404).json({
                status: 'not ok',
                message: 'Task not found with this taskId'
            });
        }

        const statusData = {
            taskId: taskId,
            performedHow: performedHow || '',
            toolsUsed: toolsUsed || [],
            challengesFaced: challengesFaced || '',
            challengesResolution: challengesResolution || '',
            actualTimeTaken: parseFloat(actualTimeTaken) || 0,
            workProof: workProof || [],
            taskStatus: taskStatus || 'Working',
            supportRequired: supportRequired || '',
            date: new Date(),
            statusUpdatedAt: new Date()
        };

        const response = await DailyWorkStatus.create(statusData);

        // Update main task status if status changes
        if (taskStatus === 'Completed') {
            // Check if task already has challenges from completion
            if (!existingTask.challengesFaceOnTask) {
                // If task is completed via status update, set default values
                await DailyWork.findByIdAndUpdate(taskId, {
                    taskStatus: 'Completed',
                    endDate: new Date(),
                    // If challenges not provided in completion, use from status
                    challengesFaceOnTask: challengesFaced || 'Completed via status update',
                    howChallengeResolved: challengesResolution || 'Resolved via status update'
                });
            } else {
                // Just update status if already completed with challenges
                await DailyWork.findByIdAndUpdate(taskId, {
                    taskStatus: 'Completed',
                    endDate: new Date()
                });
            }
        } else {
            // Just update status for non-completed statuses
            await DailyWork.findByIdAndUpdate(taskId, {
                taskStatus: taskStatus || 'Working'
            });
        }

        res.status(201).json({
            status: 'ok',
            data: response,
            message: 'Task status updated successfully'
        });

    } catch (error) {
        console.error('CreateDailyWorkStatus Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// GET DAILY WORK STATUSES
// ============================================
export const GetDailyWorkStatus = async (req, res) => {
    try {
        const { taskId, startDate, endDate, taskStatus } = req.query;

        let query = { isDeleted: false };

        if (taskId) {
            query.taskId = taskId;
        }

        if (startDate || endDate) {
            query.statusUpdatedAt = {};
            if (startDate) {
                query.statusUpdatedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.statusUpdatedAt.$lte = new Date(endDate);
            }
        }

        if (taskStatus) {
            query.taskStatus = taskStatus;
        }

        const response = await DailyWorkStatus.find(query)
            .sort({ statusUpdatedAt: -1 })
            .lean();

        res.status(200).json({
            status: 'ok',
            data: response,
            count: response.length,
            message: 'Status history fetched successfully'
        });

    } catch (error) {
        console.error('GetDailyWorkStatus Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// GET LATEST STATUS
// ============================================
export const GetLatestStatus = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({
                status: 'not ok',
                message: 'taskId is required'
            });
        }

        const latestStatus = await DailyWorkStatus.findOne({ taskId, isDeleted: false })
            .sort({ statusUpdatedAt: -1 })
            .lean();

        if (!latestStatus) {
            return res.status(404).json({
                status: 'not ok',
                message: 'No status found for this task'
            });
        }

        res.status(200).json({
            status: 'ok',
            data: latestStatus,
            message: 'Latest status fetched successfully'
        });

    } catch (error) {
        console.error('GetLatestStatus Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// UPDATE DAILY WORK (Generic Update)
// ============================================
export const UpdateDailyWork = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({
                status: 'not ok',
                message: 'Task ID is required'
            });
        }

        const existingTask = await DailyWork.findOne({ _id: id, isDeleted: false });
        if (!existingTask) {
            return res.status(404).json({
                status: 'not ok',
                message: 'Task not found'
            });
        }

        // Allowed fields for update
        const allowedUpdates = [
            'task', 'taskAssignedBy', 'startDate', 'endDate',
            'taskDeadline', 'totalHoursTakenToFinishTask',
            'totalDaysTakenToFinishTask', 'challengesFaceOnTask',
            'howChallengeResolved', 'isDeadlineCrossed', 'taskStatus',
            'reasonDeadlineCrossed'
        ];

        const filteredUpdate = {};
        for (let key of allowedUpdates) {
            if (updateData[key] !== undefined) {
                filteredUpdate[key] = updateData[key];
            }
        }

        const response = await DailyWork.findByIdAndUpdate(
            id,
            filteredUpdate,
            { new: true, runValidators: true }
        ).lean();

        res.status(200).json({
            status: 'ok',
            data: response,
            message: 'Task updated successfully'
        });

    } catch (error) {
        console.error('UpdateDailyWork Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// DELETE DAILY WORK
// ============================================
export const DeleteDailyWork = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'not ok',
                message: 'Task ID is required'
            });
        }

        const existingTask = await DailyWork.findOne({ _id: id, isDeleted: false });
        if (!existingTask) {
            return res.status(404).json({
                status: 'not ok',
                message: 'Task not found'
            });
        }

        // Soft delete
        await DailyWork.findByIdAndUpdate(id, { isDeleted: true });
        await DailyWorkStatus.updateMany(
            { taskId: id },
            { isDeleted: true }
        );

        res.status(200).json({
            status: 'ok',
            message: 'Task and associated statuses deleted successfully'
        });

    } catch (error) {
        console.error('DeleteDailyWork Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};











// ============================================
// GET REPORT DATA WITH STATUS HISTORY
// ============================================
export const GetReportData = async (req, res) => {
    try {
        const {
            unqUserObjectId,
            startDate,
            endDate,
            taskStatus,
            isDeadlineCrossed
        } = req.query;

        let query = { isDeleted: false };

        if (unqUserObjectId) {
            query.unqUserObjectId = unqUserObjectId;
        }

        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) {
                query.startDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.startDate.$lte = new Date(endDate);
            }
        }

        if (taskStatus) {
            query.taskStatus = taskStatus;
        }

        if (isDeadlineCrossed !== undefined) {
            query.isDeadlineCrossed = isDeadlineCrossed === 'true';
        }

        // 🔥 Get all tasks
        const tasks = await DailyWork.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // 🔥 Get status history for each task
        const tasksWithHistory = await Promise.all(
            tasks.map(async (task) => {
                const statusHistory = await DailyWorkStatus.find({
                    taskId: task._id,
                    isDeleted: false
                })
                .sort({ statusUpdatedAt: -1 })
                .lean();

                return {
                    ...task,
                    statusHistory: statusHistory || []
                };
            })
        );

        res.status(200).json({
            status: 'ok',
            data: tasksWithHistory,
            count: tasksWithHistory.length,
            message: 'Report data fetched successfully'
        });

    } catch (error) {
        console.error('GetReportData Error:', error);
        res.status(500).json({
            status: 'not ok',
            message: error.message || 'Internal Server Error'
        });
    }
};