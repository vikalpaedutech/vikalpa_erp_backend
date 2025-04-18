//All the business logic, APIs and Rest APIs are in this script.

import {Student} from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";


//Post Api

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
        isAttendanceUpdated
    } = req.query;

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

        // Handle date range filtering if both startDate and endDate are provided
        if (startDate && endDate) {
            // Convert the date strings to Date objects
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Check if the dates are valid and construct the query
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                // Make sure end includes the full day (till 23:59:59.999)
                end.setHours(23, 59, 59, 999);
                query.date = { $gte: start, $lte: end };
            } else {
                return res.status(400).json({
                    status: "Error",
                    message: "Invalid date range provided"
                });
            }
        }

        // Query the database for attendance records based on the constructed query
        const attendanceRecords = await StudentAttendance.find(query);

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
        // Extract studentSrn and date from query parameters
        const { studentSrn, date } = req.query;
       const { isAttendanceMarked } = req.body; // The field to update (isAttendanceMarked)

        console.log(studentSrn, date)
       // const isAttendanceMarked = true
        console.log("i am coming from frontend", isAttendanceMarked)

        // Ensure both studentSrn and date are provided
        if (!studentSrn || !date) {
            return res.status(400).json({ status: "Error", message: "Missing studentSrn or date in query parameters" });
        }

        // Convert the date from the query param into a Date object
        const attendanceDate = new Date(date);

        // Find the student attendance record where both studentSrn and date match, then update the isAttendanceMarked field
        const attendance = await StudentAttendance.findOneAndUpdate(
            { studentSrn, date },  // Find by studentSrn and date
            { isAttendanceMarked }, // Update the field
            { new: true, runValidators: true } // Return the updated document and validate it
        );

        // If no record was found
        if (!attendance) {
            return res.status(404).json({ status: "Error", message: "Attendance record not found for the given student and date" });
        }

        // Return the updated attendance record
        res.status(200).json({ status: "Success", data: attendance });
    } catch (error) {
        console.log("Error updating attendance", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//___________________________________________________________________