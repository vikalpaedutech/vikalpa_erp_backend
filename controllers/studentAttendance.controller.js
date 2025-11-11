//All the business logic, APIs and Rest APIs are in this script.
import cron from "node-cron";

import {Student} from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";


//Gamfication utility
import {awardPoints} from "../utils/gamification.utils.js"

//Student Attendance Cron Job


// // Function to create attendance records


// Function to create attendance records
export const createAttendanceRecords = async (req, res) => {
    console.log("I am inside the cron job function");

    const {date} = req.body;
    // console.log(date)

    try {

        //Checks for duplicacy and if there is duplicacy then stops further executino

          // Step 1: Get current date at midnight UTC (00:00:00)
                const currentDate = date ? new Date(date) : new Date();
                currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z
        
                // Step 2: Check if attendance for current date already exists
                const existingAttendance = await StudentAttendance.findOne({ date: currentDate });
        
                if (existingAttendance) {
                    console.log("Attendance already created");
                    return res.status(400).json({ message: "Attendance already created for today" });
                }

        //---------------------------------------------------------------------------

        const students = await Student.find({ isSlcTaken: false }); // Get all students

        console.log(students);

        console.log(`Found ${students.length} students`);

        // Loop through students and create attendance records
        for (const student of students) {
            console.log(`Processing student with SRN: ${student.studentSrn}`);
            
            const attendanceRecord = new StudentAttendance({
                unqStudentObjectId:student._id,
                studentSrn: student.studentSrn,
                //firstName: student.firstName ,
                //lastName: student.lastName,
                //fatherName: student.fatherName,
                date: date || new Date().toISOString().split("T")[0], // => "2025-04-10",
                //districtId: student.districtId,
                //blockId: student.blockId,
                //schoolId: student.schoolId,
                //classofStudent: student.classofStudent,
                //batch: student.batch,
                status: 'Absent', // Default status
                isAttendanceMarked: false, // Not marked yet
                //isAttendanceUpdated: false, // Not updated yet
                TA: 0, //student.singleSideDistance * student.bothSideDistance, // Example calculation for TA
                absenteeCallingStatus: "Not-called",
                callingRemark1: null,
                callingRemark2: null,
                comments: null,
            });

            await attendanceRecord.save(); // Save the attendance data
            
            
            console.log(`Attendance saved for SRN: ${student.studentSrn}`);
        }
        res.status(200).json({status:"success", message:"Attendance instance created successfully"})
        console.log('Attendance records created for all students');
    } catch (error) {
        console.error('Error during attendance dump: ', error);
        res.status(500).json({status:"Failed", message:"Attendance instance could not be created"})
    }
};

//Cron job time management
// --------------------------- Configurable Time (IST) ---------------------------
const attendanceRunTimeIST = "12:01 AM"; // Change this time for testing

// Convert IST time string into 24h format (hours & minutes)
function parseISTTime(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
}

// --------------------------- Auto Scheduler ---------------------------
// Convert IST -> Cron Expression (system UTC expected)
const { hours, minutes } = parseISTTime(attendanceRunTimeIST);

// Convert IST to UTC (because server may run in UTC)
// const utcDate = new Date(Date.UTC(1970, 0, 1, hours - 5, minutes - 30));
// const utcHours = utcDate.getUTCHours();
// const utcMinutes = utcDate.getUTCMinutes();

// Final cron expression
const cronExp = `${minutes} ${hours} * * *`;
console.log(`Cron job scheduled for ${attendanceRunTimeIST} IST -> ${cronExp}`);

cron.schedule(cronExp, async () => {
    console.log("Running cron job at IST time:", attendanceRunTimeIST);
    await createAttendanceRecords(
        { body: {} }, 
        { status: () => ({ json: () => {} }) } // dummy res for cron run
    );
});
//---------------------------------------------------------------









// Cron job runs at midnight every day

// console.log('Setting up the cron job');
// cron.schedule('0 0 * * *', createAttendanceRecords);

// Manually run the function for testing purpose
// console.log('Running the cron job immediately for testing');
// createAttendanceRecords();  // Call the function immediately to run it now


//--------------------------------------------------------------------------------


// Post api
export const createPost = async (req, res) => {

    console.log("i am inside stident attendance  controller, createPost api")


    try {

        const {

            studentSrn, firstName, fatherName, date, districtId, blockId, schoolId, classofStudent, batch, status, isAttendanceMarked, isAttendanceUpdated, TA

         } = req.body;
        
         const studentAttendance = await StudentAttendance.create( {
            

            studentSrn, firstName, fatherName, date, districtId, blockId, schoolId, classofStudent, batch, status, isAttendanceMarked, isAttendanceUpdated, TA


         })

         res.status(201).json({status: "Success", data: studentAttendance})

    } catch (error) {
        console.log("Student data has not posted to db due to server error", error.message)
    }
}





// API to get attendance based on query params
// API to get attendance based on query params
export const getAllAttendance = async (req, res) => {
    console.log("I am inside attendance controller, getAllAttendance API");

    const {
        studentSrn,
        firstName,
        fatherName,
        date,
        startDate,     // New query param for start date
        endDate,       // New query param for end date
        districtId,
        blockId,
        schoolId,
        classofStudent,
        batch,
        status,
        isAttendanceMarked,
        isAttendanceUpdated,
        absenteeCallingStatus,
    } = req.query;

   

    // Normalize values to arrays if needed
    const districtIds = Array.isArray(districtId) ? districtId : districtId?.split(',') || [];
    
    const schoolIds = Array.isArray(schoolId) ? schoolId : schoolId?.split(',') || [];
    
    const statusList = Array.isArray(status) ? status : status?.split(',') || [];
    const classes = Array.isArray(classofStudent) ? classofStudent : classofStudent?.split(',') || [];

 

    try {
        // Build query object based on the provided query params
        const query = {};

        if (studentSrn) query.studentSrn = studentSrn;
        if (firstName) query.firstName = { $regex: firstName, $options: "i" }; // case-insensitive search
        if (fatherName) query.fatherName = { $regex: fatherName, $options: "i" };
        if (date) query.date = new Date(date); // date in YYYY-MM-DD format
        if (districtId) query.districtId = districtId;
        if (blockId) query.blockId = blockId;
        if (schoolId) query.schoolId = schoolId;
        if (classofStudent) query.classofStudent = classofStudent;
        if (batch) query.batch = batch;
        if (status) query.status = status;
        if (isAttendanceMarked !== undefined) query.isAttendanceMarked = isAttendanceMarked;
        if (isAttendanceUpdated !== undefined) query.isAttendanceUpdated = isAttendanceUpdated;


        

        // // Handle date range filtering if both startDate and endDate are provided
        // if (startDate && endDate) {
        //     // Convert the date strings to Date objects
        //     const start = new Date(startDate);
        //     const end = new Date(endDate);

        //     // Check if the dates are valid and construct the query
        //     if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        //         // Make sure end includes the full day (till 23:59:59.999)
        //         end.setHours(23, 59, 59, 999);
        //         query.date = { $gte: start, $lte: end };
        //     } else {
        //         return res.status(400).json({
        //             status: "Error",
        //             message: "Invalid date range provided"
        //         });
        //     }
        // }

        // Query the database for attendance records based on the constructed query

        const pipeline = [
            {
                $lookup: {
                    from: "students",
                    localField: "studentSrn",
                    foreignField: "studentSrn",
                    as: "studentDetails"
                }
            },
            {
                $unwind: "$studentDetails"
            },
            {
                $match: {
                    ...(districtIds.length && { "studentDetails.districtId": { $in: districtIds } }), // query.districtId ,
                    ...(query.blockId && { "studentDetails.blockId": query.blockId }),
                    ...(schoolIds.length && { "studentDetails.schoolId": { $in: schoolIds } }),
                    // ...(query.date && { "date": query.date }),
                    ...(classes.length && { "studentDetails.classofStudent": { $in: classes } }), // query.classofStudent,
                    ...(statusList.length && { "status": { $in: statusList } }),
                    "studentDetails.isSlcTaken": false,
                    "date":query.date
                }
            }
        ]

        const attendanceRecords = await StudentAttendance.aggregate(pipeline);

        // console.log(attendanceRecords)

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No attendance records found for the given query parameters"
            });
        }

        // Respond with the found attendance records
        res.status(200).json({
            status: "Success",
            data: attendanceRecords
        });
    } catch (error) {
        console.log("Error fetching attendance data from db", error.message);
        res.status(500).json({
            status: "Error",
            message: "Server Error"
        });
    }
};


//_________________________________________________________________________________________________




// Update attendance status by studentSrn and date (PUT). Updates the student's attendance status
export const updateAttendanceBySrnAndDate = async (req, res) => {
    console.log("I am inside attendance controller, updateAttendanceBySrnAndDate API");

    try {
        console.log(" i am inside try block")
        // Extract studentSrn and date from query parameters
        const { studentSrn, date, userId, schoolId, classofStudent, studentAttendanceGamificationDate } = req.query;
       const { isAttendanceMarked, absenteeCallingStatus, callingRemark1, callingRemark2, comments } = req.body; // The field to update (isAttendanceMarked)
        

          // Convert the date from the query param into a Date object
          const attendanceDate = new Date(date)
        

       // console.log(studentSrn, date)
       
        // const isAttendanceMarked = true
        
    //    console.log("i am coming from frontend", absenteeCallingStatus)
    //     console.log("i am coming from frontend is attendance marked", isAttendanceMarked)

        // Ensure both studentSrn and date are provided
        if (!studentSrn || !date) {
            return res.status(400).json({ status: "Error", message: "Missing studentSrn or date in query parameters" });
        }
        
        //Below block updates the student attendance status to "Present" or "Absent".
        let status;

        if (isAttendanceMarked === true){
            status = "Present"
        } else {
            status = "Absent"
        }

        //------------------------------------------------------------------------
        
        //This block updates the absentee-calling fields.
        if (absenteeCallingStatus){


             // Find the student attendance record where both studentSrn and date match, then update the isAttendanceMarked field
        const attendance = await StudentAttendance.findOneAndUpdate(
            { studentSrn, date },  // Find by studentSrn and date
            { absenteeCallingStatus, callingRemark1,callingRemark2 }, // Update the field
            { new: true, runValidators: true } // Return the updated document and validate it
        );




        // If no record was found
        if (!attendance) {
            return res.status(404).json({ status: "Error", message: "Attendance record not found for the given student and date" });
        }

        // Return the updated attendance record
        res.status(200).json({ status: "Success", data: attendance });


        } 
        //This field updates marked attendance field
        else if (isAttendanceMarked !== undefined) {

          //If student is marked present, then absenteeCallingStatus, and callingRemark1 is set to default value
            const absenteeCallingStatus = "Not-called"
            const callingRemark1 = null

             // Find the student attendance record where both studentSrn and date match, then update the isAttendanceMarked field
        const attendance = await StudentAttendance.findOneAndUpdate(
            { studentSrn, date },  // Find by studentSrn and date
            { isAttendanceMarked, status, absenteeCallingStatus, callingRemark1,   }, // Update the field
            { new: true, runValidators: true } // Return the updated document and validate it
        );

    //Handling gamification point.
            
    // const date = loginTime

          const keyValue = "student-attendance"

          const AwardPoints = awardPoints({keyValue, userId, studentAttendanceGamificationDate, schoolId, classofStudent})

    //------------------------------------------------------------

        // If no record was found
        if (!attendance) {
            return res.status(404).json({ status: "Error", message: "Attendance record not found for the given student and date" });
        }

        // Return the updated attendance record
        res.status(200).json({ status: "Success", data: attendance });


        } 

       
    } catch (error) {
        console.log("Error updating attendance", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//___________________________________________________________________













