import mongoose from "mongoose";

import { Calling, ObjectiveOfCalling } from "../models/calling.model.js";



export const createObjectiveOfCalling = async (req, res) => {
    try {
        const {
            objectiveOfCalling,
            descriptionOfCalling,
            remarks,
            callingStatus,
            isNewValueToBeUpdatedRequired,
            dependentRemarkRequired,
            isManualRemarkRequired,
            isObjectOfCallingDone,
            callingDate
        } = req.body;


        console.log(req.body)

        // Validate required fields
        if (!objectiveOfCalling) {
            return res.status(400).json({
                success: false,
                message: "objectiveOfCalling is required"
            });
        }

        if (!remarks || !Array.isArray(remarks) || remarks.length === 0) {
            return res.status(400).json({
                success: false,
                message: "remarks must be a non-empty array"
            });
        }

        // Validate each remark structure
        for (let i = 0; i < remarks.length; i++) {
            if (!remarks[i].remark) {
                return res.status(400).json({
                    success: false,
                    message: `remarks[${i}].remark is required`
                });
            }
            
            // Validate dependentRemarks is an array if provided
            if (remarks[i].dependentRemarks && !Array.isArray(remarks[i].dependentRemarks)) {
                return res.status(400).json({
                    success: false,
                    message: `remarks[${i}].dependentRemarks must be an array`
                });
            }
        }

        // Create new document with all fields
        const newObjectiveOfCalling = new ObjectiveOfCalling({
            objectiveOfCalling,
            descriptionOfCalling,
            remarks,
            callingStatus: callingStatus || 'PENDING',
            isNewValueToBeUpdatedRequired: isNewValueToBeUpdatedRequired !== undefined ? isNewValueToBeUpdatedRequired : false,
            dependentRemarkRequired: dependentRemarkRequired !== undefined ? dependentRemarkRequired : false,
            isManualRemarkRequired: isManualRemarkRequired !== undefined ? isManualRemarkRequired : true,
            isObjectOfCallingDone: isObjectOfCallingDone !== undefined ? isObjectOfCallingDone : false,
            callingDate: callingDate || new Date()
        });

        // Save to database
        const savedObjective = await newObjectiveOfCalling.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: "Objective of calling created successfully",
            data: savedObjective
        });

    } catch (error) {
        console.error("Error creating objective of calling:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create objective of calling",
            error: error.message
        });
    }
};





export const createCallings = async (req, res) => {
    try {
        const {
            studentUnqObjectId,
            assignedTo,
            roleOfAssignedTo,
            callingType,
            calledTo,
            name,
            fatherName,
            district,
            block,
            school,
            contact1,
            contact2,
            contact3,
            callingStatus,
            remark,
            dependentRemark,
            manualRemark,
            newUpdatedValue,
            objectiveOfCallId,
            callingDate
        } = req.body;

        // Validate required fields
        if (!callingType) {
            return res.status(400).json({
                success: false,
                message: "callingType is required"
            });
        }

        if (!calledTo) {
            return res.status(400).json({
                success: false,
                message: "calledTo is required"
            });
        }

        if (!objectiveOfCallId) {
            return res.status(400).json({
                success: false,
                message: "objectiveOfCallId is required"
            });
        }

        // Validate ObjectiveOfCalling exists
        const objectiveExists = await ObjectiveOfCalling.findById(objectiveOfCallId);
        if (!objectiveExists) {
            return res.status(404).json({
                success: false,
                message: "Objective of calling not found with the provided ID"
            });
        }

        // Validate based on callingType
        if (callingType === 'MB_CALLING' && !studentUnqObjectId) {
            return res.status(400).json({
                success: false,
                message: "studentUnqObjectId is required for MB calling"
            });
        }

        if (callingType === 'RANDOM_CALLING') {
            if (!name || !contact1) {
                return res.status(400).json({
                    success: false,
                    message: "name and contact1 are required for random calling"
                });
            }
        }

        // Create new calling document
        const newCalling = new Calling({
            studentUnqObjectId: studentUnqObjectId || null,
            assignedTo: assignedTo || null,
            roleOfAssignedTo,
            callingType,
            calledTo,
            name,
            fatherName,
            district,
            block,
            school,
            contact1,
            contact2,
            contact3,
            callingStatus,
            remark,
            dependentRemark,
            manualRemark,
            newUpdatedValue,
            objectiveOfCallId,
            callingDate: callingDate || new Date()
        });

        // Save to database
        const savedCalling = await newCalling.save();

        // Populate references for response
        const populatedCalling = await Calling.findById(savedCalling._id)
            .populate('studentUnqObjectId', 'name fatherName contact1 contact2')
            .populate('assignedTo', 'name email role')
            .populate('objectiveOfCallId', 'objectiveOfCalling remarks');

        // Send success response
        res.status(201).json({
            success: true,
            message: "Calling created successfully",
            data: populatedCalling
        });

    } catch (error) {
        console.error("Error creating calling:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create calling",
            error: error.message
        });
    }
};









//Fetches the data on the basis of logged in user object id which is assignedTo, and
//objectiveOfCallId, callingStatus, callingType, startDate, endDate, calledTO

export const getCallingsByAssignedTo = async (req, res) => {
    try {
        const { 
            assignedTo, 
            objectiveOfCallId,
            callingStatus, 
            callingType,
            startDate,
            endDate,
            calledTo 
        } = req.body;


  
        // Validate required fields
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: "assignedTo is required in request body"
            });
        }

        if (!objectiveOfCallId) {
            return res.status(400).json({
                success: false,
                message: "objectiveOfCallId is required in request body"
            });
        }

        // Build match conditions
        const matchConditions = {
            assignedTo: new mongoose.Types.ObjectId(assignedTo),
            objectiveOfCallId: new mongoose.Types.ObjectId(objectiveOfCallId)
        };
        
        // Add optional filters
        if (callingStatus) matchConditions.callingStatus = callingStatus;
        if (callingType) matchConditions.callingType = callingType;
        if (calledTo) matchConditions.calledTo = calledTo;
        
        // Date range filter
        if (startDate || endDate) {
            matchConditions.callingDate = {};
            if (startDate) matchConditions.callingDate.$gte = new Date(startDate);
            if (endDate) matchConditions.callingDate.$lte = new Date(endDate);
        }
        
        // Build aggregation pipeline with facet for statistics
        const pipeline = [
            // Match documents based on assignedTo and objectiveOfCallId
            {
                $match: matchConditions
            },
            
            // Facet to separate data and statistics
            {
                $facet: {
                    // Data with lookups
                    data: [
                        // Lookup student details
                        {
                            $lookup: {
                                from: "students",
                                localField: "studentUnqObjectId",
                                foreignField: "_id",
                                as: "studentDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$studentDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        // Lookup user details
                        {
                            $lookup: {
                                from: "users",
                                localField: "assignedTo",
                                foreignField: "_id",
                                as: "assignedToDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$assignedToDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        // Lookup objective details
                        {
                            $lookup: {
                                from: "objectiveofcallings",
                                localField: "objectiveOfCallId",
                                foreignField: "_id",
                                as: "objectiveDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$objectiveDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        // Project required fields
                        {
                            $project: {
                                _id: 1,
                                studentUnqObjectId: 1,
                                assignedTo: 1,
                                roleOfAssignedTo: 1,
                                callingType: 1,
                                calledTo: 1,
                                name: 1,
                                fatherName: 1,
                                district: 1,
                                block: 1,
                                school: 1,
                                contact1: 1,
                                contact2: 1,
                                contact3: 1,
                                callingStatus: 1,
                                remark: 1,
                                dependentRemark: 1,
                                manualRemark: 1,
                                newUpdatedValue: 1,
                                objectiveOfCallId: 1,
                                callingDate: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                studentDetails: {
                                    $cond: {
                                        if: { $ifNull: ["$studentDetails", false] },
                                        then: {
                                            _id: "$studentDetails._id",
                                            studentSrn: "$studentDetails.studentSrn",
                                            firstName: "$studentDetails.firstName",
                                            fatherName: "$studentDetails.fatherName",
                                            classofStudent: "$studentDetails.classofStudent",
                                            personalContact: "$studentDetails.personalContact",
                                            ParentContact: "$studentDetails.ParentContact"
                                        },
                                        else: null
                                    }
                                },
                                assignedToDetails: {
                                    $cond: {
                                        if: { $ifNull: ["$assignedToDetails", false] },
                                        then: {
                                            _id: "$assignedToDetails._id",
                                            name: "$assignedToDetails.name",
                                            email: "$assignedToDetails.email",
                                            role: "$assignedToDetails.role",
                                            department: "$assignedToDetails.department",
                                            contact1: "$assignedToDetails.contact1"
                                        },
                                        else: null
                                    }
                                },
                                objectiveDetails: {
                                    $cond: {
                                        if: { $ifNull: ["$objectiveDetails", false] },
                                        then: {
                                            _id: "$objectiveDetails._id",
                                            objectiveOfCalling: "$objectiveDetails.objectiveOfCalling",
                                            remarks: "$objectiveDetails.remarks"
                                        },
                                        else: null
                                    }
                                }
                            }
                        },
                        {
                            $sort: {
                                callingDate: -1,
                                createdAt: -1
                            }
                        }
                    ],
                    // Statistics
                    statistics: [
                        {
                            $group: {
                                _id: null,
                                totalCalls: { $sum: 1 },
                                connectedCalls: {
                                    $sum: {
                                        $cond: [{ $eq: ["$callingStatus", "CONNECTED"] }, 1, 0]
                                    }
                                },
                                notConnectedCalls: {
                                    $sum: {
                                        $cond: [{ $eq: ["$callingStatus", "NOT_CONNECTED"] }, 1, 0]
                                    }
                                },
                                pendingCalls: {
                                    $sum: {
                                        $cond: [{ $eq: ["$callingStatus", "PENDING"] }, 1, 0]
                                    }
                                },
                                completedCalls: {
                                    $sum: {
                                        $cond: [{ $eq: ["$callingStatus", "COMPLETED"] }, 1, 0]
                                    }
                                },
                                mBCalls: {
                                    $sum: {
                                        $cond: [{ $eq: ["$callingType", "MB_CALLING"] }, 1, 0]
                                    }
                                },
                                randomCalls: {
                                    $sum: {
                                        $cond: [{ $eq: ["$callingType", "RANDOM_CALLING"] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ];
        
        // Execute aggregation
        const result = await Calling.aggregate(pipeline);
        
        // Extract data and statistics
        const data = result[0]?.data || [];
        const statistics = result[0]?.statistics[0] || {
            totalCalls: 0,
            connectedCalls: 0,
            notConnectedCalls: 0,
            pendingCalls: 0,
            completedCalls: 0,
            mBCalls: 0,
            randomCalls: 0
        };
        
        // Send response
        res.status(200).json({
            success: true,
            message: `Found ${data.length} callings for assigned user and objective`,
            filters: {
                assignedTo,
                objectiveOfCallId,
                callingStatus: callingStatus || "All",
                callingType: callingType || "All",
                calledTo: calledTo || "All",
                dateRange: startDate && endDate ? `${startDate} to ${endDate}` : "All"
            },
            statistics,
            count: data.length,
            data
        });
        
    } catch (error) {
        console.error("Error fetching callings:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Failed to fetch callings",
            error: error.message
        });
    }
};




export const updateCalling = async (req, res) => {
    try {
        const {
            _id,
            assignedTo,
            callingDate,
            objectiveOfCallId,
            callingStatus,
            remark,
            dependentRemark,
            manualRemark,
            newUpdatedValue
        } = req.body;

        // Validate required field
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "_id is required in request body"
            });
        }

        // Check if the calling record exists
        const existingCalling = await Calling.findById(_id);
        if (!existingCalling) {
            return res.status(404).json({
                success: false,
                message: "Calling record not found"
            });
        }

        // Build update object with only provided fields
        const updateData = {};
        
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (callingDate !== undefined) updateData.callingDate = callingDate;
        if (objectiveOfCallId !== undefined) updateData.objectiveOfCallId = objectiveOfCallId;
        if (callingStatus !== undefined) updateData.callingStatus = callingStatus;
        if (remark !== undefined) updateData.remark = remark;
        if (dependentRemark !== undefined) updateData.dependentRemark = dependentRemark;
        if (manualRemark !== undefined) updateData.manualRemark = manualRemark;
        if (newUpdatedValue !== undefined) updateData.newUpdatedValue = newUpdatedValue;

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update. Allowed fields: assignedTo, callingDate, objectiveOfCallId, callingStatus, remark, dependentRemark, manualRemark, newUpdatedValue"
            });
        }

        // Validate ObjectIds if provided
        if (assignedTo !== undefined && assignedTo !== null && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignedTo ID format"
            });
        }

        if (objectiveOfCallId !== undefined && objectiveOfCallId !== null && !mongoose.Types.ObjectId.isValid(objectiveOfCallId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid objectiveOfCallId ID format"
            });
        }

        // If objectiveOfCallId is being updated and not null, verify it exists
        if (objectiveOfCallId !== undefined && objectiveOfCallId !== null) {
            const objectiveExists = await ObjectiveOfCalling.findById(objectiveOfCallId);
            if (!objectiveExists) {
                return res.status(404).json({
                    success: false,
                    message: "Objective of calling not found with the provided ID"
                });
            }
        }

        // If assignedTo is being updated and not null, verify it exists (optional - adjust based on your User model)
        if (assignedTo !== undefined && assignedTo !== null) {
            const User = mongoose.model('User');
            const userExists = await User.findById(assignedTo);
            if (!userExists) {
                return res.status(404).json({
                    success: false,
                    message: "User not found with the provided assignedTo ID"
                });
            }
        }

        // Update the calling record
        const updatedCalling = await Calling.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Populate references for response
        const populatedCalling = await Calling.findById(updatedCalling._id)
            .populate('studentUnqObjectId', 'firstName fatherName studentSrn classofStudent personalContact ParentContact')
            .populate('assignedTo', 'name email role department contact1 contact2')
            .populate('objectiveOfCallId', 'objectiveOfCalling remarks callingStatus');

        // Send success response
        res.status(200).json({
            success: true,
            message: "Calling record updated successfully",
            updatedFields: Object.keys(updateData),
            data: populatedCalling
        });

    } catch (error) {
        console.error("Error updating calling:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update calling record",
            error: error.message
        });
    }
};





export const getObjectiveOfCall = async (req, res) => {
    try {
        const response = await ObjectiveOfCalling.find({isObjectOfCallingDone:false});
        
        res.status(200).json({ 
            success: true, 
            message: "Objective of call data fetched successfully",
            count: response.length,
            data: response 
        });

    } catch (error) {
        console.log("Error fetching objective of call data", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error while fetching objective of call data",
            error: error.message 
        });
    }
}



















//Calling Dashboard................



export const callingDashboardByUserId = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        // Validate input
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: "assignedTo is required"
            });
        }

        // Convert string to ObjectId
        const assignedToObjectId = new mongoose.Types.ObjectId(assignedTo);

        // Get callings data with proper status grouping
        const callingStats = await Calling.aggregate([
            {
                $match: {
                    assignedTo: assignedToObjectId
                }
            },
            {
                $addFields: {
                    normalizedStatus: {
                        $switch: {
                            branches: [
                                {
                                    case: { 
                                        $or: [
                                            { $eq: ["$callingStatus", "CONNECTED"] },
                                            { $eq: ["$callingStatus", "Connected"] }
                                        ]
                                    },
                                    then: "Connected"
                                },
                                {
                                    case: { 
                                        $or: [
                                            { $eq: ["$callingStatus", "NOT_CONNECTED"] },
                                            { $eq: ["$callingStatus", "Not Connected"] }
                                        ]
                                    },
                                    then: "Not Connected"
                                },
                                {
                                    case: { 
                                        $or: [
                                            { $eq: ["$callingStatus", "WRONG_NUMBER"] },
                                            { $eq: ["$callingStatus", "Wrong Number"] }
                                        ]
                                    },
                                    then: "Wrong Number"
                                }
                            ],
                            default: "Pending"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        objectiveOfCallId: "$objectiveOfCallId",
                        status: "$normalizedStatus"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.objectiveOfCallId",
                    statusCounts: {
                        $push: {
                            status: "$_id.status",
                            count: "$count"
                        }
                    },
                    totalCalls: { $sum: "$count" }
                }
            }
        ]);

        // Get all objectives
        const allObjectives = await ObjectiveOfCalling.find({}).lean();

        // Create a map for quick lookup
        const statsMap = {};
        callingStats.forEach(stat => {
            statsMap[stat._id.toString()] = stat;
        });

        // Combine objectives with their stats
        const dashboardData = allObjectives.map(objective => {
            const stats = statsMap[objective._id.toString()];
            let statusMap = {
                "Connected": 0,
                "Not Connected": 0,
                "Pending": 0,
                "Wrong Number": 0
            };
            
            if (stats) {
                stats.statusCounts.forEach(statusItem => {
                    const status = statusItem.status;
                    const count = statusItem.count;
                    
                    if (status === "Connected") {
                        statusMap["Connected"] = count;
                    } else if (status === "Not Connected") {
                        statusMap["Not Connected"] = count;
                    } else if (status === "Wrong Number") {
                        statusMap["Wrong Number"] = count;
                    } else if (status === "Pending") {
                        statusMap["Pending"] = count;
                    }
                });
            }

            const totalCalls = statusMap["Connected"] + 
                              statusMap["Not Connected"] + 
                              statusMap["Pending"] + 
                              statusMap["Wrong Number"];

            return {
                objectiveId: objective._id,
                objectiveOfCalling: objective.objectiveOfCalling,
                descriptionOfCalling: objective.descriptionOfCalling,
                totalCalls: totalCalls,
                statusBreakdown: {
                    Connected: statusMap["Connected"],
                    NotConnected: statusMap["Not Connected"],
                    Pending: statusMap["Pending"],
                    WrongNumber: statusMap["Wrong Number"]
                },
                config: {
                    remarks: objective.remarks,
                    isNewValueToBeUpdatedRequired: objective.isNewValueToBeUpdatedRequired,
                    dependentRemarkRequired: objective.dependentRemarkRequired,
                    isManualRemarkRequired: objective.isManualRemarkRequired,
                    isObjectOfCallingDone: objective.isObjectOfCallingDone
                },
                callingDate: objective.callingDate
            };
        });

        // Calculate overall statistics
        const overallStats = {
            totalObjectives: dashboardData.length,
            totalCalls: dashboardData.reduce((sum, item) => sum + item.totalCalls, 0),
            totalConnected: dashboardData.reduce((sum, item) => sum + item.statusBreakdown.Connected, 0),
            totalNotConnected: dashboardData.reduce((sum, item) => sum + item.statusBreakdown.NotConnected, 0),
            totalPending: dashboardData.reduce((sum, item) => sum + item.statusBreakdown.Pending, 0),
            totalWrongNumber: dashboardData.reduce((sum, item) => sum + item.statusBreakdown.WrongNumber, 0)
        };

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                user: {
                    assignedTo: assignedTo
                },
                objectives: dashboardData,
                overallStats: overallStats,
                summary: {
                    totalObjectives: dashboardData.length,
                    objectivesWithCalls: callingStats.length,
                    objectivesWithoutCalls: dashboardData.length - callingStats.length,
                    fetchedAt: new Date()
                }
            }
        });

    } catch (error) {
        console.error("Error in callingDashboardByUserId:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};