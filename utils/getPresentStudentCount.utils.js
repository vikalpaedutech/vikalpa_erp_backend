// /utils/getPresentStudentCount.js

import { StudentAttendance } from "../models/studentAttendance.model.js";



export const getPresentStudentCount = async ({ classofStudent, schoolId, date }) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Fetching present student count for:");
    console.log("classofStudent:", classofStudent);
    console.log("schoolId:", schoolId);
    console.log("Date range:", startOfDay, "to", endOfDay);

    const result = await StudentAttendance.aggregate([
      {
        $match: {
          status: "Present",
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "studentSrn",
          foreignField: "studentSrn",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $match: {
          "studentInfo.classofStudent": classofStudent,
          "studentInfo.schoolId": schoolId,
        },
      },
      {
        $count: "totalPresent",
      },
    ]);

    const total = result.length > 0 ? result[0].totalPresent : 0;

    console.log("Total Present Students Found:", total);

    return total;
  } catch (err) {
    console.error("Error in getPresentStudentCount:", err.message);
    return 0;
  }
};

// module.exports = getPresentStudentCount;
