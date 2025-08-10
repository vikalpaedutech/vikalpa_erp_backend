import cron from "node-cron";
import { Student } from "../models/student.model.js";
import { Marks } from "../models/marks.model.js";  // Import the Marks model
import { ExamAndTest } from "../models/examAndTest.model.js";



//Gamfication utility
import {awardPoints} from "../utils/gamification.utils.js"




// Post API
export const createPost = async (req, res) => {
  console.log("I am inside Marks controller, createMarksPost API");

  try {
    // Destructure the required fields from the request body
    const { studentSrn, firstName, fatherName, districtId, blockId, schoolId, classofStudent, examId, marksObtained, recordedBy, remark } = req.body;

    // Validate input data (basic example)
    if (!studentSrn || !firstName || !fatherName || !districtId || !blockId || !schoolId || !classofStudent || !examId || !marksObtained || !recordedBy) {
      return res.status(400).json({ status: "Failed", message: "All fields except 'remark' are required" });
    }

    // Create a new marks record
    const marks = await Marks.create({
      studentSrn,
      firstName,
      fatherName,
      districtId,
      blockId,
      schoolId,
      classofStudent,
      examId,
      marksObtained,
      recordedBy,
      remark, // 'remark' is optional
    });

    // Respond with success and the created marks data
    res.status(201).json({ status: "Success", data: marks });
    
  } catch (error) {
    // Catch any errors and send a failure response
    res.status(500).json({ status: "Failed", message: error.message });
  }
};





// Below api is a cron job api. Which is created to initailize marks data in db, in marksandtext db so that user,
//... can update students marks.
// export const createMarksRecordCron = async (req, res) => {
//     console.log("I am inside the cron job function");

//   const {examId, classofStudent, medium} = req.body;

// console.log(examId)
// console.log(req.body)
//     try {

//           // Check if marks already exist for this examId
//         const existingMarks = await Marks.findOne({ examId: examId });
//         if (existingMarks) {
//             console.log(`Test is already created with this id: ${examId}`);
//            res.status(400).json({ message: `Test is already created with this examId: ${examId}` });
//           return;
//           }


//         const students = await Student.find({
//           classofStudent: classofStudent, 
//           medium: medium
//         }); // Get all students
//         const examAndText = await ExamAndTest.find({});


//         console.log(students);
//         console.log(examAndText);

//         // console.log(`Found ${students.length} students`);
//         // console.log(`Found ${examAndText.length} students`);

//         // Loop through students and create attendance records
//         for (const student of students) {
//             // console.log(`Processing student with SRN: ${student.studentSrn}`);
            
//             const marks = new Marks({
//                 studentSrn: student.studentSrn,
//                 firstName: student.firstName ,
//                 //lastName: student.lastName,
//                 fatherName: student.fatherName,
//                 date: new Date().toISOString().split("T")[0], // => "2025-04-10",
//                 districtId: student.districtId,
//                 blockId: student.blockId,
//                 schoolId: student.schoolId,
//                 classofStudent: student.classofStudent,
//                 examId: examId,
//                 marksObtained: "",
//                 recordedBy: "",
//                 remark: "", // Default status
//                 marksUpdatedOn: "", // Not marked yet
               
//             });

//             await marks.save(); // Save the attendance data
//             console.log(`Marks data intialise for SRN: ${student.studentSrn}`);
//         }

//         console.log('Marks records are created for all students');
//     } catch (error) {
//         console.error('Error during Marks dump: ', error);
//     }
// };














export const createMarksRecordCron = async (req, res) => {
    console.log("I am inside the cron job function");

    const { examId, classofStudent, medium } = req.body;

    console.log(examId)
    console.log(req.body)
    try {

        // Check if marks already exist for this examId
        const existingMarks = await Marks.findOne({ examId: examId });
        if (existingMarks) {
            console.log(`Test is already created with this id: ${examId}`);
            res.status(400).json({ message: `Test is already created with this examId: ${examId}` });
            return;
        }

        let mediumFilter = {};
        if (medium === "CBSE_HBSE") {
            mediumFilter = { medium: { $in: ["CBSE", "HBSE"] } };
        } else {
            mediumFilter = { medium: medium };
        }

        const students = await Student.find({
            classofStudent: classofStudent,
            ...mediumFilter,
            isSlcTaken: false
        }); // Get all students
        const examAndText = await ExamAndTest.find({});


        console.log(students);
        console.log(examAndText);

        // console.log(`Found ${students.length} students`);
        // console.log(`Found ${examAndText.length} students`);

        // Loop through students and create attendance records
        for (const student of students) {
            // console.log(`Processing student with SRN: ${student.studentSrn}`);

            const marks = new Marks({
                studentSrn: student.studentSrn,
                firstName: student.firstName,
                //lastName: student.lastName,
                fatherName: student.fatherName,
                date: new Date().toISOString().split("T")[0], // => "2025-04-10",
                districtId: student.districtId,
                blockId: student.blockId,
                schoolId: student.schoolId,
                classofStudent: student.classofStudent,
                examId: examId,
                marksObtained: "",
                recordedBy: "",
                remark: "", // Default status
                marksUpdatedOn: "", // Not marked yet

            });

            await marks.save(); // Save the attendance data
            console.log(`Marks data intialise for SRN: ${student.studentSrn}`);
        }

        console.log('Marks records are created for all students');
    } catch (error) {
        console.error('Error during Marks dump: ', error);
    }
};
















// Cron job runs at midnight every day

// console.log('Setting up the cron job');
// cron.schedule('0 0 * * *', createAttendanceRecords);

// Manually run the function for testing purpose
// console.log('Running the cron job immediately for testing');
// createAttendanceRecords();  // Call the function immediately to run it now\

//createMarksRecordCron ();



//____________________________________________________________________

//Below API get All posts from data base_________________________________________
export const getPost = async (req, res) => {
  console.log("I am inside getPost of Marks Controller")
  try {
    const response = await Marks.find();

    res.status(201).json({status: "Success", data: response});

  } catch (error) {
    console.log("Error Getting Marks", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }

}
//__________________________________________________________________________________




// API to get marks data based on query params
export const getAllMarksUsinQueryParams = async (req, res) => {
    
  console.log("I am inside marks controller, getAllMarksUsinQueryParams API");

    const {
      studentSrn,
      firstName,
      fatherName,
      districtId,
      blockId,     // New query param for start date
      schoolId,       // New query param for end date
      classofStudent,
      examId,
      marksObtained,
      recordedBy,
      remark,
      marksUpdatedOn,

    } = req.query;


    const schoolIds = Array.isArray(schoolId) ? schoolId : schoolId?.split(',') || [];
    const classofStudents = Array.isArray(classofStudent) ? classofStudent : classofStudent?.split(',') || [];
    
    
    try {
        // Build query object based on the provided query params
        const query = {};

        if (studentSrn) query.studentSrn = studentSrn;
        if (firstName) query.firstName = { $regex: firstName, $options: "i" }; // case-insensitive search
        if (fatherName) query.fatherName = { $regex: fatherName, $options: "i" };
  
        if (districtId) query.districtId = districtId;
        if (blockId) query.blockId = blockId;
        if (schoolIds) query.schoolId = {$in:schoolIds};
        if (classofStudents) query.classofStudent = {$in:classofStudents};
        if (examId) query.examId = examId;
        if (marksObtained) query.marksObtained = marksObtained;
       
        if (recordedBy) query.recordedBy = recordedBy;
        if (remark) query.remark = remark;
        if (marksUpdatedOn) query.marksUpdatedOn = marksUpdatedOn;
        if (examId) query.examId = examId;

      
console.log(query)
        // Query the database for attendance records based on the constructed query
        const marks = await Marks.find(query);

        if (!marks || marks.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No Marks records found for the given query parameters"
            });
        }

        // Respond with the found attendance records
        res.status(200).json({
            status: "Success",
            data: marks
        });
    } catch (error) {
        console.log("Error fetching Marks data from db", error.message);
        res.status(500).json({
            status: "Error",
            message: "Server Error"
        });
    }
};

//_________________________________________________________________________________________________



// Update marks status by studentSrn and examId (PUT). Updates the student's marks status
export const updateMarksBySrnAndExamId = async (req, res) => {
    console.log("I am inside marks controller, updateMarksBySrnAndExamId API");

    try {
        // Extract studentSrn and date from query parameters
        const { studentSrn, examId, schoolId, userId, classofStudent } = req.query;
       const { marksObtained, recordedBy, marksUpdatedOn } = req.body; // The field to update (isAttendanceMarked)

       console.log('hello marks')
        console.log(req.query);
        console.log('hello marks')

        console.log(studentSrn, examId)
        console.log("req.body is:", req.body);

       // const isAttendanceMarked = true
        console.log("i am coming from frontend", marksObtained, recordedBy, marksUpdatedOn)

        // Ensure both studentSrn and date are provided
        if (!studentSrn || !examId) {
            return res.status(400).json({ status: "Error", message: "Missing studentSrn or examId in query parameters" });
        }

        // Convert the date from the query param into a Date object
        //const marksUpdatedOnDate = new Date(date);

        // Find the student attendance record where both studentSrn and date match, then update the isAttendanceMarked field
        const marks = await Marks.findOneAndUpdate(
            { studentSrn, examId },  // Find by studentSrn and date
            { marksObtained, recordedBy, marksUpdatedOn }, // Update the field
            { new: true, runValidators: true } // Return the updated document and validate it
        );



        //Handling gamification point.
                    
            // const date = loginTime
        
                  const keyValue = "makrs-upload"
        
                  const AwardPoints = awardPoints({keyValue, userId, examId, schoolId, classofStudent})
        
            //------------------------------------------------------------
        



        // If no record was found
        if (!marks) {
            return res.status(404).json({ status: "Error", message: "Marks record not found for the given student and date" });
        }

        // Return the updated attendance record
        res.status(200).json({ status: "Success", data: marks });
    } catch (error) {
        console.log("Error updating Marks", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//___________________________________________________________________