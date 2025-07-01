// /BACKEND/controllers/dashboard.controller.js

import { StudentAttendance } from "../models/studentAttendance.model.js"
import { Student } from "../models/student.model.js";
import {AttendancePdf} from "../models/UploadAttendancePdf.model.js"

//Attendance count api.

export const studentAndAttendanceAndAbsenteeCallingCount = async (req, res) => {
   console.log(' i am inside studentAndAttendanceCount controller')
    try {
        const {
            schoolIds ,
            classFilters , // optionally send from frontend
            date 
        } = req.body;

        console.log(req.body)

        // if (!date) {
        //     return res.status(400).json({
        //         status: "Failed",
        //         message: "Date is required"
        //     });
        // }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const response = await Student.aggregate([
            {
                $match: {
                    schoolId: { $in: schoolIds },
                    classofStudent: { $in: classFilters }
                }
            },

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
                                        { $gte: ["$date", targetDate] },
                                        { $lt: ["$date", nextDate] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "attendance"
                }
            },

            {
                $lookup: {
                    from: "schools",
                    localField: "schoolId",
                    foreignField: "schoolId",
                    as: "schoolDetails"
                }
            },
            { $unwind: "$schoolDetails" },

            {
                $group: {
                    _id: {
                        schoolId: "$schoolId",
                        classofStudent: "$classofStudent"
                    },
                    schoolName: { $first: "$schoolDetails.schoolName" },
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
                                        {
                                            $eq: [
                                                { $arrayElemAt: ["$attendance.status", 0] },
                                                "Present"
                                            ]
                                        }
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
                                        {
                                            $eq: [
                                                { $arrayElemAt: ["$attendance.status", 0] },
                                                "Absent"
                                            ]
                                        }
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
                                {
                                    $eq: [
                                        { $arrayElemAt: ["$attendance.absenteeCallingStatus", 0] },
                                        "Connected"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    notConnectedCount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        { $arrayElemAt: ["$attendance.absenteeCallingStatus", 0] },
                                        "Not-Connected"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    notCalledCount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        { $arrayElemAt: ["$attendance.absenteeCallingStatus", 0] },
                                        "Not-called"
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

            // Restructure to group by schoolId
            {
                $group: {
                    _id: "$_id.schoolId",
                    schoolName: { $first: "$schoolName" },
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
                    schoolId: "$_id",
                    schoolName: 1,
                    classes: 1
                }
            }
        ]);

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


//-------------------------------------------------------------------------




//Attendance pdf api. Get counts.

export const attendancePdfUploadStatusCountByClass = async (req, res) => {
  console.log('Inside attendancePdfUploadStatusCountByClass controller');
  try {
    const { schoolIds, date } = req.body;

    if (!schoolIds || !date) {
      return res.status(400).json({
        status: 'Failed',
        message: 'schoolIds and date are required',
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const response = await AttendancePdf.aggregate([
      {
        $match: {
          schoolId: { $in: schoolIds },
          dateOfUpload: {
            $gte: targetDate,
            $lt: nextDate,
          },
        },
      },
      {
        $group: {
          _id: {
            schoolId: "$schoolId",
            classofStudent: "$classofStudent"
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
        $project: {
          _id: 0,
          schoolId: "$_id",
          schoolName: 1,
          classes: 1
        }
      }
    ]);

    res.status(200).json({
      status: "PDF Upload Count By Class Fetched",
      data: response,
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