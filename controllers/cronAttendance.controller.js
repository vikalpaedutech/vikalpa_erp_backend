//Using cron job for attendance controller

// import cron from "node-cron";
// import Student from "../models/student.model.js";
// import { StudentAttendance } from "../models/studentAttendance.model.js";


// // Cron job runs at midnight every day to create attendance records
// cron.schedule('0 0 * * *', async () => {
//   try {
//     const students = await Student.find({}); // Get all students
    
//     students.forEach(async (student) => {
//       const attendanceRecord = new StudentAttendance({
//         studentSrn: student.studentSrn,
//         date: new Date(),
//         districtId: student.district,
//         blockId: student.block,
//         schoolId: student.school,
//         classofStudent: student.classofStudent,
//         batch: student.batch,
//         status: 'Absent', // Default status
//         isAttendanceMarked: false, // Not marked yet
//         isAttendanceUpdated: false, // Not updated yet
//         TA: student.singleSideDistance * student.bothSideDistance, // Example calculation for TA
//       });

//       await attendanceRecord.save(); // Save the attendance data
//     });

//     console.log('Attendance records created for all students');
//   } catch (error) {
//     console.error('Error during attendance dump: ', error);
//   }
// });







//Below is for testing


import cron from "node-cron";
import {Student} from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";

// Function to create attendance records
export const createAttendanceRecords = async () => {
    console.log("I am inside the cron job function");
    try {
        const students = await Student.find({}); // Get all students

        console.log(students);

        console.log(`Found ${students.length} students`);

        // Loop through students and create attendance records
        for (const student of students) {
            console.log(`Processing student with SRN: ${student.studentSrn}`);
            
            const attendanceRecord = new StudentAttendance({
                studentSrn: student.studentSrn,
                firstName: student.firstName ,
                //lastName: student.lastName,
                fatherName: student.fatherName,
                date: new Date().toISOString().split("T")[0], // => "2025-04-10",
                districtId: student.districtId,
                blockId: student.blockId,
                schoolId: student.schoolId,
                classofStudent: student.classofStudent,
                batch: student.batch,
                status: 'Absent', // Default status
                isAttendanceMarked: false, // Not marked yet
                isAttendanceUpdated: false, // Not updated yet
                TA: student.singleSideDistance * student.bothSideDistance, // Example calculation for TA
            });

            await attendanceRecord.save(); // Save the attendance data
            console.log(`Attendance saved for SRN: ${student.studentSrn}`);
        }

        console.log('Attendance records created for all students');
    } catch (error) {
        console.error('Error during attendance dump: ', error);
    }
};

// Cron job runs at midnight every day

// console.log('Setting up the cron job');
// cron.schedule('0 0 * * *', createAttendanceRecords);

// Manually run the function for testing purpose
// console.log('Running the cron job immediately for testing');
// createAttendanceRecords();  // Call the function immediately to run it now