import mongoose from "mongoose";
import { Student } from "../models/student.model.js";
import { District_Block_School } from "../models/district_block_school.model.js";

import { StudentCopyChecking } from "../models/studentCopyChecking.model.js";


export const GetCopyCheckingData = async (req, res) => {
    const {
        schoolId,
        districtId,
        blockId,
        unqStudentObjectId,
        date,
        copyCheckingType,
        status,
        subject,
        batch
    } = req.body;

    try {
        // Validate required fields
        if (!batch) {
            return res.status(400).json({
                success: false,
                message: "Batch is required"
            });
        }

        // Build match conditions for students
        const studentMatchConditions = {
            isSlcTaken: false,
            batch: batch
        };
        
        if (schoolId) {
            studentMatchConditions.schoolId = schoolId;
        }
        
        if (unqStudentObjectId) {
            studentMatchConditions._id = new mongoose.Types.ObjectId(unqStudentObjectId);
        }

        // Build date filter for copy checking
        let copyCheckingDateMatch = {};
        if (date) {
            const searchDate = new Date(date);
            if (isNaN(searchDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format"
                });
            }
            
            // Create start and end of day in UTC
            const startOfDay = new Date(Date.UTC(
                searchDate.getFullYear(),
                searchDate.getMonth(),
                searchDate.getDate(),
                0, 0, 0, 0
            ));
            
            const endOfDay = new Date(Date.UTC(
                searchDate.getFullYear(),
                searchDate.getMonth(),
                searchDate.getDate(),
                23, 59, 59, 999
            ));
            
            copyCheckingDateMatch = {
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            };
        }

        // Build copy checking additional filters
        const copyCheckingMatchConditions = {};
        if (copyCheckingType) {
            copyCheckingMatchConditions.copyCheckingType = copyCheckingType;
        }
        if (status) {
            copyCheckingMatchConditions.status = status;
        }
        if (subject) {
            copyCheckingMatchConditions.subject = subject;
        }

        // Aggregation pipeline
        const studentsData = await Student.aggregate([
            // Stage 1: Match students with filters
            {
                $match: studentMatchConditions
            },
            
            // Stage 2: Lookup school details
            {
                $lookup: {
                    from: "district_block_schools",
                    localField: "schoolId",
                    foreignField: "schoolId",
                    as: "schoolDetails"
                }
            },
            
            // Stage 3: Unwind school details
            {
                $unwind: {
                    path: "$schoolDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            
            // Stage 4: Apply district and block filters
            {
                $match: {
                    ...(districtId && { "schoolDetails.districtId": districtId }),
                    ...(blockId && { "schoolDetails.blockId": blockId })
                }
            },
            
            // Stage 5: Lookup copy checking records (FIXED - removed studentSrn condition)
            {
                $lookup: {
                    from: "studentcopycheckings",
                    let: { 
                        studentId: "$_id",
                        studentSchoolId: "$schoolId",
                        studentBatch: "$batch"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$unqStudentObjectId", "$$studentId"] },
                                        { $eq: ["$schoolId", "$$studentSchoolId"] },
                                        { $eq: ["$batch", "$$studentBatch"] }
                                    ]
                                },
                                ...copyCheckingDateMatch,
                                ...copyCheckingMatchConditions
                            }
                        },
                        {
                            $sort: { date: -1, createdAt: -1 }
                        }
                    ],
                    as: "copyCheckings"
                }
            },
            
            // Stage 6: Project the required fields
            {
                $project: {
                    _id: 1,
                    studentSrn: 1,
                    rollNumber: 1,
                    firstName: 1,
                    lastName: 1,
                    fatherName: 1,
                    motherName: 1,
                    personalContact: 1,
                    ParentContact: 1,
                    gender: 1,
                    category: 1,
                    address: 1,
                    districtId: 1,
                    blockId: 1,
                    schoolId: 1,
                    classofStudent: 1,
                    parent: 1,
                    enrollmentDate: 1,
                    batch: 1,
                    medium: 1,
                    isStudentOf: 1,
                    schoolDetails: {
                        schoolId: "$schoolDetails.schoolId",
                        schoolName: "$schoolDetails.schoolName",
                        districtId: "$schoolDetails.districtId",
                        districtName: "$schoolDetails.districtName",
                        blockId: "$schoolDetails.blockId",
                        blockName: "$schoolDetails.blockName"
                    },
                    copyCheckings: 1,
                    latestCopyChecking: {
                        $arrayElemAt: ["$copyCheckings", 0]
                    },
                    hasCopyChecking: {
                        $cond: [{ $gt: [{ $size: "$copyCheckings" }, 0] }, true, false]
                    },
                    totalCopyCheckingsCount: { $size: "$copyCheckings" }
                }
            }
        ]);

        // Summary statistics
        const summary = {
            totalStudents: studentsData.length,
            studentsWithCopyCheckings: studentsData.filter(s => s.hasCopyChecking).length,
            studentsWithoutCopyCheckings: studentsData.filter(s => !s.hasCopyChecking).length,
            totalCopyCheckings: studentsData.reduce((sum, s) => sum + s.totalCopyCheckingsCount, 0),
            copyCheckingTypeBreakdown: { homeWork: 0, classWork: 0 },
            statusBreakdown: { complete: 0, incomplete: 0, unavailable: 0 }
        };

        studentsData.forEach(student => {
            student.copyCheckings.forEach(cc => {
                if (cc.copyCheckingType === "Home Work") summary.copyCheckingTypeBreakdown.homeWork++;
                else if (cc.copyCheckingType === "Class Work") summary.copyCheckingTypeBreakdown.classWork++;
                
                if (cc.status === "complete") summary.statusBreakdown.complete++;
                else if (cc.status === "incomplete") summary.statusBreakdown.incomplete++;
                else if (cc.status === "unavailable") summary.statusBreakdown.unavailable++;
            });
        });

        return res.status(200).json({
            success: true,
            message: "Copy checking data fetched successfully",
            filters: {
                batch: batch || "All",
                schoolId: schoolId || "All",
                districtId: districtId || "All",
                blockId: blockId || "All",
                unqStudentObjectId: unqStudentObjectId || "All",
                date: date || "All",
                copyCheckingType: copyCheckingType || "All",
                status: status || "All",
                subject: subject || "All"
            },
            summary: summary,
            data: studentsData
        });

    } catch (error) {
        console.error("Error in GetCopyCheckingData:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



export const CreateStudentCopyChecking = async (req, res) => {

console.log('I am in studentCopyChecking.controller.js, api: CreateStudentCopyChecking')

    const {
        unqStudentObjectId,
        studentSrn,
        batch,
        schoolId,
        subject,
        copyCheckingType,
        status,
        remark,
        date,
        copyCheckingDoneBy,
    } = req.body;


console.log(req.body)
    try {
        // Validate required fields
        if (!unqStudentObjectId || !studentSrn || !schoolId || !date || !subject || !copyCheckingType) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: unqStudentObjectId, studentSrn, schoolId, date, subject, and copyCheckingType are required"
            });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(unqStudentObjectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unqStudentObjectId format"
            });
        }

        if (copyCheckingDoneBy && !mongoose.Types.ObjectId.isValid(copyCheckingDoneBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid copyCheckingDoneBy format"
            });
        }

        // Validate copyCheckingType
        const validTypes = ["Home Work", "Class Work"];
        if (!validTypes.includes(copyCheckingType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid copyCheckingType. Must be 'Home Work' or 'Class Work'"
            });
        }

        // Validate status
        const validStatuses = ["Complete", "Incomplete", "Unavailable"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'complete', 'incomplete', or 'unavailable'"
            });
        }

        // FIX: Proper date handling to preserve the date as entered
        // Parse the date string (assuming YYYY-MM-DD format)
        const dateParts = date.split('-');
        if (dateParts.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD"
            });
        }
        
        // Create date at UTC midnight to avoid timezone shifts
        const normalizedDate = new Date(Date.UTC(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2])
        ));
        
        // Create start and end of day in UTC
        const startOfDay = new Date(Date.UTC(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]), 
            0, 0, 0, 0
        ));
        
        const endOfDay = new Date(Date.UTC(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]), 
            23, 59, 59, 999
        ));

        // Check if record exists with same unqStudentObjectId, date, subject, AND copyCheckingType
        const existingRecord = await StudentCopyChecking.findOne({
            unqStudentObjectId: unqStudentObjectId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            subject: subject,
            copyCheckingType: copyCheckingType
        });

        if (existingRecord) {
            // Update existing record
            const updatedRecord = await StudentCopyChecking.findByIdAndUpdate(
                existingRecord._id,
                {
                    studentSrn,
                    batch,
                    schoolId,
                    status: status || existingRecord.status,
                    remark: remark || existingRecord.remark,
                    copyCheckingDoneBy: copyCheckingDoneBy || existingRecord.copyCheckingDoneBy,
                },
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                success: true,
                message: `Student ${copyCheckingType} for ${subject} updated successfully`,
                data: updatedRecord
            });
        } else {
            // Create new record with normalized date
            const newRecord = await StudentCopyChecking.create({
                unqStudentObjectId,
                studentSrn,
                batch,
                schoolId,
                subject,
                copyCheckingType,
                status: status || null,
                remark: remark || null,
                date: normalizedDate, // This will store as UTC but preserve the intended date
                copyCheckingDoneBy: copyCheckingDoneBy || null
            });

            return res.status(201).json({
                success: true,
                message: `Student ${copyCheckingType} for ${subject} created successfully`,
                data: newRecord
            });
        }

    } catch (error) {
        console.error("Error in CreateStudentCopyChecking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
//Deleing copy checking status
export const DeleteStudentCopyChecking = async (req, res) => {
    const { unqStudentObjectId, date } = req.body;

    try {
        // Validate required fields
        if (!unqStudentObjectId || !date) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: unqStudentObjectId and date are required"
            });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(unqStudentObjectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unqStudentObjectId format"
            });
        }

        // Normalize date to start and end of day
        const searchDate = new Date(date);
        if (isNaN(searchDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format"
            });
        }
        
        searchDate.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Find and delete the record
        const deletedRecord = await StudentCopyChecking.findOneAndDelete({
            unqStudentObjectId: unqStudentObjectId,
            date: {
                $gte: searchDate,
                $lte: endOfDay
            }
        });

        // Check if record was found and deleted
        if (!deletedRecord) {
            return res.status(404).json({
                success: false,
                message: "No copy checking record found for the given student and date"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student copy checking record deleted successfully",
            data: deletedRecord
        });

    } catch (error) {
        console.error("Error in DeleteStudentCopyChecking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



//Dashboard copy checking

// export const StudentCopyCheckinDashboard = async (req, res) => {
//     try {
//         const { batch, date, schoolId, districtId, blockId } = req.body;

//         // Build match conditions for students
//         const studentMatchConditions = {
//             isSlcTaken: false
//         };
        
//         if (batch) {
//             studentMatchConditions.batch = batch;
//         }
        
//         if (schoolId) {
//             studentMatchConditions.schoolId = schoolId;
//         }

//         // Build date filter for copy checking
//         let copyCheckingDateMatch = {};
//         if (date) {
//             const searchDate = new Date(date);
//             if (isNaN(searchDate.getTime())) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid date format"
//                 });
//             }
//             searchDate.setHours(0, 0, 0, 0);
//             const endOfDay = new Date(searchDate);
//             endOfDay.setHours(23, 59, 59, 999);
            
//             copyCheckingDateMatch = {
//                 date: {
//                     $gte: searchDate,
//                     $lte: endOfDay
//                 }
//             };
//         }

//         // Aggregation pipeline
//         const dashboardData = await Student.aggregate([
//             // Stage 1: Match students with filters
//             {
//                 $match: studentMatchConditions
//             },
            
//             // Stage 2: Lookup school details from district_block_school collection
//             {
//                 $lookup: {
//                     from: "district_block_schools",
//                     localField: "schoolId",
//                     foreignField: "schoolId",
//                     as: "schoolDetails"
//                 }
//             },
            
//             // Stage 3: Unwind school details (since it's an array)
//             {
//                 $unwind: {
//                     path: "$schoolDetails",
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
            
//             // Stage 4: Apply district and block filters if provided
//             {
//                 $match: {
//                     ...(districtId && { "schoolDetails.districtId": districtId }),
//                     ...(blockId && { "schoolDetails.blockId": blockId })
//                 }
//             },
            
//             // Stage 5: Lookup copy checking records for each student
//             {
//                 $lookup: {
//                     from: "studentcopycheckings",
//                     let: { 
//                         studentId: "$_id",
//                         studentSchoolId: "$schoolId"
//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$unqStudentObjectId", "$$studentId"] },
//                                         { $eq: ["$schoolId", "$$studentSchoolId"] }
//                                     ]
//                                 },
//                                 ...copyCheckingDateMatch
//                             }
//                         }
//                     ],
//                     as: "copyCheckings"
//                 }
//             },
            
//             // Stage 6: Group by school and prepare statistics
//             {
//                 $group: {
//                     _id: {
//                         schoolId: "$schoolId",
//                         schoolName: "$schoolDetails.schoolName",
//                         districtId: "$schoolDetails.districtId",
//                         districtName: "$schoolDetails.districtName",
//                         blockId: "$schoolDetails.blockId",
//                         blockName: "$schoolDetails.blockName"
//                     },
//                     totalStudents: { $sum: 1 },
//                     studentsWithCopyCheckings: {
//                         $sum: {
//                             $cond: [{ $gt: [{ $size: "$copyCheckings" }, 0] }, 1, 0]
//                         }
//                     },
//                     studentsWithoutCopyCheckings: {
//                         $sum: {
//                             $cond: [{ $eq: [{ $size: "$copyCheckings" }, 0] }, 1, 0]
//                         }
//                     },
//                     allCopyCheckings: { $push: "$copyCheckings" }
//                 }
//             },
            
//             // Stage 7: Flatten the copy checkings array
//             {
//                 $addFields: {
//                     flattenedCopyCheckings: {
//                         $reduce: {
//                             input: "$allCopyCheckings",
//                             initialValue: [],
//                             in: { $concatArrays: ["$$value", "$$this"] }
//                         }
//                     }
//                 }
//             },
            
//             // Stage 8: Calculate comprehensive statistics
//             {
//                 $project: {
//                     schoolDetails: {
//                         schoolId: "$_id.schoolId",
//                         schoolName: "$_id.schoolName",
//                         districtId: "$_id.districtId",
//                         districtName: "$_id.districtName",
//                         blockId: "$_id.blockId",
//                         blockName: "$_id.blockName"
//                     },
//                     totalStudents: 1,
//                     studentsWithCopyCheckings: 1,
//                     studentsWithoutCopyCheckings: 1,
                    
//                     // Overall copy checking statistics
//                     overallStats: {
//                         totalRecords: { $size: "$flattenedCopyCheckings" },
                        
//                         // Type wise breakdown
//                         typeWise: {
//                             homeWork: {
//                                 total: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: { $eq: ["$$this.copyCheckingType", "Home Work"] }
//                                         }
//                                     }
//                                 },
//                                 complete: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$this.copyCheckingType", "Home Work"] },
//                                                     { $eq: ["$$this.status", "complete"] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 incomplete: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$this.copyCheckingType", "Home Work"] },
//                                                     { $eq: ["$$this.status", "incomplete"] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 unavailable: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$this.copyCheckingType", "Home Work"] },
//                                                     { $eq: ["$$this.status", "unavailable"] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 }
//                             },
//                             classWork: {
//                                 total: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: { $eq: ["$$this.copyCheckingType", "Class Work"] }
//                                         }
//                                     }
//                                 },
//                                 complete: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$this.copyCheckingType", "Class Work"] },
//                                                     { $eq: ["$$this.status", "complete"] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 incomplete: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$this.copyCheckingType", "Class Work"] },
//                                                     { $eq: ["$$this.status", "incomplete"] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 unavailable: {
//                                     $size: {
//                                         $filter: {
//                                             input: "$flattenedCopyCheckings",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$this.copyCheckingType", "Class Work"] },
//                                                     { $eq: ["$$this.status", "unavailable"] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         },
                        
//                         // Subject wise breakdown
//                         subjectWise: {
//                             $arrayToObject: {
//                                 $map: {
//                                     input: { $setUnion: ["$flattenedCopyCheckings.subject"] },
//                                     as: "subject",
//                                     in: {
//                                         k: "$$subject",
//                                         v: {
//                                             total: {
//                                                 $size: {
//                                                     $filter: {
//                                                         input: "$flattenedCopyCheckings",
//                                                         cond: { $eq: ["$$this.subject", "$$subject"] }
//                                                     }
//                                                 }
//                                             },
//                                             complete: {
//                                                 $size: {
//                                                     $filter: {
//                                                         input: "$flattenedCopyCheckings",
//                                                         cond: {
//                                                             $and: [
//                                                                 { $eq: ["$$this.subject", "$$subject"] },
//                                                                 { $eq: ["$$this.status", "complete"] }
//                                                             ]
//                                                         }
//                                                     }
//                                                 }
//                                             },
//                                             incomplete: {
//                                                 $size: {
//                                                     $filter: {
//                                                         input: "$flattenedCopyCheckings",
//                                                         cond: {
//                                                             $and: [
//                                                                 { $eq: ["$$this.subject", "$$subject"] },
//                                                                 { $eq: ["$$this.status", "incomplete"] }
//                                                             ]
//                                                         }
//                                                     }
//                                                 }
//                                             },
//                                             unavailable: {
//                                                 $size: {
//                                                     $filter: {
//                                                         input: "$flattenedCopyCheckings",
//                                                         cond: {
//                                                             $and: [
//                                                                 { $eq: ["$$this.subject", "$$subject"] },
//                                                                 { $eq: ["$$this.status", "unavailable"] }
//                                                             ]
//                                                         }
//                                                     }
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     },
                    
//                     // Recent submissions (last 10)
//                     recentSubmissions: {
//                         $slice: [
//                             {
//                                 $sortArray: {
//                                     input: "$flattenedCopyCheckings",
//                                     sortBy: { createdAt: -1 }
//                                 }
//                             },
//                             10
//                         ]
//                     },
                    
//                     // Completion rate percentage
//                     completionRate: {
//                         $cond: [
//                             { $eq: [{ $size: "$flattenedCopyCheckings" }, 0] },
//                             0,
//                             {
//                                 $multiply: [
//                                     {
//                                         $divide: [
//                                             {
//                                                 $size: {
//                                                     $filter: {
//                                                         input: "$flattenedCopyCheckings",
//                                                         cond: { $eq: ["$$this.status", "complete"] }
//                                                     }
//                                                 }
//                                             },
//                                             { $size: "$flattenedCopyCheckings" }
//                                         ]
//                                     },
//                                     100
//                                 ]
//                             }
//                         ]
//                     }
//                 }
//             }
//         ]);

//         // Calculate overall totals across all schools
//         const totalStats = {
//             totalSchools: dashboardData.length,
//             totalStudents: dashboardData.reduce((sum, school) => sum + school.totalStudents, 0),
//             totalCopyCheckings: dashboardData.reduce((sum, school) => sum + school.overallStats.totalRecords, 0),
//             totalHomeWork: dashboardData.reduce((sum, school) => sum + school.overallStats.typeWise.homeWork.total, 0),
//             totalClassWork: dashboardData.reduce((sum, school) => sum + school.overallStats.typeWise.classWork.total, 0),
//             overallCompletionRate: dashboardData.length > 0 
//                 ? dashboardData.reduce((sum, school) => sum + school.completionRate, 0) / dashboardData.length
//                 : 0
//         };

//         return res.status(200).json({
//             success: true,
//             message: "Dashboard data fetched successfully",
//             filters: {
//                 batch: batch || "All",
//                 date: date || "All",
//                 schoolId: schoolId || "All",
//                 districtId: districtId || "All",
//                 blockId: blockId || "All"
//             },
//             summary: totalStats,
//             schoolsData: dashboardData
//         });

//     } catch (error) {
//         console.error("Error in GetCopyCheckingDashboard:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };









// export const StudentCopyCheckinDashboard = async (req, res) => {
//     try {
//         const { batch, date, schoolId, districtId, blockId } = req.body;

//         // Build match conditions for students
//         const studentMatchConditions = {
//             isSlcTaken: false
//         };
        
//         if (batch) {
//             studentMatchConditions.batch = batch;
//         }
        
//         if (schoolId) {
//             studentMatchConditions.schoolId = schoolId;
//         }

//         // Build date filter for copy checking
//         let copyCheckingDateMatch = {};
//         if (date) {
//             const searchDate = new Date(date);
//             if (isNaN(searchDate.getTime())) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid date format"
//                 });
//             }
//             searchDate.setHours(0, 0, 0, 0);
//             const endOfDay = new Date(searchDate);
//             endOfDay.setHours(23, 59, 59, 999);
            
//             copyCheckingDateMatch = {
//                 date: {
//                     $gte: searchDate,
//                     $lte: endOfDay
//                 }
//             };
//         }

//         // First, get all schools that match district/block filters
//         let schoolQuery = {};
//         if (districtId) schoolQuery.districtId = districtId;
//         if (blockId) schoolQuery.blockId = blockId;
        
//         const allSchools = await District_Block_School.find(schoolQuery).lean();
        
//         if (allSchools.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 message: "No schools found",
//                 filters: { batch, date, schoolId, districtId, blockId },
//                 summary: {
//                     totalSchools: 0,
//                     totalStudents: 0,
//                     totalCopyCheckings: 0,
//                     totalHomeWork: 0,
//                     totalClassWork: 0,
//                     overallCompletionRate: 0
//                 },
//                 schoolsData: []
//             });
//         }

//         // Get student counts per school
//         const studentAggregation = await Student.aggregate([
//             { $match: studentMatchConditions },
//             {
//                 $group: {
//                     _id: "$schoolId",
//                     totalStudents: { $sum: 1 }
//                 }
//             }
//         ]);
        
//         const studentCountMap = {};
//         studentAggregation.forEach(item => {
//             studentCountMap[item._id] = item.totalStudents;
//         });

//         // Get copy checking statistics per school
//         const copyCheckingAggregation = await StudentCopyChecking.aggregate([
//             {
//                 $match: {
//                     ...(batch && { batch }),
//                     ...(schoolId && { schoolId }),
//                     ...copyCheckingDateMatch
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         schoolId: "$schoolId",
//                         subject: "$subject",
//                         copyCheckingType: "$copyCheckingType",
//                         status: "$status"
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         schoolId: "$_id.schoolId",
//                         subject: "$_id.subject",
//                         copyCheckingType: "$_id.copyCheckingType"
//                     },
//                     statuses: {
//                         $push: {
//                             status: "$_id.status",
//                             count: "$count"
//                         }
//                     },
//                     total: { $sum: "$count" }
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         schoolId: "$_id.schoolId",
//                         subject: "$_id.subject"
//                     },
//                     copyTypes: {
//                         $push: {
//                             type: "$_id.copyCheckingType",
//                             total: "$total",
//                             statuses: "$statuses"
//                         }
//                     },
//                     subjectTotal: { $sum: "$total" }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id.schoolId",
//                     subjects: {
//                         $push: {
//                             name: "$_id.subject",
//                             total: "$subjectTotal",
//                             copyTypes: "$copyTypes"
//                         }
//                     },
//                     schoolTotal: { $sum: "$subjectTotal" },
//                     homeWorkTotal: {
//                         $sum: {
//                             $sum: {
//                                 $map: {
//                                     input: {
//                                         $filter: {
//                                             input: "$copyTypes",
//                                             cond: { $eq: ["$$this.type", "Home Work"] }
//                                         }
//                                     },
//                                     as: "hw",
//                                     in: "$$hw.total"
//                                 }
//                             }
//                         }
//                     },
//                     classWorkTotal: {
//                         $sum: {
//                             $sum: {
//                                 $map: {
//                                     input: {
//                                         $filter: {
//                                             input: "$copyTypes",
//                                             cond: { $eq: ["$$this.type", "Class Work"] }
//                                         }
//                                     },
//                                     as: "cw",
//                                     in: "$$cw.total"
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         ]);
        
//         const copyCheckingMap = {};
//         copyCheckingAggregation.forEach(item => {
//             copyCheckingMap[item._id] = item;
//         });

//         // Build school-wise data
//         const schoolsData = [];
//         let totalStudentsAll = 0;
//         let totalCopyCheckingsAll = 0;
//         let totalHomeWorkAll = 0;
//         let totalClassWorkAll = 0;
        
//         for (const school of allSchools) {
//             const schoolIdStr = school.schoolId;
//             const studentCount = studentCountMap[schoolIdStr] || 0;
//             const copyData = copyCheckingMap[schoolIdStr];
            
//             if (studentCount === 0 && !copyData) {
//                 // School has no students in this batch, skip
//                 continue;
//             }
            
//             totalStudentsAll += studentCount;
//             totalCopyCheckingsAll += copyData?.schoolTotal || 0;
//             totalHomeWorkAll += copyData?.homeWorkTotal || 0;
//             totalClassWorkAll += copyData?.classWorkTotal || 0;
            
//             // Calculate subject-wise breakdown
//             const subjectWise = {};
//             if (copyData?.subjects) {
//                 copyData.subjects.forEach(subject => {
//                     const typeWise = {};
//                     subject.copyTypes.forEach(type => {
//                         const statusWise = {
//                             complete: 0,
//                             incomplete: 0,
//                             unavailable: 0
//                         };
//                         type.statuses.forEach(status => {
//                             if (status.status === "complete") statusWise.complete = status.count;
//                             else if (status.status === "incomplete") statusWise.incomplete = status.count;
//                             else if (status.status === "unavailable") statusWise.unavailable = status.count;
//                         });
//                         typeWise[type.type] = {
//                             total: type.total,
//                             ...statusWise
//                         };
//                     });
//                     subjectWise[subject.name] = {
//                         total: subject.total,
//                         ...typeWise
//                     };
//                 });
//             }
            
//             // Calculate type-wise totals
//             const homeWorkData = {
//                 total: copyData?.homeWorkTotal || 0,
//                 complete: 0,
//                 incomplete: 0,
//                 unavailable: 0
//             };
            
//             const classWorkData = {
//                 total: copyData?.classWorkTotal || 0,
//                 complete: 0,
//                 incomplete: 0,
//                 unavailable: 0
//             };
            
//             // Calculate status counts for each type
//             if (copyData?.subjects) {
//                 copyData.subjects.forEach(subject => {
//                     subject.copyTypes.forEach(type => {
//                         type.statuses.forEach(status => {
//                             if (type.type === "Home Work") {
//                                 if (status.status === "complete") homeWorkData.complete += status.count;
//                                 else if (status.status === "incomplete") homeWorkData.incomplete += status.count;
//                                 else if (status.status === "unavailable") homeWorkData.unavailable += status.count;
//                             } else if (type.type === "Class Work") {
//                                 if (status.status === "complete") classWorkData.complete += status.count;
//                                 else if (status.status === "incomplete") classWorkData.incomplete += status.count;
//                                 else if (status.status === "unavailable") classWorkData.unavailable += status.count;
//                             }
//                         });
//                     });
//                 });
//             }
            
//             const totalRecords = (copyData?.schoolTotal || 0);
//             const completedRecords = homeWorkData.complete + classWorkData.complete;
//             const completionRate = totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0;
            
//             schoolsData.push({
//                 schoolDetails: {
//                     schoolId: school.schoolId,
//                     schoolName: school.schoolName,
//                     districtId: school.districtId,
//                     districtName: school.districtName,
//                     blockId: school.blockId,
//                     blockName: school.blockName
//                 },
//                 totalStudents: studentCount,
//                 studentsWithCopyCheckings: 0, // Can be calculated if needed
//                 studentsWithoutCopyCheckings: 0,
//                 overallStats: {
//                     totalRecords: totalRecords,
//                     typeWise: {
//                         homeWork: homeWorkData,
//                         classWork: classWorkData
//                     },
//                     subjectWise: subjectWise
//                 },
//                 completionRate: completionRate
//             });
//         }
        
//         // Calculate students with/without copy checkings (simplified)
//         // This can be done with a separate aggregation if needed
        
//         const totalStats = {
//             totalSchools: schoolsData.length,
//             totalStudents: totalStudentsAll,
//             totalCopyCheckings: totalCopyCheckingsAll,
//             totalHomeWork: totalHomeWorkAll,
//             totalClassWork: totalClassWorkAll,
//             overallCompletionRate: schoolsData.length > 0 
//                 ? schoolsData.reduce((sum, school) => sum + school.completionRate, 0) / schoolsData.length
//                 : 0
//         };
        
//         // Prepare subject-wise aggregated data
//         const subjectAggregation = {};
//         schoolsData.forEach(school => {
//             Object.entries(school.overallStats.subjectWise || {}).forEach(([subject, data]) => {
//                 if (!subjectAggregation[subject]) {
//                     subjectAggregation[subject] = {
//                         total: 0,
//                         complete: 0,
//                         incomplete: 0,
//                         unavailable: 0,
//                         homeWorkTotal: 0,
//                         classWorkTotal: 0
//                     };
//                 }
//                 subjectAggregation[subject].total += data.total || 0;
//                 subjectAggregation[subject].complete += (data["Home Work"]?.complete || 0) + (data["Class Work"]?.complete || 0);
//                 subjectAggregation[subject].incomplete += (data["Home Work"]?.incomplete || 0) + (data["Class Work"]?.incomplete || 0);
//                 subjectAggregation[subject].unavailable += (data["Home Work"]?.unavailable || 0) + (data["Class Work"]?.unavailable || 0);
//                 subjectAggregation[subject].homeWorkTotal += data["Home Work"]?.total || 0;
//                 subjectAggregation[subject].classWorkTotal += data["Class Work"]?.total || 0;
//             });
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Dashboard data fetched successfully",
//             filters: {
//                 batch: batch || "All",
//                 date: date || "All",
//                 schoolId: schoolId || "All",
//                 districtId: districtId || "All",
//                 blockId: blockId || "All"
//             },
//             summary: totalStats,
//             schoolsData: schoolsData,
//             subjectWiseSummary: subjectAggregation
//         });

//     } catch (error) {
//         console.error("Error in StudentCopyCheckinDashboard:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };






export const StudentCopyCheckinDashboard = async (req, res) => {
    try {
        const { batch, date, schoolId, districtId, blockId } = req.body;

        // Build match conditions for students
        const studentMatchConditions = {
            isSlcTaken: false
        };
        
        if (batch) {
            studentMatchConditions.batch = batch;
        }
        
        if (schoolId) {
            studentMatchConditions.schoolId = schoolId;
        }

        // Build date filter for copy checking
        let copyCheckingDateMatch = {};
        if (date) {
            const searchDate = new Date(date);
            if (isNaN(searchDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format"
                });
            }
            searchDate.setHours(0, 0, 0, 0);
            const endOfDay = new Date(searchDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            copyCheckingDateMatch = {
                date: {
                    $gte: searchDate,
                    $lte: endOfDay
                }
            };
        }

        // First, get all schools that match district/block filters
        let schoolQuery = {};
        if (districtId) schoolQuery.districtId = districtId;
        if (blockId) schoolQuery.blockId = blockId;
        
        const allSchools = await District_Block_School.find(schoolQuery).lean();
        
        if (allSchools.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No schools found",
                filters: { batch, date, schoolId, districtId, blockId },
                summary: {
                    totalSchools: 0,
                    totalStudents: 0,
                    totalCopyCheckings: 0,
                    totalHomeWork: 0,
                    totalClassWork: 0,
                    overallCompletionRate: 0
                },
                schoolsData: []
            });
        }

        // Get student counts per school
        const studentAggregation = await Student.aggregate([
            { $match: studentMatchConditions },
            {
                $group: {
                    _id: "$schoolId",
                    totalStudents: { $sum: 1 }
                }
            }
        ]);
        
        const studentCountMap = {};
        studentAggregation.forEach(item => {
            studentCountMap[item._id] = item.totalStudents;
        });

        // Get copy checking statistics per school
        const copyCheckingAggregation = await StudentCopyChecking.aggregate([
            {
                $match: {
                    ...(batch && { batch }),
                    ...(schoolId && { schoolId }),
                    ...copyCheckingDateMatch
                }
            },
            {
                $group: {
                    _id: {
                        schoolId: "$schoolId",
                        subject: "$subject",
                        copyCheckingType: "$copyCheckingType",
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: {
                        schoolId: "$_id.schoolId",
                        subject: "$_id.subject",
                        copyCheckingType: "$_id.copyCheckingType"
                    },
                    statuses: {
                        $push: {
                            status: "$_id.status",
                            count: "$count"
                        }
                    },
                    total: { $sum: "$count" }
                }
            },
            {
                $group: {
                    _id: {
                        schoolId: "$_id.schoolId",
                        subject: "$_id.subject"
                    },
                    copyTypes: {
                        $push: {
                            type: "$_id.copyCheckingType",
                            total: "$total",
                            statuses: "$statuses"
                        }
                    },
                    subjectTotal: { $sum: "$total" }
                }
            },
            {
                $group: {
                    _id: "$_id.schoolId",
                    subjects: {
                        $push: {
                            name: "$_id.subject",
                            total: "$subjectTotal",
                            copyTypes: "$copyTypes"
                        }
                    },
                    schoolTotal: { $sum: "$subjectTotal" },
                    homeWorkTotal: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: "$copyTypes",
                                            cond: { $eq: ["$$this.type", "Home Work"] }
                                        }
                                    },
                                    as: "hw",
                                    in: "$$hw.total"
                                }
                            }
                        }
                    },
                    classWorkTotal: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: "$copyTypes",
                                            cond: { $eq: ["$$this.type", "Class Work"] }
                                        }
                                    },
                                    as: "cw",
                                    in: "$$cw.total"
                                }
                            }
                        }
                    }
                }
            }
        ]);
        
        const copyCheckingMap = {};
        copyCheckingAggregation.forEach(item => {
            copyCheckingMap[item._id] = item;
        });

        // Build school-wise data
        const schoolsData = [];
        let totalStudentsAll = 0;
        let totalCopyCheckingsAll = 0;
        let totalHomeWorkAll = 0;
        let totalClassWorkAll = 0;
        
        for (const school of allSchools) {
            const schoolIdStr = school.schoolId;
            const studentCount = studentCountMap[schoolIdStr] || 0;
            const copyData = copyCheckingMap[schoolIdStr];
            
            if (studentCount === 0 && !copyData) {
                // School has no students in this batch, skip
                continue;
            }
            
            totalStudentsAll += studentCount;
            totalCopyCheckingsAll += copyData?.schoolTotal || 0;
            totalHomeWorkAll += copyData?.homeWorkTotal || 0;
            totalClassWorkAll += copyData?.classWorkTotal || 0;
            
            // Calculate subject-wise breakdown
            const subjectWise = {};
            if (copyData?.subjects) {
                copyData.subjects.forEach(subject => {
                    const typeWise = {};
                    subject.copyTypes.forEach(type => {
                        const statusWise = {
                            complete: 0,
                            incomplete: 0,
                            unavailable: 0
                        };
                        type.statuses.forEach(status => {
                            // Case-insensitive status comparison
                            const statusLower = status.status?.toLowerCase();
                            if (statusLower === "complete") statusWise.complete = status.count;
                            else if (statusLower === "incomplete") statusWise.incomplete = status.count;
                            else if (statusLower === "unavailable") statusWise.unavailable = status.count;
                        });
                        typeWise[type.type] = {
                            total: type.total,
                            ...statusWise
                        };
                    });
                    subjectWise[subject.name] = {
                        total: subject.total,
                        ...typeWise
                    };
                });
            }
            
            // Calculate type-wise totals
            const homeWorkData = {
                total: copyData?.homeWorkTotal || 0,
                complete: 0,
                incomplete: 0,
                unavailable: 0
            };
            
            const classWorkData = {
                total: copyData?.classWorkTotal || 0,
                complete: 0,
                incomplete: 0,
                unavailable: 0
            };
            
            // Calculate status counts for each type with case-insensitive comparison
            if (copyData?.subjects) {
                copyData.subjects.forEach(subject => {
                    subject.copyTypes.forEach(type => {
                        type.statuses.forEach(status => {
                            const statusLower = status.status?.toLowerCase();
                            if (type.type === "Home Work") {
                                if (statusLower === "complete") homeWorkData.complete += status.count;
                                else if (statusLower === "incomplete") homeWorkData.incomplete += status.count;
                                else if (statusLower === "unavailable") homeWorkData.unavailable += status.count;
                            } else if (type.type === "Class Work") {
                                if (statusLower === "complete") classWorkData.complete += status.count;
                                else if (statusLower === "incomplete") classWorkData.incomplete += status.count;
                                else if (statusLower === "unavailable") classWorkData.unavailable += status.count;
                            }
                        });
                    });
                });
            }
            
            const totalRecords = (copyData?.schoolTotal || 0);
            const completedRecords = homeWorkData.complete + classWorkData.complete;
            const completionRate = totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0;
            
            schoolsData.push({
                schoolDetails: {
                    schoolId: school.schoolId,
                    schoolName: school.schoolName,
                    districtId: school.districtId,
                    districtName: school.districtName,
                    blockId: school.blockId,
                    blockName: school.blockName
                },
                totalStudents: studentCount,
                studentsWithCopyCheckings: 0,
                studentsWithoutCopyCheckings: 0,
                overallStats: {
                    totalRecords: totalRecords,
                    typeWise: {
                        homeWork: homeWorkData,
                        classWork: classWorkData
                    },
                    subjectWise: subjectWise
                },
                completionRate: completionRate
            });
        }
        
        const totalStats = {
            totalSchools: schoolsData.length,
            totalStudents: totalStudentsAll,
            totalCopyCheckings: totalCopyCheckingsAll,
            totalHomeWork: totalHomeWorkAll,
            totalClassWork: totalClassWorkAll,
            overallCompletionRate: schoolsData.length > 0 
                ? schoolsData.reduce((sum, school) => sum + school.completionRate, 0) / schoolsData.length
                : 0
        };
        
        // Prepare subject-wise aggregated data with case-insensitive handling
        const subjectAggregation = {};
        schoolsData.forEach(school => {
            Object.entries(school.overallStats.subjectWise || {}).forEach(([subject, data]) => {
                if (!subjectAggregation[subject]) {
                    subjectAggregation[subject] = {
                        total: 0,
                        complete: 0,
                        incomplete: 0,
                        unavailable: 0,
                        homeWorkTotal: 0,
                        classWorkTotal: 0
                    };
                }
                subjectAggregation[subject].total += data.total || 0;
                subjectAggregation[subject].complete += (data["Home Work"]?.complete || 0) + (data["Class Work"]?.complete || 0);
                subjectAggregation[subject].incomplete += (data["Home Work"]?.incomplete || 0) + (data["Class Work"]?.incomplete || 0);
                subjectAggregation[subject].unavailable += (data["Home Work"]?.unavailable || 0) + (data["Class Work"]?.unavailable || 0);
                subjectAggregation[subject].homeWorkTotal += data["Home Work"]?.total || 0;
                subjectAggregation[subject].classWorkTotal += data["Class Work"]?.total || 0;
            });
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            filters: {
                batch: batch || "All",
                date: date || "All",
                schoolId: schoolId || "All",
                districtId: districtId || "All",
                blockId: blockId || "All"
            },
            summary: totalStats,
            schoolsData: schoolsData,
            subjectWiseSummary: subjectAggregation
        });

    } catch (error) {
        console.error("Error in StudentCopyCheckinDashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};