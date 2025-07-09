//Writing all the Business logic, Rest APIs, for userAttendance.model.js;
import cron from "node-cron";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { User } from "../models/user.model.js";
import { set } from "mongoose";
import multer from "multer";
import { uploadToDOStorage } from "../utils/digitalOceanSpacesUserAttendance.js";
import { compareSync } from "bcryptjs";

// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');

// Function to create attendance records
// export const cronJobUserAttendance = async (req, res) => {
//     console.log("I am inside the cron job function of user attedndance");

    
//     const {date} = req.body;
//     console.log(date)
   
//     try {
        
//          // Step 1: Get current date at midnight UTC (00:00:00)
//         const currentDate = new Date();
//         currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z
// console.log(currentDate)
//         // Step 2: Check if attendance for current date already exists
//         const existingAttendance = await UserAttendance.findOne({ date: currentDate });

//         if (existingAttendance) {
//             console.log("Attendance already created");
//             return res.status(400).json({ message: "Attendance already created for today" });
//         }


//         const users = await User.find({}); // Get all students

//         console.log(users);

//         console.log(`Found ${users.length} students`);

        

//         // Loop through students and create attendance records
//         for (const user of users) {
//             console.log(`Processing student with user id: ${user.userId}`);
            
//             const userAttendanceRecord = new UserAttendance({
//                 userId: user.userId,
//                 date: new Date().toISOString().split("T")[0], // => "2025-04-10",
//                 attendance: 'Absent', // Default status
//                 longitude:0,
//                 latitude:0,
//                 coordinateDifference: null,
//                 loginTime: "",
//                 logoutTime: "",
//                 logoutLongitude:0,
//                 logoutLatitude:0,
//                 logoutCoordinateDifference:null,
//                 fileName: null,
//                 fileUrl:null,
//                 attendanceType: null,
//                 visitingLocation: null,
//                 attendanceMarkedBy: null,


//             });

//             await userAttendanceRecord.save(); // Save the attendance data
//             console.log(`Attendance saved for user id: ${user.userId}`);
//         }

//         console.log('Attendance records created for all users');
//     } catch (error) {
        
//         console.error('Error during user attendance dump: ', error);
//     }
// };


// export const cronJobUserAttendance = async (req, res) => {
//     console.log("I am inside the cron job function of user attedndance");

//     const {date} = req.body;
//     console.log(date)

//     try {

//         //Checks for duplicacy and if there is duplicacy then stops further executino

//           // Step 1: Get current date at midnight UTC (00:00:00)
//                 const currentDate = date ? new Date(date) : new Date();
//                 currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z

//                 // Step 2: Check if attendance for current date already exists
//                 const existingAttendance = await UserAttendance.findOne({ date: currentDate });

//                 if (existingAttendance) {
//                     console.log("Attendance already created");
//                     return res.status(400).json({ message: "Attendance already created for today" });
//                 }

//         //---------------------------------------------------------------------------

//         const users = await User.find({}); // Get all students

//         console.log(users);

//         console.log(`Found ${users.length} students`);

//         // Loop through students and create attendance records
//         for (const user of users) {
//             console.log(`Processing student with user id: ${user.userId}`);
            
//             const userAttendanceRecord = new UserAttendance({
//                 userId: user.userId,
//                 date: date || new Date().toISOString().split("T")[0], // => "2025-04-10",
//                 attendance: 'Absent', // Default status
//                 longitude:0,
//                 latitude:0,
//                 coordinateDifference: null,
//                 loginTime: "",
//                 logoutTime: "",
//                 logoutLongitude:0,
//                 logoutLatitude:0,
//                 logoutCoordinateDifference:null,
//                 fileName: null,
//                 fileUrl:null,
//                 attendanceType: null,
//                 visitingLocation: null,
//                 attendanceMarkedBy: null,
//             });

//             await userAttendanceRecord.save(); // Save the attendance data
            
//             console.log(`Attendance saved for user id: ${user.userId}`);
//         }
//         res.status(200).json({status:"success", message:"Attendance instance created successfully"})
//         console.log('Attendance records created for all users');
//     } catch (error) {
//         console.error('Error during user attendance dump: ', error);
//         res.status(500).json({status:"Failed", message:"Attendance instance could not be created"})
//     }
// };







export const cronJobUserAttendance = async (req, res) => {
    console.log("I am inside the cron job function of user attedndance");

    const {date} = req.body;
    console.log(date)

    try {

        //Checks for duplicacy and if there is duplicacy then stops further executino

          // Step 1: Get current date at midnight UTC (00:00:00)
                const currentDate = date ? new Date(date) : new Date();
                currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z

                // Step 2: Check if attendance for current date already exists
                const existingAttendance = await UserAttendance.findOne({ date: currentDate });

                if (existingAttendance) {
                    console.log("Attendance already created");
                    return res.status(400).json({ message: "Attendance already created for today" });
                }

        //---------------------------------------------------------------------------

        const users = await User.find({ isActive: true }); // Get all students

        console.log(users);

        console.log(`Found ${users.length} students`);

        // Loop through students and create attendance records
        for (const user of users) {
            console.log(`Processing student with user id: ${user.userId}`);
            
            const userAttendanceRecord = new UserAttendance({
                userId: user.userId,
                date: date || new Date().toISOString().split("T")[0], // => "2025-04-10",
                attendance: 'Absent', // Default status
                longitude:0,
                latitude:0,
                coordinateDifference: null,
                loginTime: "",
                logoutTime: "",
                logoutLongitude:0,
                logoutLatitude:0,
                logoutCoordinateDifference:null,
                fileName: null,
                fileUrl:null,
                attendanceType: null,
                visitingLocation: null,
                attendanceMarkedBy: null,
            });

            await userAttendanceRecord.save(); // Save the attendance data
            
            console.log(`Attendance saved for user id: ${user.userId}`);
        }
        res.status(200).json({status:"success", message:"Attendance instance created successfully"})
        console.log('Attendance records created for all users');
    } catch (error) {
        console.error('Error during user attendance dump: ', error);
        res.status(500).json({status:"Failed", message:"Attendance instance could not be created"})
    }
};












































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

    console.log(req.query)

   

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

//Patch user attendance

// export const PatchUserAttendanceByUserId = async (req, res) => {

//     const {userId, date} = req.query;
//     const {attendance, longitude, latitude,  coordinateDifference, loginTime, logoutTime, logoutLongitude, logoutLatitude, logoutCoordinateDifference} = req.body;

    

//     console.log(req.query);
//     console.log(req.body);
//     console.log(loginTime)
//     // console.log(req.body)

// try {

//     const attendance = await UserAttendance.findOneAndUpdate(req.query, {
//         $set: req.body
//     })

//     res.status(200).json({ status: "Success", data: attendance });


    
// } catch (error) {
//     console.error("Error occurred:", error.message);
//     res.status(500).json({ status: "Failed", message: error.message });
// }

// }

//___________________________________________________



// Patch attendance with image upload


export const PatchUserAttendanceByUserId = async (req, res) => {
  const { userId, date } = req.query;

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

  // ✅ Handle coordinateDifference null or 'null' cases
  const safeCoordinateDifference =
    coordinateDifference === null ||
    coordinateDifference === "null" ||
    coordinateDifference === undefined
      ? 0
      : Number(coordinateDifference);

  console.log("🧾 Request Body:", req.body);
  console.log("📁 File:", req.file);

  try {
    let fileUrl = null;
    let fileName = null;

    if (req.file) {
      const mimeType = req.file.mimetype;
      fileName = `attendance-${userId}-${Date.now()}.jpg`;
      fileUrl = await uploadToDOStorage(req.file.buffer, fileName, mimeType);
    }

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
      attendanceType: attendanceType ? attendanceType : "NA", // ✅ added
      visitingLocation: visitingLocation ? visitingLocation : "NA", // ✅ added
    };

    const updated = await UserAttendance.findOneAndUpdate(
      { userId, date },
      { $set: updatePayload },
      { new: true }
    );
    
    res.status(200).json({ status: "Success", data: updated });
  } catch (error) {
    console.error("❌ Attendance Update Error:", error.message);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};









// Patch attendance with image upload



// export const PatchUserAttendanceByUserId = async (req, res) => {
//   const { userId, date } = req.query;

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

//   // ✅ Handle longitude and latitude null or 'null' cases
//   const safeLongitude =
//     longitude === null || longitude === "null" || longitude === undefined
//       ? 0
//       : Number(longitude);

//   const safeLatitude =
//     latitude === null || latitude === "null" || latitude === undefined
//       ? 0
//       : Number(latitude);

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
//       ...(safeLongitude !== null && { longitude: safeLongitude }),
//       ...(safeLatitude !== null && { latitude: safeLatitude }),
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

//     res.status(200).json({ status: "Success", data: updated });
//   } catch (error) {
//     console.error("❌ Attendance Update Error:", error.message);
//     res.status(500).json({ status: "Failed", message: error.message });
//   }
// };






//Get Attendance Data by SchoolIds, Roles, and Districts.


export const getFilteredUserAttendanceSummary = async (req, res) => {
  try {
    const { roles, departments, districtIds, schoolIds, date } = req.body;

    const matchConditions = {
      role: { $in: roles },
      department: { $in: departments },
      districtIds: { $elemMatch: { $in: districtIds } },
      userId: { $not: /^Dummy/i }, // 👈 exclude dummy userId
      name: { $not: /^Dummy/i },   // 👈 optional: exclude dummy name too
    };

    console.log(req.body);

    if (schoolIds?.length) {
      matchConditions.schoolIds = { $elemMatch: { $in: schoolIds } };
    }

    const selectedDate = date || new Date().toISOString().split("T")[0];

    const result = await User.aggregate([
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "userattendances",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $eq: ["$date", new Date(selectedDate)] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "latestAttendance",
        },
      },
      {
        $unwind: {
          path: "$latestAttendance",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          name: 1,
          contact1:1,
          role: 1,
          department: 1,
          districtIds: 1,
          schoolIds: 1,
          attendance: "$latestAttendance.attendance",
          attendanceDate: "$latestAttendance.date",
          loginTime: "$latestAttendance.loginTime",
          logoutTime: "$latestAttendance.logoutTime",
          attendanceType: "$latestAttendance.attendanceType",
          visitingLocation: "$latestAttendance.visitingLocation",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Filtered user attendance fetched successfully",
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






//Patch attendance status in db. without image.//This is mared by ACI if the user is absent.

export const patchUserAttendanceWithoutImage = async (req, res) => {
  const { userId, date } = req.query;

  const {
    attendance,
    attendanceMarkedBy,
    attendanceType,
    visitingLocation
  } = req.body;


  console.log(req.query)
  console.log(req.body)

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
  
console.log('i am inside get user attendance')  
console.log(req.body)
console.log(req.query)

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
