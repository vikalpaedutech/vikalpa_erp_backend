//Writing all the Business logic, Rest APIs, for userAttendance.model.js;
import cron from "node-cron";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { User } from "../models/user.model.js";
import { set } from "mongoose";
import multer from "multer";
import { uploadToDOStorage } from "../utils/digitalOceanSpacesUserAttendance.js";

// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');

// Function to create attendance records
export const cronJobUserAttendance = async (req, res) => {
    console.log("I am inside the cron job function of user attedndance");

   
    try {
        
         // Step 1: Get current date at midnight UTC (00:00:00)
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z
console.log(currentDate)
        // Step 2: Check if attendance for current date already exists
        const existingAttendance = await UserAttendance.findOne({ date: currentDate });

        if (existingAttendance) {
            console.log("Attendance already created");
            return res.status(400).json({ message: "Attendance already created for today" });
        }


        const users = await User.find({}); // Get all students

        console.log(users);

        console.log(`Found ${users.length} students`);

        // Loop through students and create attendance records
        for (const user of users) {
            console.log(`Processing student with user id: ${user.userId}`);
            
            const userAttendanceRecord = new UserAttendance({
                userId: user.userId,
                date: new Date().toISOString().split("T")[0], // => "2025-04-10",
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
                visitingLocation: null


            });

            await userAttendanceRecord.save(); // Save the attendance data
            console.log(`Attendance saved for user id: ${user.userId}`);
        }

        console.log('Attendance records created for all users');
    } catch (error) {
        
        console.error('Error during user attendance dump: ', error);
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
