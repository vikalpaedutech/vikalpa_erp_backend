import mongoose from "mongoose";

// Controller to fetch attendance data
export const getS100Attendances = async (req, res) => {

  console.log('Hello gets100attendances')


  try {
    const { date, classofStudent, studentSrn, firstName, fatherName, status } = req.query;

    // Access collection directly (no model)
    const collection = mongoose.connection.db.collection("s100attendances");

    // Build query object dynamically
    let query = {};

    if (date) {
      // Match the entire day (ignores time)
      const queryDate = new Date(date);
      const nextDate = new Date(queryDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.date = { $gte: queryDate, $lt: nextDate };
    }

    if (classofStudent) query.classofStudent = classofStudent;
    if (studentSrn) query.studentSrn = studentSrn;
    if (firstName) query.firstName = firstName;
    if (fatherName) query.fatherName = fatherName;
    if (status) query.status = status;

    // Default behavior → fetch current date’s records if no query params
    if (Object.keys(query).length === 0) {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lt: endOfDay };
    }

    // Execute query
    const data = await collection.find(query).toArray();

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching s100attendances:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

















// PATCH controller to update status in s100attendances
export const updateAttendanceStatus = async (req, res) => {
  try {
    const { studentSrn, date } = req.query;
    const { status } = req.body;

    if (!studentSrn || !date) {
      return res.status(400).json({
        success: false,
        message: "studentSrn and date are required query params",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required in request body",
      });
    }

    // Access collection directly (no model)
    const collection = mongoose.connection.db.collection("s100attendances");

    // Build date range to ignore time while matching
    const queryDate = new Date(date);
    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const filter = {
      studentSrn,
      date: { $gte: queryDate, $lt: nextDate },
    };

    const update = {
      $set: {
        status,
        updatedAt: new Date(),
      },
    };

    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching attendance record found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance status updated successfully",
    });
  } catch (error) {
    console.error("Error updating attendance status:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

















// Controller: Get Present/Absent counts per class on a given date
export const getAttendanceSummaryByClass = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    if (!date && (!startDate || !endDate)) {
      return res.status(400).json({
        success: false,
        message: "Provide either a single 'date' or 'startDate' & 'endDate'",
      });
    }

    // Access collection
    const collection = mongoose.connection.db.collection("s100attendances");

    // Build match query for date(s)
    let match = {};
    if (date) {
      const queryDate = new Date(date);
      const nextDate = new Date(queryDate);
      nextDate.setDate(nextDate.getDate() + 1);
      match.date = { $gte: queryDate, $lt: nextDate };
    } else if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { classofStudent: "$classofStudent", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.classofStudent",
          counts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          classofStudent: "$_id",
          presentCount: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$counts",
                    as: "c",
                    cond: { $eq: ["$$c.status", "Present"] },
                  },
                },
                as: "item",
                in: "$$item.count",
              },
            },
          },
          absentCount: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$counts",
                    as: "c",
                    cond: { $eq: ["$$c.status", "Absent"] },
                  },
                },
                as: "item",
                in: "$$item.count",
              },
            },
          },
        },
      },
      { $sort: { classofStudent: 1 } },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    return res.status(200).json({
      success: true,
      date: date || `${startDate} to ${endDate}`,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
