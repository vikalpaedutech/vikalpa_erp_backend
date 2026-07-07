
import mongoose from "mongoose"; 
import { User, UserAccess, UserLeave } from "../models/user.model.js";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { District_Block_School } from "../models/district_block_school.model.js";

// Create or Update User Leave
export const createUserLeave = async (req, res) => {
    try {
        const { 
            unqObjectId,
            year,
            leaves
        } = req.body;

        // Validate required fields
        if (!unqObjectId) {
            return res.status(400).json({
                status: "Error",
                message: "unqObjectId is required"
            });
        }

        // Check if user exists
        const userExists = await User.findById(unqObjectId);
        if (!userExists) {
            return res.status(404).json({
                status: "Error",
                message: "User not found with this unqObjectId"
            });
        }

        // Check if leave record already exists for this user and year
        let userLeave;
        if (year) {
            userLeave = await UserLeave.findOne({ unqObjectId, year });
        } else {
            userLeave = await UserLeave.findOne({ unqObjectId });
        }

        if (userLeave) {
            // Update existing leave record
            const updateData = {};
            
            if (year !== undefined) updateData.year = year;
            if (leaves !== undefined) updateData.leaves = leaves;

            userLeave = await UserLeave.findByIdAndUpdate(
                userLeave._id,
                updateData,
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                status: "Success",
                message: "User leave updated successfully",
                data: userLeave
            });
        } else {
            // Create new leave record
            const newUserLeave = new UserLeave({
                unqObjectId,
                year: year || new Date().getFullYear().toString(),
                leaves: leaves || [
                    { leaveType: "CL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "SL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "EL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "PL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "LWP", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "ML", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "Paternity", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "Comp-off", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "FH", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "GH", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "WFH", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "Half Day", totalAlloted: 10, totalUsed: 0, remaining: 10 }
                ]
            });

            await newUserLeave.save();

            return res.status(201).json({
                status: "Success",
                message: "User leave created successfully",
                data: newUserLeave
            });
        }

    } catch (error) {
        console.error("Error in createUserLeave:", error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: "Error",
                message: messages.join(', ')
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                status: "Error",
                message: "Duplicate key error - User leave record for this year already exists"
            });
        }

        return res.status(500).json({
            status: "Error",
            message: "Server error while creating/updating user leave"
        });
    }
};

// Get User Leave by ID
export const getUserLeave = async (req, res) => {
    try {
        const { unqObjectId } = req.params;
        const { year } = req.query;

        if (!unqObjectId) {
            return res.status(400).json({
                status: "Error",
                message: "unqObjectId is required"
            });
        }

        let userLeave;
        if (year) {
            userLeave = await UserLeave.findOne({ unqObjectId, year })
                .populate('unqObjectId', 'name userId email role');
        } else {
            const currentYear = new Date().getFullYear().toString();
            userLeave = await UserLeave.findOne({ unqObjectId, year: currentYear })
                .populate('unqObjectId', 'name userId email role');
            
            if (!userLeave) {
                userLeave = await UserLeave.findOne({ unqObjectId })
                    .populate('unqObjectId', 'name userId email role');
            }
        }

        if (!userLeave) {
            return res.status(404).json({
                status: "Error",
                message: "User leave record not found for the specified year"
            });
        }

        return res.status(200).json({
            status: "Success",
            data: userLeave
        });

    } catch (error) {
        console.error("Error in getUserLeave:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while fetching user leave"
        });
    }
};

// Get All User Leaves (with filters)
export const getAllUserLeaves = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search,
            year,
            leaveType,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter
        let filter = {};
        
        if (year) {
            filter.year = year;
        } else {
            filter.year = new Date().getFullYear().toString();
        }

        if (search) {
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { userId: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            
            const userIds = users.map(u => u._id);
            filter.unqObjectId = { $in: userIds };
        }

        // If leaveType filter is provided, we'll filter after population
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const totalCount = await UserLeave.countDocuments(filter);

        let userLeaves = await UserLeave.find(filter)
            .populate('unqObjectId', 'name userId email role profileImage')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Filter by leaveType if provided
        if (leaveType) {
            userLeaves = userLeaves.filter(userLeave => 
                userLeave.leaves && userLeave.leaves.some(l => l.leaveType === leaveType)
            );
        }

        return res.status(200).json({
            status: "Success",
            data: userLeaves,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Error in getAllUserLeaves:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while fetching user leaves"
        });
    }
};

// Update Specific Leave Type
export const updateLeaveType = async (req, res) => {
    try {
        const { unqObjectId } = req.params;
        const { 
            year,
            leaveType, 
            totalAlloted,
            totalUsed,
            operation, // 'add' or 'subtract' for used leaves
            value // amount to add/subtract from used
        } = req.body;

        // Validate required fields
        if (!unqObjectId) {
            return res.status(400).json({
                status: "Error",
                message: "unqObjectId is required"
            });
        }

        if (!leaveType) {
            return res.status(400).json({
                status: "Error",
                message: "leaveType is required"
            });
        }

        // Check if user exists
        const userExists = await User.findById(unqObjectId);
        if (!userExists) {
            return res.status(404).json({
                status: "Error",
                message: "User not found"
            });
        }

        // Find leave record
        const targetYear = year || new Date().getFullYear().toString();
        let userLeave = await UserLeave.findOne({ unqObjectId, year: targetYear });

        if (!userLeave) {
            // Create new record if not exists
            userLeave = new UserLeave({
                unqObjectId,
                year: targetYear,
                leaves: [
                    { leaveType: "CL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "SL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "EL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "PL", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "LWP", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "ML", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "Paternity", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "Comp-off", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "FH", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "GH", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "WFH", totalAlloted: 10, totalUsed: 0, remaining: 10 },
                    { leaveType: "Half Day", totalAlloted: 10, totalUsed: 0, remaining: 10 }
                ]
            });
        }

        // Find the specific leave type in the leaves array
        const leaveIndex = userLeave.leaves.findIndex(l => l.leaveType === leaveType);
        
        if (leaveIndex === -1) {
            // If leave type doesn't exist, add it
            userLeave.leaves.push({
                leaveType: leaveType,
                totalAlloted: totalAlloted || 10,
                totalUsed: 0,
                remaining: totalAlloted || 10
            });
        } else {
            // Update existing leave type
            if (totalAlloted !== undefined) {
                userLeave.leaves[leaveIndex].totalAlloted = totalAlloted;
                userLeave.leaves[leaveIndex].remaining = totalAlloted - userLeave.leaves[leaveIndex].totalUsed;
            }

            if (operation && value !== undefined) {
                if (operation === 'add') {
                    userLeave.leaves[leaveIndex].totalUsed += value;
                    // Don't let used exceed alloted
                    if (userLeave.leaves[leaveIndex].totalUsed > userLeave.leaves[leaveIndex].totalAlloted) {
                        userLeave.leaves[leaveIndex].totalUsed = userLeave.leaves[leaveIndex].totalAlloted;
                    }
                } else if (operation === 'subtract') {
                    userLeave.leaves[leaveIndex].totalUsed -= value;
                    if (userLeave.leaves[leaveIndex].totalUsed < 0) {
                        userLeave.leaves[leaveIndex].totalUsed = 0;
                    }
                }
                userLeave.leaves[leaveIndex].remaining = userLeave.leaves[leaveIndex].totalAlloted - userLeave.leaves[leaveIndex].totalUsed;
            }

            if (totalUsed !== undefined) {
                userLeave.leaves[leaveIndex].totalUsed = totalUsed;
                userLeave.leaves[leaveIndex].remaining = userLeave.leaves[leaveIndex].totalAlloted - totalUsed;
            }
        }

        await userLeave.save();

        return res.status(200).json({
            status: "Success",
            message: `${leaveType} updated successfully for year ${targetYear}`,
            data: userLeave
        });

    } catch (error) {
        console.error("Error in updateLeaveType:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while updating leave type"
        });
    }
};

// Add Leave Usage (when user takes leave)
export const useLeave = async (req, res) => {
    try {
        const { unqObjectId } = req.params;
        const { year, leaveType, days } = req.body;

        if (!unqObjectId || !leaveType || !days) {
            return res.status(400).json({
                status: "Error",
                message: "unqObjectId, leaveType, and days are required"
            });
        }

        if (days <= 0) {
            return res.status(400).json({
                status: "Error",
                message: "Days must be greater than 0"
            });
        }

        const targetYear = year || new Date().getFullYear().toString();
        let userLeave = await UserLeave.findOne({ unqObjectId, year: targetYear });

        if (!userLeave) {
            return res.status(404).json({
                status: "Error",
                message: "Leave record not found for this user and year"
            });
        }

        const leaveIndex = userLeave.leaves.findIndex(l => l.leaveType === leaveType);
        
        if (leaveIndex === -1) {
            return res.status(404).json({
                status: "Error",
                message: `Leave type ${leaveType} not found for this user`
            });
        }

        // Check if enough leave balance is available
        const currentRemaining = userLeave.leaves[leaveIndex].remaining;
        if (currentRemaining < days) {
            return res.status(400).json({
                status: "Error",
                message: `Insufficient ${leaveType} balance. Available: ${currentRemaining}, Requested: ${days}`
            });
        }

        // Update used and remaining
        userLeave.leaves[leaveIndex].totalUsed += days;
        userLeave.leaves[leaveIndex].remaining = userLeave.leaves[leaveIndex].totalAlloted - userLeave.leaves[leaveIndex].totalUsed;

        await userLeave.save();

        return res.status(200).json({
            status: "Success",
            message: `Leave used successfully`,
            data: userLeave
        });

    } catch (error) {
        console.error("Error in useLeave:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while using leave"
        });
    }
};

// Bulk Update User Leaves
export const bulkUpdateUserLeaves = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                status: "Error",
                message: "updates array is required"
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const { unqObjectId, year, leaves } = update;

                if (!unqObjectId || !leaves) {
                    errors.push({
                        unqObjectId: unqObjectId || 'unknown',
                        error: "unqObjectId and leaves are required"
                    });
                    continue;
                }

                const userExists = await User.findById(unqObjectId);
                if (!userExists) {
                    errors.push({
                        unqObjectId,
                        error: "User not found"
                    });
                    continue;
                }

                const targetYear = year || new Date().getFullYear().toString();
                let userLeave = await UserLeave.findOne({ unqObjectId, year: targetYear });

                if (!userLeave) {
                    userLeave = new UserLeave({
                        unqObjectId,
                        year: targetYear,
                        leaves: leaves
                    });
                } else {
                    // Update existing leaves
                    for (const newLeave of leaves) {
                        const existingIndex = userLeave.leaves.findIndex(l => l.leaveType === newLeave.leaveType);
                        if (existingIndex !== -1) {
                            // Update existing
                            userLeave.leaves[existingIndex] = newLeave;
                        } else {
                            // Add new
                            userLeave.leaves.push(newLeave);
                        }
                    }
                }

                await userLeave.save();
                
                results.push({
                    unqObjectId,
                    year: targetYear,
                    status: "Success",
                    data: userLeave
                });

            } catch (error) {
                errors.push({
                    unqObjectId: update.unqObjectId || 'unknown',
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            status: "Success",
            message: `Processed ${results.length} records successfully, ${errors.length} failed`,
            data: {
                successful: results,
                failed: errors
            }
        });

    } catch (error) {
        console.error("Error in bulkUpdateUserLeaves:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while bulk updating user leaves"
        });
    }
};

// Delete User Leave
export const deleteUserLeave = async (req, res) => {
    try {
        const { unqObjectId } = req.params;
        const { year } = req.query;

        if (!unqObjectId) {
            return res.status(400).json({
                status: "Error",
                message: "unqObjectId is required"
            });
        }

        let userLeave;
        if (year) {
            userLeave = await UserLeave.findOneAndDelete({ unqObjectId, year });
        } else {
            userLeave = await UserLeave.findOneAndDelete({ unqObjectId });
        }

        if (!userLeave) {
            return res.status(404).json({
                status: "Error",
                message: "User leave record not found"
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "User leave record deleted successfully",
            data: userLeave
        });

    } catch (error) {
        console.error("Error in deleteUserLeave:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while deleting user leave"
        });
    }
};

// Reset All Leave Balances for a Year
export const resetAllLeaveBalances = async (req, res) => {
    try {
        const { year, leaveTypes, totalAlloted = 10, totalUsed = 0 } = req.body;

        const targetYear = year || new Date().getFullYear().toString();

        // Get all user leave records for the year
        const userLeaves = await UserLeave.find({ year: targetYear });

        if (userLeaves.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: `No leave records found for year ${targetYear}`
            });
        }

        let modifiedCount = 0;

        for (const userLeave of userLeaves) {
            if (leaveTypes && Array.isArray(leaveTypes)) {
                // Reset specific leave types
                for (const type of leaveTypes) {
                    const leaveIndex = userLeave.leaves.findIndex(l => l.leaveType === type);
                    if (leaveIndex !== -1) {
                        userLeave.leaves[leaveIndex].totalAlloted = totalAlloted;
                        userLeave.leaves[leaveIndex].totalUsed = totalUsed;
                        userLeave.leaves[leaveIndex].remaining = totalAlloted - totalUsed;
                        modifiedCount++;
                    }
                }
            } else {
                // Reset all leave types
                for (const leave of userLeave.leaves) {
                    leave.totalAlloted = totalAlloted;
                    leave.totalUsed = totalUsed;
                    leave.remaining = totalAlloted - totalUsed;
                    modifiedCount++;
                }
            }
            await userLeave.save();
        }

        return res.status(200).json({
            status: "Success",
            message: `Reset ${modifiedCount} leave balances for year ${targetYear}`,
            data: {
                modifiedCount: modifiedCount,
                year: targetYear,
                totalAlloted: totalAlloted,
                totalUsed: totalUsed
            }
        });

    } catch (error) {
        console.error("Error in resetAllLeaveBalances:", error);
        return res.status(500).json({
            status: "Error",
            message: "Server error while resetting leave balances"
        });
    }
};