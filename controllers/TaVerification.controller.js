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
//   console.log("Hello world");

//   try {
//     // 📥 DATA FROM FRONTEND
//     const {
//       classIds = [],
//       schoolIds = [],
//       month,
//       year
//     } = req.body;

//     console.log("REQ BODY 👉", req.body);

//     // ❗ Validate month & year
//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "month and year are required"
//       });
//     }

//     // 🧠 Convert month name → month index
//     const monthIndexMap = {
//       january: 0,
//       february: 1,
//       march: 2,
//       april: 3,
//       may: 4,
//       june: 5,
//       july: 6,
//       august: 7,
//       september: 8,
//       october: 9,
//       november: 10,
//       december: 11
//     };

//     const monthIndex = monthIndexMap[month.toLowerCase()];

//     if (monthIndex === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid month name"
//       });
//     }

//     // 📅 AUTO-GENERATE START & END DATE
//     const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
//     const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

//     // Optional pagination (kept large intentionally)
//     const page = 1;
//     const limit = 10000;
//     const skip = (page - 1) * limit;

//     const pipeline = [
//       // 1️⃣ DATE FILTER (FASTEST FILTER)
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
//           preserveNullAndEmptyArrays: false
//         }
//       },

//       // 3️⃣ FILTER BY CLASS & SCHOOL (FROM STUDENTS)
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

//       // 4️⃣ RESPONSE SHAPE (OPTIMIZED)
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
//           fatherName: "$studentDetails.fatherName",
//           center: "$studentDetails.schoolId",
//           district: "$studentDetails.districtId"
//         }
//       },

//       { $sort: { date: 1 } },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     const data = await TaStudent.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       filters: {
//         month,
//         year,
//         startDate: start,
//         endDate: end,
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

      // 4️⃣ RESPONSE SHAPE (OPTIMIZED) - ADDED singleSideDistance AND bothSideDistance
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
          district: "$studentDetails.districtId",
          
          // 🆕 NEW FIELDS ADDED HERE
          singleSideDistance: "$studentDetails.singleSideDistance",
          bothSideDistance: "$studentDetails.bothSideDistance"
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
//         const { _id, status } = req.body;

//         console.log("Request Body:", req.body);

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

//         // Find and update the attendance record
//         const updatedRecord = await TaStudent.findByIdAndUpdate(
//             _id,
//             {
//                 status: status,
//                 updatedAt: new Date()
//             },
//             { new: true, runValidators: true }
//         );

//         console.log("Updated Record:", updatedRecord);

//         if (!updatedRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Attendance record not found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: `Attendance updated`,
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
        const { _id, status, singleSideDistance, bothSideDistance, studentSrn } = req.body;

        console.log("Request Body:", req.body);

        // Validate required fields
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Attendance ID (_id) is required"
            });
        }

        // Find the attendance record first
        const attendanceRecord = await TaStudent.findById(_id);
        
        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        // Prepare update object for attendance
        const attendanceUpdateData = {
            updatedAt: new Date()
        };
        
        // Only update status if provided
        if (status && (status === "Present" || status === "Absent")) {
            attendanceUpdateData.status = status;
        }

        // Update the attendance record
        const updatedRecord = await TaStudent.findByIdAndUpdate(
            _id,
            attendanceUpdateData,
            { new: true, runValidators: true }
        );

        console.log("Updated Attendance Record:", updatedRecord);

        // If distance fields are provided, update in students collection using studentSrn
        if ((singleSideDistance !== undefined || bothSideDistance !== undefined)) {
            
            // Get studentSrn from either request body or attendance record
            const studentSrnToUse = studentSrn || attendanceRecord.studentSrn;
            
            if (!studentSrnToUse) {
                return res.status(400).json({
                    success: false,
                    message: "Student SRN is required for distance update"
                });
            }
            
            // Prepare update object for student
            const studentUpdateData = {};
            
            if (singleSideDistance !== undefined) {
                studentUpdateData.singleSideDistance = singleSideDistance;
            }
            
            if (bothSideDistance !== undefined) {
                studentUpdateData.bothSideDistance = bothSideDistance;
            }
            
            // Add updatedAt timestamp
            studentUpdateData.updatedAt = new Date();

            // Update the student document using studentSrn instead of _id
            const updatedStudent = await Student.findOneAndUpdate(
                { studentSrn: studentSrnToUse },
                studentUpdateData,
                { new: true, runValidators: true }
            );

            if (!updatedStudent) {
                console.log(`Student with SRN ${studentSrnToUse} not found`);
                return res.status(404).json({
                    success: false,
                    message: `Student with SRN ${studentSrnToUse} not found`
                });
            }

            console.log("Updated Student Distances:", updatedStudent);

            return res.status(200).json({
                success: true,
                message: `Attendance and distances updated successfully`,
                data: {
                    attendance: updatedRecord,
                    student: updatedStudent
                }
            });
        }

        // If no distance fields were provided, just return the updated attendance
        return res.status(200).json({
            success: true,
            message: `Attendance updated successfully`,
            data: {
                attendance: updatedRecord
            }
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