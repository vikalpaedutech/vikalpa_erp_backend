//Writing all the Business logic, Rest APIs, for userAttendance.model.js;
import cron from "node-cron";
import { UserAttendance } from "../models/userAttendnace.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { set } from "mongoose";
import multer from "multer";
import { uploadToDOStorage } from "../utils/digitalOceanSpacesUserAttendance.js";
import { compareSync } from "bcryptjs";



//Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');




//New Apis 07-05-2026-------------------------------------

// export const markUserAttendance = async (req, res) => {
//   let {
//     unqUserObjectId,
//     userId,
//     date,
//     attendance,
//     loginTime,
//     logoutTime,
//     longitude,
//     latitude,
//     coordinateDifference,
//     logoutLongitude,
//     logoutLatitude,
//     logoutCoordinateDifference,
//     fileName,
//     fileUrl,
//     attendanceType,
//     visitingLocation,
//     attendanceMarkedBy,
//     remarkForManualAttendance
//   } = req.body;

//   console.log(req.body)

//   console.log(req.file)

//   try {
//     // Validate required fields
//     if (!unqUserObjectId) {
//       return res.status(400).json({
//         success: false,
//         message: "unqUserObjectId is required"
//       });
//     }

//     // Check if attendance already exists for this user on this date
//     const existingAttendance = await UserAttendance.findOne({
//       unqUserObjectId,
//       date: {
//         $gte: new Date(date).setHours(0, 0, 0, 0),
//         $lt: new Date(date).setHours(23, 59, 59, 999)
//       }
//     });

//     let attendanceRecord;

//      // Upload file if present
//     if (req.file) {
//       const mimeType = req.file.mimetype;
//       fileName = `attendance-${userId}-${Date.now()}.jpg`;
//       console.log(`📤 Uploading to DO Spaces: ${fileName} (${(req.file.size / 1024).toFixed(2)}KB)`);
      
//       fileUrl = await uploadToDOStorage(req.file.buffer, fileName, mimeType);
//       console.log(`✅ File uploaded: ${fileUrl}`);
//     }

//     if (existingAttendance) {
//       // Update existing attendance
//       attendanceRecord = await UserAttendance.findByIdAndUpdate(
//         existingAttendance._id,
//         {
//           ...(userId && { userId }),
//           ...(attendance && { attendance }),
//           ...(loginTime && { loginTime }),
//           ...(logoutTime && { logoutTime }),
//           ...(longitude && { longitude }),
//           ...(latitude && { latitude }),
//           ...(coordinateDifference && { coordinateDifference }),
//           ...(logoutLongitude && { logoutLongitude }),
//           ...(logoutLatitude && { logoutLatitude }),
//           ...(logoutCoordinateDifference && { logoutCoordinateDifference }),
//           ...(fileName && { fileName }),
//           ...(fileUrl && { fileUrl }),
//           ...(attendanceType && { attendanceType }),
//           ...(visitingLocation && { visitingLocation }),
//           ...(attendanceMarkedBy && { attendanceMarkedBy }),
//           ...(remarkForManualAttendance && { remarkForManualAttendance })
//         },
//         { new: true, runValidators: true }
//       ).populate('unqUserObjectId', 'name email'); // Populate user details if needed

//       return res.status(200).json({
//         success: true,
//         message: "Attendance updated successfully",
//         data: attendanceRecord
//       });
//     } else {
//       // Create new attendance record
//       attendanceRecord = await UserAttendance.create({
//         unqUserObjectId,
//         userId: userId || null,
//         date: date || new Date(),
//         attendance: attendance || "Absent",
//         loginTime: loginTime || new Date(),
//         logoutTime: logoutTime || new Date(),
//         longitude: longitude || 0,
//         latitude: latitude || 0,
//         coordinateDifference: coordinateDifference || null,
//         logoutLongitude: logoutLongitude || 0,
//         logoutLatitude: logoutLatitude || 0,
//         logoutCoordinateDifference: logoutCoordinateDifference || null,
//         fileName: fileName || null,
//         fileUrl: fileUrl || null,
//         attendanceType: attendanceType || null,
//         visitingLocation: visitingLocation || null,
//         attendanceMarkedBy: attendanceMarkedBy || null,
//         remarkForManualAttendance: remarkForManualAttendance || null
//       });

//       // Populate the user details
//       await attendanceRecord.populate('unqUserObjectId', 'name email');

//       return res.status(201).json({
//         success: true,
//         message: "Attendance marked successfully",
//         data: attendanceRecord
//       });
//     }

//   } catch (error) {
//     console.error("Error in markUserAttendance:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };











export const markUserAttendance = async (req, res) => {
  let {
    unqUserObjectId,
    userId,
    date,
    attendance,
    loginTime,
    logoutTime,
    longitude,
    latitude,
    coordinateDifference,
    logoutLongitude,
    logoutLatitude,
    logoutCoordinateDifference,
    fileName,
    fileUrl,
    attendanceType,
    visitingLocation,
    attendanceMarkedBy,
    remarkForManualAttendance,
    reasonIfNotPresent,  // New field
    isLeaveApproved,     // New field
    approvalRemark       // New field
  } = req.body;

  console.log(req.body);
  console.log(req.file);

  try {
    // Validate required fields
    if (!unqUserObjectId) {
      return res.status(400).json({
        success: false,
        message: "unqUserObjectId is required"
      });
    }

    // Validate: If attendance is not "Present", reasonIfNotPresent is required
    if (attendance && attendance !== "Present") {
      if (!reasonIfNotPresent || reasonIfNotPresent.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "reasonIfNotPresent is required when attendance is not 'Present'"
        });
      }
    }

    // Check if attendance already exists for this user on this date
    const existingAttendance = await UserAttendance.findOne({
      unqUserObjectId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      }
    });

    let attendanceRecord;

    // Upload file if present
    if (req.file) {
      const mimeType = req.file.mimetype;
      fileName = `attendance-${userId}-${Date.now()}.jpg`;
      console.log(`📤 Uploading to DO Spaces: ${fileName} (${(req.file.size / 1024).toFixed(2)}KB)`);
      
      fileUrl = await uploadToDOStorage(req.file.buffer, fileName, mimeType);
      console.log(`✅ File uploaded: ${fileUrl}`);
    }

    if (existingAttendance) {
      // Update existing attendance
      const updateData = {
        ...(userId && { userId }),
        ...(attendance && { attendance }),
        ...(loginTime && { loginTime }),
        ...(logoutTime && { logoutTime }),
        ...(longitude && { longitude }),
        ...(latitude && { latitude }),
        ...(coordinateDifference && { coordinateDifference }),
        ...(logoutLongitude && { logoutLongitude }),
        ...(logoutLatitude && { logoutLatitude }),
        ...(logoutCoordinateDifference && { logoutCoordinateDifference }),
        ...(fileName && { fileName }),
        ...(fileUrl && { fileUrl }),
        ...(attendanceType && { attendanceType }),
        ...(visitingLocation && { visitingLocation }),
        ...(attendanceMarkedBy && { attendanceMarkedBy }),
        ...(remarkForManualAttendance && { remarkForManualAttendance }),
        // New fields
        ...(reasonIfNotPresent !== undefined && { reasonIfNotPresent }),
        ...(isLeaveApproved !== undefined && { isLeaveApproved }),
        ...(approvalRemark !== undefined && { approvalRemark })
      };

      // If attendance is "Present", clear reasonIfNotPresent
      if (attendance === "Present") {
        updateData.reasonIfNotPresent = null;
        updateData.isLeaveApproved = null;
        updateData.approvalRemark = null;
      }

      attendanceRecord = await UserAttendance.findByIdAndUpdate(
        existingAttendance._id,
        updateData,
        { new: true, runValidators: true }
      ).populate('unqUserObjectId', 'name email');

      return res.status(200).json({
        success: true,
        message: "Attendance updated successfully",
        data: attendanceRecord
      });
    } else {
      // Create new attendance record
      // If attendance is "Present", set reasonIfNotPresent to null
      const finalReasonIfNotPresent = attendance === "Present" ? null : (reasonIfNotPresent || null);

      attendanceRecord = await UserAttendance.create({
        unqUserObjectId,
        userId: userId || null,
        date: date || new Date(),
        attendance: attendance || "Absent",
        loginTime: loginTime || new Date(),
        logoutTime: logoutTime || new Date(),
        longitude: longitude || 0,
        latitude: latitude || 0,
        coordinateDifference: coordinateDifference || null,
        logoutLongitude: logoutLongitude || 0,
        logoutLatitude: logoutLatitude || 0,
        logoutCoordinateDifference: logoutCoordinateDifference || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        attendanceType: attendanceType || null,
        visitingLocation: visitingLocation || null,
        attendanceMarkedBy: attendanceMarkedBy || null,
        remarkForManualAttendance: remarkForManualAttendance || null,
        // New fields
        reasonIfNotPresent: finalReasonIfNotPresent,
        isLeaveApproved: attendance === "Present" ? null : (isLeaveApproved || null),
        approvalRemark: attendance === "Present" ? null : (approvalRemark || null)
      });

      // Populate the user details
      await attendanceRecord.populate('unqUserObjectId', 'name email');

      return res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        data: attendanceRecord
      });
    }

  } catch (error) {
    console.error("Error in markUserAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};





export const getUserAttendanceData = async (req, res) => {
  const { unqUserObjectId } = req.body;
  
console.log("I am inside userAttendanceController.js and api name is getUserAttendanceData")
  
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    
    const existingAttendance = await UserAttendance.findOne({
      unqUserObjectId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

  
    // Return response with proper structure
    res.status(200).json({
      success: true,
      status: "ok",
      data: existingAttendance || null, // Will be null if no attendance found
      hasAttendance: !!existingAttendance,
      message: existingAttendance ? "Attendance found" : "No attendance for today"
    });

  } catch (error) {
    console.error("Error in getting attendance:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
};





//----------------------------------------------------------


export const cronJobUserAttendance = async (req, res) => {

    // console.log("I am inside the cron job function of user attendance");

    const { date } = req.body || {};

    // console.log("Triggered for date:", date);

    try {
        // Step 1: Normalize date (midnight IST)
        const currentDate = date ? new Date(date) : new Date();
         currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z

        // Step 2: Prevent duplicate attendance creation
        const existingAttendance = await UserAttendance.findOne({ date: currentDate });
        if (existingAttendance) {

            // console.log("Attendance already created");
          
            if (res) return res.status(400).json({ message: "Attendance already created for today" });
            return;
        }

        // Step 3: Get all active users
        const users = await User.find({ isActive: true });

        // console.log(`Found ${users.length} users`);

        for (const user of users) {
            const userAttendanceRecord = new UserAttendance({
              unqUserObjectId:user._id,
                userId: user.userId,
                date: date || new Date().toISOString().split("T")[0],
                attendance: "Absent",
                longitude: 0,
                latitude: 0,
                coordinateDifference: null,
                loginTime: "",
                logoutTime: "",
                logoutLongitude: 0,
                logoutLatitude: 0,
                logoutCoordinateDifference: null,
                fileName: null,
                fileUrl: null,
                attendanceType: null,
                visitingLocation: null,
                attendanceMarkedBy: null,
            });

            await userAttendanceRecord.save();

            // console.log(`Attendance saved for user id: ${user.userId}`);
        }

        if (res) {
            res.status(200).json({ status: "success", message: "Attendance instance created successfully" });
        }

        // console.log("Attendance records created for all users");
    
      } catch (error) {
        console.error("Error during user attendance dump: ", error);
        if (res) {
            res.status(500).json({ status: "Failed", message: "Attendance instance could not be created" });
        }
    }
};

// // --------------------------- Auto Scheduler ---------------------------
// // Convert IST -> Cron Expression (system UTC expected)
// const { hours, minutes } = parseISTTime(attendanceRunTimeIST);

// // Convert IST to UTC (because server may run in UTC)
// // const utcDate = new Date(Date.UTC(1970, 0, 1, hours - 5, minutes - 30));
// // const utcHours = utcDate.getUTCHours();
// // const utcMinutes = utcDate.getUTCMinutes();

// // Final cron expression
// const cronExp = `${minutes} ${hours} * * *`;

// // console.log(`Cron job scheduled for ${attendanceRunTimeIST} IST -> ${cronExp}`);

// cron.schedule(cronExp, async () => {

//     // console.log("Running cron job at IST time:", attendanceRunTimeIST);

//     await cronJobUserAttendance({ body: {} }, { 
//         status: () => ({ json: () => {} }) // dummy res for cron run
//     });
// });
// //---------------------------------------------------------------










































// Cron job runs at midnight every day

// console.log('Setting up the cron job');
// cron.schedule('0 0 * * *', createAttendanceRecords);

// Manually run the function for testing purpose
// console.log('Running the cron job immediately for testing');
// createAttendanceRecords();  // Call the function immediately to run it now


//__________________________________________________________________________



//API TO GET ATTENDANCE BY USER ID

export const GetAttendanceByUserId = async (req, res) => {
    const { userId, date } = req.query;

    // console.log(req.query)

   

    try {
        const attendanceData = await User.aggregate([
            {
                $match: { userId: userId } // Match User first
            },
            {
                $lookup: {
                    from: "userattendances",
                    localField: "userId",
                    foreignField: "userId",
                    as: "attendances"
                }
            },
            { $unwind: "$attendances" }, // Flatten attendances array
            {
                $match: {
                    "attendances.date": new Date(date) // Match date inside userattendances
                }
            }
        ]);

        res.status(200).json({ status: "Success", data: attendanceData });
    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).json({ status: "Failed", message: error.message });
    }
};
//____________________________________________________________________


// Patch attendance with image upload


// export const PatchUserAttendanceByUserId = async (req, res) => {

//   console.log('hello user attendance')
//   const { userId, date } = req.query;
//   console.log(req.query)

//   let {
//     attendance,
//     longitude,
//     latitude,
//     coordinateDifference,
//     loginTime,
//     logoutTime,
//     logoutLongitude,
//     logoutLatitude,
//     logoutCoordinateDifference,
//     attendanceType,
//     visitingLocation
//   } = req.body;

//   // ✅ Handle coordinateDifference null or 'null' cases
//   const safeCoordinateDifference =
//     coordinateDifference === null ||
//     coordinateDifference === "null" ||
//     coordinateDifference === undefined
//       ? 0
//       : Number(coordinateDifference);

//   console.log("🧾 Request Body:", req.body);
  
//   console.log("📁 File:", req.file);

//   try {
//     let fileUrl = null;
//     let fileName = null;

//     if (req.file) {
//       const mimeType = req.file.mimetype;
//       fileName = `attendance-${userId}-${Date.now()}.jpg`;
//       fileUrl = await uploadToDOStorage(req.file.buffer, fileName, mimeType);
//     }

//     const updatePayload = {
//       ...(attendance && { attendance }),
//       ...(longitude && { longitude }),
//       ...(latitude && { latitude }),
//       ...(safeCoordinateDifference !== null && { coordinateDifference: safeCoordinateDifference }),
//       ...(loginTime && { loginTime }),
//       ...(logoutTime && { logoutTime }),
//       ...(logoutLongitude && { logoutLongitude }),
//       ...(logoutLatitude && { logoutLatitude }),
//       ...(logoutCoordinateDifference && { logoutCoordinateDifference }),
//       ...(fileUrl && { fileUrl }),
//       ...(fileName && { fileName }),
//       attendanceType: attendanceType ? attendanceType : "NA", // ✅ added
//       visitingLocation: visitingLocation ? visitingLocation : "NA", // ✅ added
//     };

//     const updated = await UserAttendance.findOneAndUpdate(
//       { userId, date },
//       { $set: updatePayload },
//       { new: true }
//     );


// //Handling gamification point.
            
// // const date = loginTime

//           const keyValue = "self-attendance"

//           const AwardPoints = awardPoints({keyValue, userId, loginTime})

// //------------------------------------------------------------

//     res.status(200).json({ status: "Success", data: updated });
//   } catch (error) {
//     console.error("❌ Attendance Update Error:", error.message);
//     res.status(500).json({ status: "Failed", message: error.message });
//   }
// };




export const PatchUserAttendanceByUserId = async (req, res) => {
  console.log('📍 PatchUserAttendanceByUserId called');
  
  const { userId, date } = req.query;
  console.log("📋 Query params:", { userId, date });

  let {
    attendance,
    longitude,
    latitude,
    coordinateDifference,
    loginTime,
    logoutTime,
    logoutLongitude,
    logoutLatitude,
    logoutCoordinateDifference,
    attendanceType,
    visitingLocation
  } = req.body;

  // Validate required fields
  if (!userId || !date) {
    return res.status(400).json({ 
      status: "Failed", 
      message: "userId and date are required query parameters" 
    });
  }

  // Handle coordinateDifference null cases
  const safeCoordinateDifference =
    coordinateDifference === null ||
    coordinateDifference === "null" ||
    coordinateDifference === undefined
      ? 0
      : Number(coordinateDifference);

  console.log("🧾 Request Body:", req.body);
  console.log("📁 File received:", req.file ? {
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : "No file");

  try {
    let fileUrl = null;
    let fileName = null;

    // Upload file if present
    if (req.file) {
      const mimeType = req.file.mimetype;
      fileName = `attendance-${userId}-${Date.now()}.jpg`;
      console.log(`📤 Uploading to DO Spaces: ${fileName} (${(req.file.size / 1024).toFixed(2)}KB)`);
      
      fileUrl = await uploadToDOStorage(req.file.buffer, fileName, mimeType);
      console.log(`✅ File uploaded: ${fileUrl}`);
    }

    // Build update payload
    const updatePayload = {
      ...(attendance && { attendance }),
      ...(longitude && { longitude }),
      ...(latitude && { latitude }),
      ...(safeCoordinateDifference !== null && { coordinateDifference: safeCoordinateDifference }),
      ...(loginTime && { loginTime }),
      ...(logoutTime && { logoutTime }),
      ...(logoutLongitude && { logoutLongitude }),
      ...(logoutLatitude && { logoutLatitude }),
      ...(logoutCoordinateDifference && { logoutCoordinateDifference }),
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName }),
      attendanceType: attendanceType || "NA",
      visitingLocation: visitingLocation || "NA",
    };

    console.log("📝 Update payload:", updatePayload);

    // Update or create attendance record
    const updated = await UserAttendance.findOneAndUpdate(
      { userId, date },
      { $set: updatePayload },
      { new: true, upsert: true } // upsert creates if doesn't exist
    );

    console.log("✅ Attendance updated successfully:", updated._id);

    // // Award points for self-attendance (only for login)
    // if (loginTime && attendance === "Present") {
    //   const keyValue = "self-attendance";
    //   await awardPoints({ keyValue, userId, loginTime });
    //   console.log("🎮 Points awarded for self-attendance");
    // }

    res.status(200).json({ 
      status: "Success", 
      data: updated,
      message: "Attendance marked successfully"
    });
    
  } catch (error) {
    console.error("❌ Attendance Update Error:", error);
    res.status(500).json({ 
      status: "Failed", 
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};







export const getFilteredUserAttendanceSummary = async (req, res) => {

  // console.log('I am insdied get filtered user attendance summary.')
  try {
    const { roles, departments, districtIds, schoolIds, startDate, endDate } = req.body;

    // console.log(req.body)

    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    const result = await UserAttendance.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "userInfo.role": { $in: roles },
          "userInfo.department": { $in: departments },
          "userInfo.districtIds": { $elemMatch: { $in: districtIds } },
          "userInfo.userId": { $not: /^Dummy/i },
          "userInfo.name": { $not: /^Dummy/i },
          ...(schoolIds?.length && {
            "userInfo.schoolIds": { $elemMatch: { $in: schoolIds } },
          }),
        },
      },
      {
        $lookup: {
          from: "district_block_schools",
          let: {
            districtIds: "$userInfo.districtIds",
            schoolIds: "$userInfo.schoolIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$districtId", "$$districtIds"] },
                    { $in: ["$centerId", "$$schoolIds"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                districtId: 1,
                districtName: 1,
                centerId: 1,
                centerName: 1,
              },
            },
          ],
          as: "locationInfo",
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          date: 1,
          attendance: 1,
          loginTime: 1,
          logoutTime: 1,
          attendanceType: 1,
          visitingLocation: 1,
          // User info
          name: "$userInfo.name",
          contact1: "$userInfo.contact1",
          role: "$userInfo.role",
          department: "$userInfo.department",
          districtIds: "$userInfo.districtIds",
          schoolIds: "$userInfo.schoolIds",
          locationInfo: 1,
        },
      },
      {
        $sort: { date: 1 }, // Optional: sort by date ascending
      },
    ]);

    // console.log("Start:", start.toISOString(), "End:", end.toISOString());
    // console.log("Total Records:", result.length);

    res.status(200).json({
      success: true,
      message: "Attendance data fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error in fetching user attendance summary", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



//--------------------------------------------------------

export const getUserAttendanceSummaryData = async (req, res) => {

  console.log("Hello attendance summary");

  const { roles, departments, districtIds, schoolIds, startDate, endDate } = req.body;

  console.log(req.body)

  // console.log(req.body)

  try {
    const pipeline = [
      // 1️⃣ Lookup Users
      {
        $lookup: {
          from: "users",
          localField: "unqUserObjectId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 2️⃣ Lookup UserAccess
      {
        $lookup: {
          from: "useraccesses",
          localField: "unqUserObjectId",
          foreignField: "unqObjectId",
          as: "access",
        },
      },
      { $unwind: { path: "$access", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Lookup district_block_schools to fetch names
      {
        $lookup: {
          from: "district_block_schools",
          let: { regions: "$access.region" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$districtId", { $map: { input: "$$regions", as: "r", in: "$$r.districtId" } }],
                },
              },
            },
          ],
          as: "regionDetails",
        },
      },
    ];

    // 4️⃣ Filters
    const matchStage = {};

    if (roles && roles.length > 0) {
      matchStage["user.role"] = { $in: roles };
    }

    if (departments && departments.length > 0) {
      matchStage["user.department"] = { $in: departments };
    }

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      matchStage.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchStage.date = { $lte: new Date(endDate) };
    }

    if (districtIds && districtIds.length > 0) {
      matchStage["access.region.districtId"] = { $in: districtIds };
    }

    if (schoolIds && schoolIds.length > 0) {
      matchStage["access.region.blockIds.schoolIds.schoolId"] = { $in: schoolIds };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 5️⃣ Final projection
    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        attendance: 1,
        loginTime: 1,
        logoutTime: 1,
        "user._id": 1,
        "user.userId": 1,
        "user.name": 1,
        "user.email": 1,
        "user.role": 1,
        "user.contact1": 1,
        "user.contact2": 1,
        "user.department": 1,
        "access.region": 1, // keep original ids
        regionDetails: 1, // 👈 names from district_block_schools
      },
    });

    const result = await UserAttendance.aggregate(pipeline);

    console.log(result.data)

    // console.log(result)

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error in getUserAttendanceSummaryData:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};








//Patch attendance status in db. without image.//This is mared by ACI if the user is absent.

export const patchUserAttendanceWithoutImage = async (req, res) => {

  // console.log('I AM INSIDE PATCH USER ATTENDANCE WITHOUT IMAGE.')

  const { userId, date } = req.query;

  // console.log(req.query)

  const {
    attendance,
    attendanceMarkedBy,
    attendanceType,
    visitingLocation,
    remarkForManualAttendance
  } = req.body;


  // console.log(req.query)
  // console.log(req.body)

  if (!userId || !date) {
    return res.status(400).json({
      status: "Failed",
      message: "Missing required fields: userId or date",
    });
  }

  try {
    const updatePayload = {
      ...(attendance && { attendance }),
      ...(attendanceMarkedBy && { attendanceMarkedBy }),
      attendanceType: attendanceType || "NA",
      visitingLocation: visitingLocation || "NA",
      remarkForManualAttendance: remarkForManualAttendance || 'NA'
    };

    const updated = await UserAttendance.findOneAndUpdate(
      { userId, date },
      { $set: updatePayload },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: "Failed",
        message: "Attendance record not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Attendance updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Attendance Update Error:", error.message);
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};







//Get user attendance data of a single month. And user can filter out a data...
//...of any month within a year.

// export const GetAttendanceDataOfUsersByMonthAndYear = async (req, res) =>{

//   const {userId} = req.query
//   const {date} = req.body

//   try {
    
//   } catch (error) {
    
//   }
// }



export const GetAttendanceDataOfUsersByMonthAndYear = async (req, res) => {
  const { userId } = req.query;
  const { month, year } = req.body;
  
// console.log('i am inside get user attendance')  
// console.log(req.body)
// console.log(req.query)

  if (!userId || !month || !year) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userId, month, or year",
    });
  }

  try {
    // Calculate start and end date of the month
    const startDate = new Date(year, month - 1, 1); // month is 0-based
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

    // Find attendance for user within the date range
    const attendanceRecords = await UserAttendance.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 }); // Sort by date ascending

    return res.status(200).json({
      success: true,
      message: "Attendance data fetched successfully",
      data: attendanceRecords,
      range: {
        from: startDate.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance data",
      error: error.message,
    });
  }
};




//Version 2 apis

// export const userSelfAttendanceDashboard = async (req, res) => {
//   try {
//     const { _id, date, month, year, startDate, endDate } = req.body;

//     // Validate required fields
//     if (!_id) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required"
//       });
//     }

//     // Find user details
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Build query for attendance
//     let attendanceQuery = { unqUserObjectId: _id };

//     // Priority 1: Custom date range (startDate and endDate)
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999); // Include entire end day
      
//       attendanceQuery.date = {
//         $gte: start,
//         $lte: end
//       };
//     }
//     // Priority 2: Specific date (date, month, year)
//     else if (date && month && year) {
//       const specificDate = new Date(year, month - 1, date);
//       const nextDate = new Date(year, month - 1, date + 1);
      
//       attendanceQuery.date = {
//         $gte: specificDate,
//         $lt: nextDate
//       };
//     }
//     // Priority 3: Full month (month and year)
//     else if (month && year) {
//       const startDateOfMonth = new Date(year, month - 1, 1);
//       const endDateOfMonth = new Date(year, month, 0, 23, 59, 59);
      
//       attendanceQuery.date = {
//         $gte: startDateOfMonth,
//         $lte: endDateOfMonth
//       };
//     }

//     // Fetch attendance records
//     const attendanceRecords = await UserAttendance.find(attendanceQuery)
//       .sort({ date: -1 }) // Sort by date descending (newest first)
//       .lean();

//     // Calculate attendance statistics
//     const totalDays = attendanceRecords.length;
//     const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
//     const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
//     const leaveDays = attendanceRecords.filter(record => record.status === 'leave').length;
//     const halfDays = attendanceRecords.filter(record => record.status === 'half-day').length;

//     // Calculate attendance percentage
//     const attendancePercentage = totalDays > 0 
//       ? ((presentDays + halfDays * 0.5) / totalDays * 100).toFixed(2)
//       : 0;

//     // Prepare response data
//     const responseData = {
//       userDetails: {
//         _id: user._id,
//         userId: user.userId,
//         name: user.name,
//         email: user.email,
//         mobile: user.contact1 || user.contact2,
//         department: user.department,
//         role: user.role,
//         profileImage: user.profileImage,
//         avgScore: user.avgScore,
//         rank: user.rank
//       },
//       attendanceSummary: {
//         totalDays,
//         presentDays,
//         absentDays,
//         leaveDays,
//         halfDays,
//         attendancePercentage: parseFloat(attendancePercentage)
//       },
//       attendanceRecords: attendanceRecords.map(record => ({
//         _id: record._id,
//         date: record.date,
//         status: record.status,
//         checkInTime: record.checkInTime || null,
//         checkOutTime: record.checkOutTime || null,
//         workingHours: record.workingHours || null,
//         remarks: record.remarks || null,
//       })),
//       filters: {
//         type: startDate && endDate ? 'range' : 
//               date && month && year ? 'specific' : 
//               month && year ? 'month' : 'all',
//         startDate: startDate || null,
//         endDate: endDate || null,
//         date: date || null,
//         month: month || null,
//         year: year || null
//       }
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Attendance dashboard data fetched successfully",
//       data: responseData
//     });

//   } catch (error) {
//     console.error("Error in userAttendanceDashboard:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };




export const userSelfAttendanceDashboard = async (req, res) => {
  try {
    const { _id, date, month, year, startDate, endDate } = req.body;

    // Validate required fields
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Find user details
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Build query for attendance
    let attendanceQuery = { unqUserObjectId: _id };
    let filterStartDate, filterEndDate;

    // Priority 1: Custom date range (startDate and endDate)
    if (startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      attendanceQuery.date = {
        $gte: filterStartDate,
        $lte: filterEndDate
      };
    }
    // Priority 2: Specific date (date, month, year)
    else if (date && month && year) {
      filterStartDate = new Date(year, month - 1, date);
      filterEndDate = new Date(year, month - 1, date + 1);
      
      attendanceQuery.date = {
        $gte: filterStartDate,
        $lt: filterEndDate
      };
    }
    // Priority 3: Full month (month and year)
    else if (month && year) {
      filterStartDate = new Date(year, month - 1, 1);
      filterEndDate = new Date(year, month, 0, 23, 59, 59);
      
      attendanceQuery.date = {
        $gte: filterStartDate,
        $lte: filterEndDate
      };
    }

    // Fetch attendance records from DB
    const attendanceRecords = await UserAttendance.find(attendanceQuery)
      .sort({ date: -1 })
      .lean();

    // Generate all dates in the range
    let allDates = [];
    if (filterStartDate && filterEndDate) {
      const start = new Date(filterStartDate);
      const end = new Date(filterEndDate);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(start);
      while (currentDate <= end) {
        allDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    let finalRecords = [];

    if (allDates.length > 0) {
      // Create a map of existing attendance records by date string
      const attendanceMap = {};
      attendanceRecords.forEach(record => {
        const dateStr = new Date(record.date).toDateString();
        attendanceMap[dateStr] = record;
      });

      // Build final records with all dates
      finalRecords = allDates.map(date => {
        const dateStr = date.toDateString();
        const existingRecord = attendanceMap[dateStr];
        
        if (existingRecord) {
          // Return the exact DB record as is
          return existingRecord;
        } else {
          // Create a new record with Absent status (matching your DB structure)
          return {
            _id: `auto_${date.toISOString()}`,
            unqUserObjectId: user._id,
            userId: user.userId,
            date: date,
            attendance: "Absent",  // Using your DB field name
            loginTime: null,
            longitude: null,
            latitude: null,
            coordinateDifference: null,
            logoutLongitude: null,
            logoutLatitude: null,
            fileName: null,
            fileUrl: null,
            attendanceType: null,
            visitingLocation: null,
            createdAt: date,
            updatedAt: date,
            __v: 0,
            isAutoGenerated: true // Extra field to identify auto-generated records
          };
        }
      });
    } else {
      // No date range, return records as is
      finalRecords = attendanceRecords;
    }

    // Sort by date descending (newest first)
    finalRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate attendance statistics
    const totalDays = finalRecords.length;
    const presentDays = finalRecords.filter(record => record.attendance === 'Present').length;
    const absentDays = finalRecords.filter(record => record.attendance === 'Absent').length;
    const leaveDays = finalRecords.filter(record => record.attendance === 'Leave').length;
    const halfDays = finalRecords.filter(record => record.attendance === 'Half-Day').length;

    // Calculate attendance percentage
    const attendancePercentage = totalDays > 0 
      ? ((presentDays + halfDays * 0.5) / totalDays * 100).toFixed(2)
      : 0;

    // Prepare response data
    const responseData = {
      userDetails: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.contact1 || user.contact2,
        department: user.department,
        role: user.role,
        profileImage: user.profileImage,
        avgScore: user.avgScore,
        rank: user.rank
      },
      attendanceSummary: {
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
        halfDays,
        attendancePercentage: parseFloat(attendancePercentage)
      },
      attendanceRecords: finalRecords, // Directly send the records as they are
      filters: {
        type: startDate && endDate ? 'range' : 
              date && month && year ? 'specific' : 
              month && year ? 'month' : 'all',
        startDate: startDate || null,
        endDate: endDate || null,
        date: date || null,
        month: month || null,
        year: year || null
      }
    };

    return res.status(200).json({
      success: true,
      message: "Attendance dashboard data fetched successfully",
      data: responseData
    });

  } catch (error) {
    console.error("Error in userSelfAttendanceDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};