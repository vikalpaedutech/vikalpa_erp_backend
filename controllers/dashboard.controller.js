// /BACKEND/controllers/dashboard.controller.js

import { StudentAttendance } from "../models/studentAttendance.model.js"
import { Student } from "../models/student.model.js";
import mongoose from "mongoose";
import { District_Block_School } from "../models/district_block_buniyaadCenters.model.js";

import {AttendancePdf} from "../models/UploadAttendancePdf.model.js"
//Attendance count api.


export const studentAndAttendanceAndAbsenteeCallingCount = async (req, res) => {
  console.log(' i am inside studentAndAttendanceCount controller')
  try {
    const {
      schoolIds,
      classFilters, // optionally send from frontend
      startDate,
      endDate,
      date
    } = req.body;

    console.log(req.body)
    console.log(startDate)
    console.log(endDate)

    const targetStartDate = new Date(startDate);
    targetStartDate.setHours(0, 0, 0, 0);
    const targetEndDate = new Date(endDate);
    targetEndDate.setHours(0, 0, 0, 0);
    targetEndDate.setDate(targetEndDate.getDate() + 1);

    const response = await Student.aggregate([
      {
        $match: {
          schoolId: { $in: schoolIds },
          classofStudent: { $in: classFilters }
        }
      },
      {
        $lookup: {
          from: "district_block_schools",
          localField: "schoolId",
          foreignField: "centerId",
          as: "schoolDetails"
        }
      },
      { $unwind: "$schoolDetails" },
      {
        $lookup: {
          from: "studentattendances",
          let: { srn: "$studentSrn" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$studentSrn", "$$srn"] },
                    { $gte: ["$date", targetStartDate] },
                    { $lt: ["$date", targetEndDate] }
                  ]
                }
              }
            }
          ],
          as: "attendanceDocs"
        }
      },
      { $unwind: { path: "$attendanceDocs", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            schoolId: "$schoolId",
            classofStudent: "$classofStudent",
            date: "$attendanceDocs.date"
          },
          schoolName: { $first: "$schoolDetails.centerName" },
          districtName: { $first: "$schoolDetails.districtName" },
          blockName: { $first: "$schoolDetails.blockName" },
          totalStudents: {
            $sum: {
              $cond: [{ $eq: ["$isSlcTaken", false] }, 1, 0]
            }
          },
          totalSlcTaken: {
            $sum: {
              $cond: [{ $eq: ["$isSlcTaken", true] }, 1, 0]
            }
          },
          present: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isSlcTaken", false] },
                    { $eq: ["$attendanceDocs.status", "Present"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          absent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isSlcTaken", false] },
                    { $eq: ["$attendanceDocs.status", "Absent"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          connectedCount: {
            $sum: {
              $cond: [
                { $eq: ["$attendanceDocs.absenteeCallingStatus", "Connected"] },
                1,
                0
              ]
            }
          },
          notConnectedCount: {
            $sum: {
              $cond: [
                { $eq: ["$attendanceDocs.absenteeCallingStatus", "Not-Connected"] },
                1,
                0
              ]
            }
          },
          notCalledCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isSlcTaken", false] },
                    { $eq: ["$attendanceDocs.status", "Absent"] },
                    { $eq: ["$attendanceDocs.absenteeCallingStatus", "Not-called"] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          totalAbsenteeCallings: "$absent"
        }
      },
      {
        $group: {
          _id: {
            schoolId: "$_id.schoolId",
            date: "$_id.date"
          },
          schoolName: { $first: "$schoolName" },
          districtName: { $first: "$districtName" },
          blockName: { $first: "$blockName" },
          date: { $first: "$_id.date" },
          classes: {
            $push: {
              classofStudent: "$_id.classofStudent",
              totalStudents: "$totalStudents",
              totalSlcTaken: "$totalSlcTaken",
              present: "$present",
              absent: "$absent",
              totalAbsenteeCallings: "$totalAbsenteeCallings",
              connectedCount: "$connectedCount",
              notConnectedCount: "$notConnectedCount",
              notCalledCount: "$notCalledCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          schoolId: "$_id.schoolId",
          date: 1,
          schoolName: 1,
          districtName: 1,
          blockName: 1,
          classes: 1
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);

    console.log(`Fetched ${response.length} grouped results across dates`);
    // response.forEach(r => console.log("Date:", r.date?.toISOString?.().split("T")[0]));

    res.status(200).json({
      status: "Count Fetched",
      data: response
    });
  } catch (error) {
    console.error("Error in studentAndAttendanceAndAbsenteeCallingCount:", error);
    res.status(500).json({
      status: "Failed",
      message: error.message
    });
  }
};




// Attendance pdf api. Get counts by class and per date
export const attendancePdfUploadStatusCountByClass = async (req, res) => {
  console.log('Inside attendancePdfUploadStatusCountByClass controller');
  try {
    const { schoolIds, startDate, endDate } = req.body;

    if (!schoolIds || !startDate || !endDate) {
      return res.status(400).json({
        status: 'Failed',
        message: 'schoolIds, startDate and endDate are required',
      });
    }

    const targetStartDate = new Date(startDate);
    targetStartDate.setHours(0, 0, 0, 0);

    const targetEndDate = new Date(endDate);
    targetEndDate.setHours(0, 0, 0, 0);

    const results = [];

    // Loop through each date in the range
    for (
      let currentDate = new Date(targetStartDate);
      currentDate <= targetEndDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(0, 0, 0, 0);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dailyResult = await AttendancePdf.aggregate([
        {
          $match: {
            schoolId: { $in: schoolIds },
            dateOfUpload: {
              $gte: dayStart,
              $lt: dayEnd,
            },
          },
        },
        {
          $group: {
            _id: {
              schoolId: "$schoolId",
              classofStudent: "$classofStudent",
            },
            schoolName: { $first: "$schoolName" },
            pdfUploadedCount: {
              $sum: {
                $cond: [{ $eq: ["$isPdfUploaded", true] }, 1, 0]
              }
            },
            pdfNotUploadedCount: {
              $sum: {
                $cond: [{ $eq: ["$isPdfUploaded", false] }, 1, 0]
              }
            }
          }
        },
        {
          $group: {
            _id: "$_id.schoolId",
            schoolName: { $first: "$schoolName" },
            classes: {
              $push: {
                classofStudent: "$_id.classofStudent",
                pdfUploadedCount: "$pdfUploadedCount",
                pdfNotUploadedCount: "$pdfNotUploadedCount"
              }
            }
          }
        },
        {
          $lookup: {
            from: "district_block_schools",
            localField: "_id",
            foreignField: "centerId",
            as: "schoolDetails"
          }
        },
        {
          $unwind: {
            path: "$schoolDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            schoolId: "$_id",
            schoolName: 1,
            districtName: "$schoolDetails.districtName",
            blockName: "$schoolDetails.blockName",
            date: dayStart,
            classes: 1
          }
        }
      ]);

      results.push(...dailyResult);
    }

    console.log(`Fetched ${results.length} grouped results across dates`);

    res.status(200).json({
      status: "PDF Upload Count By Class and Date Fetched",
      data: results,
    });
  } catch (error) {
    console.error("Error in attendancePdfUploadStatusCountByClass:", error);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};










//--------------------------------------------------------







//New APIS

// 1️⃣ API: Total Student Count by Class (isSlcTaken = false)
export const getStudentCountsByClass = async (req, res) => {
  try {
    const result = await Student.aggregate([
      {
        $match: { isSlcTaken: false, classofStudent: { $in: ["9", "10"] } }
      },
      {
        $group: {
          _id: "$classofStudent",
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      studentCountIn9th: 0,
      studentCountIn10th: 0
    };

    result.forEach(item => {
      if (item._id === "9") counts.studentCountIn9th = item.count;
      if (item._id === "10") counts.studentCountIn10th = item.count;
    });

    res.status(200).json({ status: "Success", data: counts });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// 2️⃣ API: Attendance Summary for Today by Class
export const getTodayAttendanceSummaryByClass = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const result = await Student.aggregate([
      {
        $match: {
          classofStudent: { $in: ["9", "10"] },
          isSlcTaken: false
        }
      },
      {
        $lookup: {
          from: "studentattendances",
          localField: "studentSrn",
          foreignField: "studentSrn",
          pipeline: [
            {
              $match: {
                date: { $gte: today, $lt: nextDay }
              }
            }
          ],
          as: "attendance"
        }
      },
      {
        $project: {
          classofStudent: 1,
          status: { $arrayElemAt: ["$attendance.attendance", 0] }
        }
      },
      {
        $group: {
          _id: {
            class: "$classofStudent",
            status: "$status"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      TotalPresentIn9th: 0,
      TotalAbsentIn9th: 0,
      TotalPresentIn10th: 0,
      TotalAbsentIn10th: 0
    };

    result.forEach(item => {
      if (item._id.class === "9" && item._id.status === "Present")
        summary.TotalPresentIn9th = item.count;
      if (item._id.class === "9" && item._id.status === "Absent")
        summary.TotalAbsentIn9th = item.count;
      if (item._id.class === "10" && item._id.status === "Present")
        summary.TotalPresentIn10th = item.count;
      if (item._id.class === "10" && item._id.status === "Absent")
        summary.TotalAbsentIn10th = item.count;
    });

    res.status(200).json({ status: "Success", data: summary });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// 3️⃣ API: Absentee Calling Summary by Class
export const getAbsenteeCallingSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const result = await Student.aggregate([
      {
        $match: {
          classofStudent: { $in: ["9", "10"] },
          isSlcTaken: false
        }
      },
      {
        $lookup: {
          from: "studentattendances",
          localField: "studentSrn",
          foreignField: "studentSrn",
          pipeline: [
            {
              $match: {
                date: { $gte: today, $lt: nextDay },
                attendance: "Absent"
              }
            }
          ],
          as: "attendance"
        }
      },
      {
        $project: {
          classofStudent: 1,
          absenteeCallingStatus: {
            $arrayElemAt: ["$attendance.absenteeCallingStatus", 0]
          }
        }
      },
      {
        $group: {
          _id: {
            class: "$classofStudent",
            status: "$absenteeCallingStatus"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const callingSummary = {
      totalAbsentIn9th: 0,
      notCalledIn9th: 0,
      ConnectedIn9th: 0,
      "Not-ConnectedIn9th": 0,
      totalAbsentIn10th: 0,
      notCalledIn10th: 0,
      ConnectedIn10th: 0,
      "Not-ConnectedIn10th": 0
    };

    result.forEach(item => {
      const cls = item._id.class;
      const status = item._id.status || "Not-called";

      if (cls === "9") {
        callingSummary.totalAbsentIn9th++;
        if (status === "Not-called") callingSummary.notCalledIn9th++;
        if (status === "Connected") callingSummary.ConnectedIn9th++;
        if (status === "Not-Connected") callingSummary["Not-ConnectedIn9th"]++;
      }

      if (cls === "10") {
        callingSummary.totalAbsentIn10th++;
        if (status === "Not-called") callingSummary.notCalledIn10th++;
        if (status === "Connected") callingSummary.ConnectedIn10th++;
        if (status === "Not-Connected") callingSummary["Not-ConnectedIn10th"]++;
      }
    });

    res.status(200).json({ status: "Success", data: callingSummary });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};


//V2 API

// export const PresentAbsentCallingDashboard = async (req, res) => {
//   console.log('Hello count')
//   try {
//     const result = await Student.aggregate([
//       // 1️⃣ Only students whose SLC is not taken
//       { $match: { isSlcTaken: false } },

//       // 2️⃣ Lookup school info from district_block_schools
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: { schoolId: "$schoolId", districtId: "$districtId", blockId: "$blockId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$centerId", "$$schoolId"] },
//                     { $eq: ["$districtId", "$$districtId"] },
//                     { $eq: ["$blockId", "$$blockId"] },
//                   ]
//                 }
//               }
//             },
//             {
//               $project: {
//                 _id: 0,
//                 districtName: 1,
//                 blockName: 1,
//                 centerName: 1
//               }
//             }
//           ],
//           as: "schoolInfo"
//         }
//       },

//       // 3️⃣ Lookup attendance for each student
//       {
//         $lookup: {
//           from: "studentattendances",
//           localField: "_id",
//           foreignField: "unqStudentObjectId",
//           as: "attendances"
//         }
//       },

//       // 4️⃣ Add calculated fields for attendance counts
//       {
//         $addFields: {
//           totalPresent: {
//             $size: {
//               $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Present"] } }
//             }
//           },
//           totalAbsent: {
//             $size: {
//               $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Absent"] } }
//             }
//           },
//           absentCallingStatus: {
//             $map: {
//               input: {
//                 $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Absent"] } }
//               },
//               as: "att",
//               in: "$$att.absenteeCallingStatus"
//             }
//           }
//         }
//       },

//       // 5️⃣ Group by school + classofStudent
//       {
//         $group: {
//           _id: { schoolId: "$schoolId", classofStudent: "$classofStudent" },
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolName: { $first: { $arrayElemAt: ["$schoolInfo.centerName", 0] } },
//           districtName: { $first: { $arrayElemAt: ["$schoolInfo.districtName", 0] } },
//           blockName: { $first: { $arrayElemAt: ["$schoolInfo.blockName", 0] } },
//           totalStudents: { $sum: 1 },
//           totalPresent: { $sum: "$totalPresent" },
//           totalAbsent: { $sum: "$totalAbsent" },
//           callingConnected: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Connected"] } }
//               }
//             }
//           },
//           callingNotConnected: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Not-Connected"] } }
//               }
//             }
//           },
//           callingNotCalled: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Not-called"] } }
//               }
//             }
//           }
//         }
//       },

//       // 6️⃣ Group by school to have class-wise array
//       {
//         $group: {
//           _id: "$_id.schoolId",
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolName: { $first: "$schoolName" },
//           districtName: { $first: "$districtName" },
//           blockName: { $first: "$blockName" },
//           classofStudent: {
//             $push: {
//               class: "$_id.classofStudent",
//               totalStudents: "$totalStudents",
//               totalPresent: "$totalPresent",
//               totalAbsent: "$totalAbsent",
//               callingConnected: "$callingConnected",
//               callingNotConnected: "$callingNotConnected",
//               callingNotCalled: "$callingNotCalled"
//             }
//           }
//         }
//       },

//       // 7️⃣ Project final output
//       {
//         $project: {
//           _id: 0,
//           schoolId: "$_id",
//           districtId: 1,
//           blockId: 1,
//           schoolName: 1,
//           districtName: 1,
//           blockName: 1,
//           classofStudent: 1
//         }
//       }
//     ]);

//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };












// export const PresentAbsentCallingDashboard = async (req, res) => {
//   console.log("Hello count");

//   try {
//     // 1️⃣ Get startDate and endDate from req.body
//     let { startDate, endDate } = req.body;

//     const today = new Date();
//     if (!startDate) startDate = today.toISOString().split("T")[0];
//     if (!endDate) endDate = today.toISOString().split("T")[0];

//     // Convert to Date objects for MongoDB
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     // Set end time to 23:59:59 for inclusive range
//     end.setHours(23, 59, 59, 999);

//     const result = await Student.aggregate([
//       // 2️⃣ Only students whose SLC is not taken
//       { $match: { isSlcTaken: false } },

//       // 3️⃣ Lookup school info from district_block_schools
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: { schoolId: "$schoolId", districtId: "$districtId", blockId: "$blockId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$centerId", "$$schoolId"] },
//                     { $eq: ["$districtId", "$$districtId"] },
//                     { $eq: ["$blockId", "$$blockId"] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 districtName: 1,
//                 blockName: 1,
//                 centerName: 1,
//               },
//             },
//           ],
//           as: "schoolInfo",
//         },
//       },

//       // 4️⃣ Lookup attendance for each student with date range filter
//       {
//         $lookup: {
//           from: "studentattendances",
//           let: { studentId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$unqStudentObjectId", "$$studentId"] },
//                 date: { $gte: start, $lte: end },
//               },
//             },
//           ],
//           as: "attendances",
//         },
//       },

//       // 5️⃣ Add calculated fields for attendance counts
//       {
//         $addFields: {
//           totalPresent: {
//             $size: {
//               $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Present"] } },
//             },
//           },
//           totalAbsent: {
//             $size: {
//               $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Absent"] } },
//             },
//           },
//           absentCallingStatus: {
//             $map: {
//               input: {
//                 $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Absent"] } },
//               },
//               as: "att",
//               in: "$$att.absenteeCallingStatus",
//             },
//           },
//         },
//       },

//       // 6️⃣ Group by school + classofStudent
//       {
//         $group: {
//           _id: { schoolId: "$schoolId", classofStudent: "$classofStudent" },
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolName: { $first: { $arrayElemAt: ["$schoolInfo.centerName", 0] } },
//           districtName: { $first: { $arrayElemAt: ["$schoolInfo.districtName", 0] } },
//           blockName: { $first: { $arrayElemAt: ["$schoolInfo.blockName", 0] } },
//           totalStudents: { $sum: 1 },
//           totalPresent: { $sum: "$totalPresent" },
//           totalAbsent: { $sum: "$totalAbsent" },
//           callingConnected: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Connected"] } },
//               },
//             },
//           },
//           callingNotConnected: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Not-Connected"] } },
//               },
//             },
//           },
//           callingNotCalled: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Not-called"] } },
//               },
//             },
//           },
//         },
//       },

//       // 7️⃣ Group by school to have class-wise array
//       {
//         $group: {
//           _id: "$_id.schoolId",
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolName: { $first: "$schoolName" },
//           districtName: { $first: "$districtName" },
//           blockName: { $first: "$blockName" },
//           classofStudent: {
//             $push: {
//               class: "$_id.classofStudent",
//               totalStudents: "$totalStudents",
//               totalPresent: "$totalPresent",
//               totalAbsent: "$totalAbsent",
//               callingConnected: "$callingConnected",
//               callingNotConnected: "$callingNotConnected",
//               callingNotCalled: "$callingNotCalled",
//             },
//           },
//         },
//       },

//       // 8️⃣ Project final output
//       {
//         $project: {
//           _id: 0,
//           schoolId: "$_id",
//           districtId: 1,
//           blockId: 1,
//           schoolName: 1,
//           districtName: 1,
//           blockName: 1,
//           classofStudent: 1,
//         },
//       },
//     ]);

//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };










// export const PresentAbsentCallingDashboard = async (req, res) => {
//   console.log("Hello count");

//   try {
//     // 1️⃣ Get startDate, endDate and schoolIds from req.body
//     let { startDate, endDate, schoolIds } = req.body;

//     console.log(req.body)
//     const today = new Date();
//     if (!startDate) startDate = today.toISOString().split("T")[0];
//     if (!endDate) endDate = today.toISOString().split("T")[0];

//     // Convert to Date objects for MongoDB
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     // Set end time to 23:59:59 for inclusive range
//     end.setHours(23, 59, 59, 999);

//     // 2️⃣ Match stage with optional schoolIds filter
//     const matchStage = { isSlcTaken: false };
//     if (schoolIds && Array.isArray(schoolIds) && schoolIds.length > 0) {
//       matchStage.schoolId = { $in: schoolIds };
//     }

//     const result = await Student.aggregate([
//       // 2️⃣ Only students whose SLC is not taken + optional schoolIds
//       { $match: matchStage },

//       // 3️⃣ Lookup school info from district_block_schools
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: { schoolId: "$schoolId", districtId: "$districtId", blockId: "$blockId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$centerId", "$$schoolId"] },
//                     { $eq: ["$districtId", "$$districtId"] },
//                     { $eq: ["$blockId", "$$blockId"] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 districtName: 1,
//                 blockName: 1,
//                 centerName: 1,
//               },
//             },
//           ],
//           as: "schoolInfo",
//         },
//       },

//       // 4️⃣ Lookup attendance for each student with date range filter
//       {
//         $lookup: {
//           from: "studentattendances",
//           let: { studentId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$unqStudentObjectId", "$$studentId"] },
//                 date: { $gte: start, $lte: end },
//               },
//             },
//           ],
//           as: "attendances",
//         },
//       },

//       // 5️⃣ Add calculated fields for attendance counts
//       {
//         $addFields: {
//           totalPresent: {
//             $size: {
//               $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Present"] } },
//             },
//           },
//           totalAbsent: {
//             $size: {
//               $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Absent"] } },
//             },
//           },
//           absentCallingStatus: {
//             $map: {
//               input: {
//                 $filter: { input: "$attendances", cond: { $eq: ["$$this.status", "Absent"] } },
//               },
//               as: "att",
//               in: "$$att.absenteeCallingStatus",
//             },
//           },
//         },
//       },

//       // 6️⃣ Group by school + classofStudent
//       {
//         $group: {
//           _id: { schoolId: "$schoolId", classofStudent: "$classofStudent" },
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolName: { $first: { $arrayElemAt: ["$schoolInfo.centerName", 0] } },
//           districtName: { $first: { $arrayElemAt: ["$schoolInfo.districtName", 0] } },
//           blockName: { $first: { $arrayElemAt: ["$schoolInfo.blockName", 0] } },
//           totalStudents: { $sum: 1 },
//           totalPresent: { $sum: "$totalPresent" },
//           totalAbsent: { $sum: "$totalAbsent" },
//           callingConnected: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Connected"] } },
//               },
//             },
//           },
//           callingNotConnected: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Not-Connected"] } },
//               },
//             },
//           },
//           callingNotCalled: {
//             $sum: {
//               $size: {
//                 $filter: { input: "$absentCallingStatus", cond: { $eq: ["$$this", "Not-called"] } },
//               },
//             },
//           },
//         },
//       },

//       // 7️⃣ Group by school to have class-wise array
//       {
//         $group: {
//           _id: "$_id.schoolId",
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolName: { $first: "$schoolName" },
//           districtName: { $first: "$districtName" },
//           blockName: { $first: "$blockName" },
//           classofStudent: {
//             $push: {
//               class: "$_id.classofStudent",
//               totalStudents: "$totalStudents",
//               totalPresent: "$totalPresent",
//               totalAbsent: "$totalAbsent",
//               callingConnected: "$callingConnected",
//               callingNotConnected: "$callingNotConnected",
//               callingNotCalled: "$callingNotCalled",
//             },
//           },
//         },
//       },

//       // 8️⃣ Project final output
//       {
//         $project: {
//           _id: 0,
//           schoolId: "$_id",
//           districtId: 1,
//           blockId: 1,
//           schoolName: 1,
//           districtName: 1,
//           blockName: 1,
//           classofStudent: 1,
//         },
//       },
//     ]);

//     // console.log(result)

//     res.status(200).json({status:'Success', data:result});
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };












export const PresentAbsentCallingDashboard = async (req, res) => {
  console.log("Hello count");

  try {
    // 1️⃣ Get startDate, endDate and schoolIds from req.body
    let { startDate, endDate, schoolIds } = req.body;

    console.log(req.body)
    const today = new Date();
    if (!startDate) startDate = today.toISOString().split("T")[0];
    if (!endDate) endDate = today.toISOString().split("T")[0];

    // Convert to Date objects for MongoDB
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end time to 23:59:59 for inclusive range
    end.setHours(23, 59, 59, 999);

    // 2️⃣ Match stage with optional schoolIds filter
    const matchStage = { isSlcTaken: false };
    if (schoolIds && Array.isArray(schoolIds) && schoolIds.length > 0) {
      matchStage.schoolId = { $in: schoolIds };
    }

    const result = await Student.aggregate([
      // 2️⃣ Only students whose SLC is not taken + optional schoolIds
      { $match: matchStage },

      // 3️⃣ Lookup school info from district_block_schools
      {
        $lookup: {
          from: "district_block_schools",
          let: { schoolId: "$schoolId", districtId: "$districtId", blockId: "$blockId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$centerId", "$$schoolId"] },
                    { $eq: ["$districtId", "$$districtId"] },
                    { $eq: ["$blockId", "$$blockId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                districtName: 1,
                blockName: 1,
                centerName: 1,
              },
            },
          ],
          as: "schoolInfo",
        },
      },

      // 4️⃣ Lookup attendance for each student with date range filter
      {
        $lookup: {
          from: "studentattendances",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$unqStudentObjectId", "$$studentId"] },
                date: { $gte: start, $lte: end },
              },
            },
          ],
          as: "attendances",
        },
      },

      // 5️⃣ Unwind attendances to process each date separately
      { $unwind: { path: "$attendances", preserveNullAndEmptyArrays: true } },

      // 6️⃣ Add calculated fields for attendance counts per document
      {
        $addFields: {
          attendanceDate: "$attendances.date",
          status: "$attendances.status",
          absenteeCallingStatus: "$attendances.absenteeCallingStatus",
          totalPresent: {
            $cond: [{ $eq: ["$attendances.status", "Present"] }, 1, 0],
          },
          totalAbsent: {
            $cond: [{ $eq: ["$attendances.status", "Absent"] }, 1, 0],
          },
          callingConnected: {
            $cond: [{ $eq: ["$attendances.absenteeCallingStatus", "Connected"] }, 1, 0],
          },
          callingNotConnected: {
            $cond: [{ $eq: ["$attendances.absenteeCallingStatus", "Not-Connected"] }, 1, 0],
          },
          callingNotCalled: {
            $cond: [{ $eq: ["$attendances.absenteeCallingStatus", "Not-called"] }, 1, 0],
          },
        },
      },

      // 7️⃣ Group by school + class + date
      {
        $group: {
          _id: { schoolId: "$schoolId", classofStudent: "$classofStudent", date: "$attendanceDate" },
          districtId: { $first: "$districtId" },
          blockId: { $first: "$blockId" },
          schoolName: { $first: { $arrayElemAt: ["$schoolInfo.centerName", 0] } },
          districtName: { $first: { $arrayElemAt: ["$schoolInfo.districtName", 0] } },
          blockName: { $first: { $arrayElemAt: ["$schoolInfo.blockName", 0] } },
          totalStudents: { $sum: 1 },
          totalPresent: { $sum: "$totalPresent" },
          totalAbsent: { $sum: "$totalAbsent" },
          callingConnected: { $sum: "$callingConnected" },
          callingNotConnected: { $sum: "$callingNotConnected" },
          callingNotCalled: { $sum: "$callingNotCalled" },
        },
      },

      // 8️⃣ Group by school to have class-wise array with date info
      {
        $group: {
          _id: "$_id.schoolId",
          districtId: { $first: "$districtId" },
          blockId: { $first: "$blockId" },
          schoolName: { $first: "$schoolName" },
          districtName: { $first: "$districtName" },
          blockName: { $first: "$blockName" },
          classofStudent: {
            $push: {
              class: "$_id.classofStudent",
              totalStudents: "$totalStudents",
              totalPresent: "$totalPresent",
              totalAbsent: "$totalAbsent",
              callingConnected: "$callingConnected",
              callingNotConnected: "$callingNotConnected",
              callingNotCalled: "$callingNotCalled",
              date: "$_id.date",
            },
          },
        },
      },

      // 9️⃣ Project final output
      {
        $project: {
          _id: 0,
          schoolId: "$_id",
          districtId: 1,
          blockId: 1,
          schoolName: 1,
          districtName: 1,
          blockName: 1,
          classofStudent: 1,
        },
      },
    ]);

    res.status(200).json({ status: 'Success', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
