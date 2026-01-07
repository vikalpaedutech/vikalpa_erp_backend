// //This will be used to verify TA of students...

// import mongoose from "mongoose";

// import { Student } from "../models/student.model.js";
// import { StudentAttendance } from "../models/studentAttendance.model.js";




// export const GetStudentAttendanceDashboard = async (req, res) =>{



//     try {
        
//     } catch (error) {
        
//     }


// }







// This will be used to verify TA of students...

import mongoose from "mongoose";
import { Student } from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";
import { TaStudent } from "../models/TaVerification.model.js";

// export const GetStudentAttendanceDashboard = async (req, res) => {
//   try {
//     // const { startDate, endDate, page = 1, limit = 50 } = req.query;

    

//     // 1️⃣ Validate dates
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "startDate and endDate are required"
//       });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     // include full end day
//     end.setHours(23, 59, 59, 999);

//     const skip = (Number(page) - 1) * Number(limit);

//     // 2️⃣ Aggregation Pipeline
//     const pipeline = [
//       // 🔥 MATCH FIRST (VERY IMPORTANT FOR PERFORMANCE)
//       {
//         $match: {
//           date: {
//             $gte: start,
//             $lte: end
//           }
//         }
//       },

//       // 🔗 Join with students
//       {
//         $lookup: {
//           from: "students", // MongoDB collection name
//           localField: "unqStudentObjectId",
//           foreignField: "_id",
//           as: "studentDetails"
//         }
//       },

//       {
//         $unwind: {
//           path: "$studentDetails",
//           preserveNullAndEmptyArrays: true
//         }
//       },

//       // 📤 Final shape for dashboard / TA verification
//       {
//         $project: {
//           _id: 1,
//           date: 1,
//           status: 1,
//           TA: 1,
//           isAttendanceMarked: 1,
//           absenteeCallingStatus: 1,
//           comments: 1,

//           studentSrn: 1,

//           // student info
//           studentName: "$studentDetails.name",
//           class: "$studentDetails.class",
//           section: "$studentDetails.section",
//           rollNo: "$studentDetails.rollNo"
//         }
//       },

//       // 📄 Pagination
//       { $sort: { date: 1 } },
//       { $skip: skip },
//       { $limit: Number(limit) }
//     ];

//     const data = await StudentAttendance.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       page: Number(page),
//       limit: Number(limit),
//       count: data.length,
//       data
//     });

//   } catch (error) {
//     console.error("GetStudentAttendanceDashboard Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };




// export const GetStudentAttendanceDashboard = async (req, res) => {


//     console.log("Hello world")

//   try {
//     // 🔒 STATIC DATES FOR TESTING
//     const start = new Date("2025-10-01T00:00:00.000+00:00");
//     const end = new Date("2025-12-31T23:59:59.999+00:00");

//     // Optional pagination (static for now)
//     const page = 1;
//     const limit = 50;
//     const skip = (page - 1) * limit;

//     const pipeline = [
//       {
//         $match: {
//           date: {
//             $gte: start,
//             $lte: end
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: "students",
//           localField: "unqStudentObjectId",
//           foreignField: "_id",
//           as: "studentDetails"
//         }
//       },
//       {
//         $unwind: {
//           path: "$studentDetails",
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           date: 1,
//           status: 1,
//           TA: 1,
//           isAttendanceMarked: 1,
//           absenteeCallingStatus: 1,
//           comments: 1,
//           studentSrn: 1,

//           studentName: "$studentDetails.firstName",
//           class: "$studentDetails.classofStudent",
        
//           rollNo: "$studentDetails.studentSrn",
//           center: "$studentDetails.schoolId",
//           district: "$studentDetails.districtId",
//         }
//       },
//       { $sort: { date: 1 } },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     const data = await StudentAttendance.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       range: {
//         from: start,
//         to: end
//       },
//       count: data.length,
//       data
//     });

//   } catch (error) {
//     console.error("GetStudentAttendanceDashboard Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };








// export const GetStudentAttendanceDashboard = async (req, res) => {

//   console.log("Hello world");

//   try {
//     // 🔒 STATIC DATES FOR TESTING
//     const start = new Date("2025-10-01T00:00:00.000+00:00");
//     const end = new Date("2025-12-31T23:59:59.999+00:00");

//     // 📥 DATA FROM FRONTEND
//     const { classIds = [], schoolIds = [] } = req.body;
    
//     console.log(req.body)

//     // Optional pagination
//     const page = 1;
//     const limit = 10000;
//     const skip = (page - 1) * limit;

//     const pipeline = [
//       // 1️⃣ DATE FILTER (FAST – USES INDEX)
//       {
//         $match: {
//           date: {
//             $gte: start,
//             $lte: end
//           }
//         }
//       },

//       // 2️⃣ JOIN WITH STUDENTS
//       {
//         $lookup: {
//           from: "students",
//           localField: "unqStudentObjectId",
//           foreignField: "_id",
//           as: "studentDetails"
//         }
//       },

//       {
//         $unwind: {
//           path: "$studentDetails",
//           preserveNullAndEmptyArrays: false // ❗ ignore missing students
//         }
//       },

//       // 3️⃣ FILTER USING STUDENTS COLLECTION FIELDS
//       {
//         $match: {
//           ...(classIds.length && {
//             "studentDetails.classofStudent": { $in: classIds }
//           }),
//           ...(schoolIds.length && {
//             "studentDetails.schoolId": { $in: schoolIds }
//           })
//         }
//       },

//       // 4️⃣ FINAL RESPONSE SHAPE
//       {
//         $project: {
//           _id: 1,
//           date: 1,
//           status: 1,
//           TA: 1,
//           isAttendanceMarked: 1,
//           absenteeCallingStatus: 1,
//           comments: 1,

//           studentSrn: "$studentDetails.studentSrn",
//           studentName: "$studentDetails.firstName",
//           class: "$studentDetails.classofStudent",
//           rollNo: "$studentDetails.rollNumber",

//           center: "$studentDetails.schoolId",
//           district: "$studentDetails.districtId"
//         }
//       },

//       // 5️⃣ SORT + PAGINATION
//       { $sort: { date: 1 } },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     const data = await StudentAttendance.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       filters: {
//         dateRange: { from: start, to: end },
//         classIds,
//         schoolIds
//       },
//       count: data.length,
//       data
//     });

//   } catch (error) {
//     console.error("GetStudentAttendanceDashboard Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };







export const GetStudentAttendanceDashboard = async (req, res) => {
  console.log("Hello world");

  try {
    // 📥 DATA FROM FRONTEND
    const {
      classIds = [],
      schoolIds = [],
      month,
      year
    } = req.body;

    console.log("REQ BODY 👉", req.body);

    // ❗ Validate month & year
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required"
      });
    }

    // 🧠 Convert month name → month index
    const monthIndexMap = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11
    };

    const monthIndex = monthIndexMap[month.toLowerCase()];

    if (monthIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid month name"
      });
    }

    // 📅 AUTO-GENERATE START & END DATE
    const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    // Optional pagination (kept large intentionally)
    const page = 1;
    const limit = 10000;
    const skip = (page - 1) * limit;

    const pipeline = [
      // 1️⃣ DATE FILTER (FASTEST FILTER)
      {
        $match: {
          date: {
            $gte: start,
            $lte: end
          }
        }
      },

      // 2️⃣ JOIN WITH STUDENTS
      {
        $lookup: {
          from: "students",
          localField: "unqStudentObjectId",
          foreignField: "_id",
          as: "studentDetails"
        }
      },

      {
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: false
        }
      },

      // 3️⃣ FILTER BY CLASS & SCHOOL (FROM STUDENTS)
      {
        $match: {
          ...(classIds.length && {
            "studentDetails.classofStudent": { $in: classIds }
          }),
          ...(schoolIds.length && {
            "studentDetails.schoolId": { $in: schoolIds }
          })
        }
      },

      // 4️⃣ RESPONSE SHAPE (OPTIMIZED)
      {
        $project: {
          _id: 1,
          date: 1,
          status: 1,
          TA: 1,
          isAttendanceMarked: 1,
          absenteeCallingStatus: 1,
          comments: 1,

          studentSrn: "$studentDetails.studentSrn",
          studentName: "$studentDetails.firstName",
          class: "$studentDetails.classofStudent",
          fatherName: "$studentDetails.fatherName",
          center: "$studentDetails.schoolId",
          district: "$studentDetails.districtId"
        }
      },

      { $sort: { date: 1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const data = await TaStudent.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      filters: {
        month,
        year,
        startDate: start,
        endDate: end,
        classIds,
        schoolIds
      },
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GetStudentAttendanceDashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};




// export const UpdateTaAttendance = async (req, res) => {




//     try {
//         const { _id, status, userId, userName, reason } = req.body;

//         console.log(req.body)

//         // Validate required fields
//         if (!_id) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Attendance ID (_id) is required"
//             });
//         }

//         if (!status || (status !== "Present" && status !== "Absent")) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid status (Present/Absent) is required"
//             });
//         }

//         if (!userId || !userName) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User information (userId, userName) is required"
//             });
//         }

//         // Find the attendance record
//         const attendanceRecord = await TaStudent.findById(_id);

//         console.log(attendanceRecord)
        
//         if (!attendanceRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Attendance record not found"
//             });
//         }

//         // Store previous status
//         const previousStatus = attendanceRecord.status;
        
//         // // Check if status is actually changing
//         // if (previousStatus === status) {
//         //     return res.status(200).json({
//         //         success: false,
//         //         message: `Status is already "${status}"`,
//         //         data: attendanceRecord
//         //     });
//         // }

//         // // Create audit log entry
//         // const auditEntry = {
//         //     previousStatus: previousStatus,
//         //     newStatus: status,
//         //     // changedBy: userId,
//         //     // changedByName: userName,
//         //     // reason: reason || "No reason provided",
//         //     timestamp: new Date()
//         // };

//         // Prepare update object
//         const updateData = {
//             status: status,
//             updatedAt: new Date()
//         };

//         // // Add originalStatus if it doesn't exist (first time modification)
//         // if (!attendanceRecord.originalStatus) {
//         //     updateData.originalStatus = previousStatus;
//         // }

//         // // Add TA verification fields
//         // updateData.isVerifiedByTA = true;
//         // updateData.verifiedByTAId = userId;
//         // updateData.verifiedByTAName = userName;
//         // updateData.verifiedAt = new Date();

//         // // Add audit log (create if doesn't exist, push if exists)
//         // if (!attendanceRecord.auditLog) {
//         //     updateData.auditLog = [auditEntry];
//         // } else {
//         //     updateData.$push = { auditLog: auditEntry };
//         // }

//         // Update the record
//         const updatedRecord = await TaStudent.findByIdAndUpdate(
//             _id,
//             updateData,
//             { new: true, runValidators: true }
//         );

//         console.log(updatedRecord)

//         return res.status(200).json({
//             success: true,
//             message: `Attendance updated from "${previousStatus}" to "${status}"`,
//             data: updatedRecord
//         });

//     } catch (error) {
//         console.error("Error updating TA attendance:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };














export const UpdateTaAttendance = async (req, res) => {
    try {
        const { _id, status } = req.body;

        console.log("Request Body:", req.body);

        // Validate required fields
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Attendance ID (_id) is required"
            });
        }

        if (!status || (status !== "Present" && status !== "Absent")) {
            return res.status(400).json({
                success: false,
                message: "Valid status (Present/Absent) is required"
            });
        }

        // Find and update the attendance record
        const updatedRecord = await TaStudent.findByIdAndUpdate(
            _id,
            {
                status: status,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        console.log("Updated Record:", updatedRecord);

        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Attendance updated`,
            data: updatedRecord
        });

    } catch (error) {
        console.error("Error updating TA attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};