//Writing all the Business logic, Rest APIs, for userAttendance.model.js;
import cron from "node-cron";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { User } from "../models/user.model.js";
import { set } from "mongoose";

// Function to create attendance records
export const cronJobUserAttendance = async () => {
    console.log("I am inside the cron job function of user attedndance");
    try {
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
                logoutCoordinateDifference:null


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

export const PatchUserAttendanceByUserId = async (req, res) => {

    const {userId, date} = req.query;
    const {attendance, longitude, latitude,  coordinateDifference, loginTime, logoutTime, logoutLongitude, logoutLatitude, logoutCoordinateDifference} = req.body;

    

    console.log(req.query);
    console.log(req.body);
    console.log(loginTime)
    // console.log(req.body)

try {

    const attendance = await UserAttendance.findOneAndUpdate(req.query, {
        $set: req.body
    })

    res.status(200).json({ status: "Success", data: attendance });


    
} catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ status: "Failed", message: error.message });
}

}

//___________________________________________________