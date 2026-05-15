import cron from "node-cron";
import { Student } from "../models/student.model.js";
import { Marks } from "../models/marks.model.js";  // Import the Marks model
import { ExamAndTest } from "../models/examAndTest.model.js";
import { uploadTestFileToDOStorage } from "../utils/digitalOceanSpacesTestFileUpllad.utils.js";
import path from "path";
import multer from "multer";





// Post API
export const createPost = async (req, res) => {
  ////console.log("I am inside Marks controller, createMarksPost API");

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


export const createMarksRecordCron = async (req, res) => {
    ////console.log("I am inside the cron job function");

    const { examId, classofStudent, medium } = req.body;

    ////console.log(examId)
    ////console.log(req.body)
    try {

        // Check if marks already exist for this examId
        const existingMarks = await Marks.findOne({ examId: examId });
        if (existingMarks) {
            ////console.log(`Test is already created with this id: ${examId}`);
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


        ////console.log(students);
        ////console.log(examAndText);

        // ////console.log(`Found ${students.length} students`);
        // ////console.log(`Found ${examAndText.length} students`);

        // Loop through students and create attendance records
        for (const student of students) {
            // //console.log(`Processing student with SRN: ${student.studentSrn}`);

            const marks = new Marks({
                unqStudentObjectId:student._id,
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
                fileUrl:null

            });

            await marks.save(); // Save the attendance data
            ////console.log(`Marks data intialise for SRN: ${student.studentSrn}`);
        }

        //console.log('Marks records are created for all students');
    } catch (error) {
        console.error('Error during Marks dump: ', error);
    }
};
















// Cron job runs at midnight every day

// //console.log('Setting up the cron job');
// cron.schedule('0 0 * * *', createAttendanceRecords);

// Manually run the function for testing purpose
// //console.log('Running the cron job immediately for testing');
// createAttendanceRecords();  // Call the function immediately to run it now\

//createMarksRecordCron ();



//____________________________________________________________________

//Below API get All posts from data base_________________________________________
export const getPost = async (req, res) => {
  //console.log("I am inside getPost of Marks Controller")
  try {
    const response = await Marks.find();

    res.status(201).json({status: "Success", data: response});

  } catch (error) {
    //console.log("Error Getting Marks", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }

}
//__________________________________________________________________________________




// API to get marks data based on query params
export const getAllMarksUsinQueryParams = async (req, res) => {
    
  //console.log("I am inside marks controller, getAllMarksUsinQueryParams API");

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

      
//console.log(query)
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
        //console.log("Error fetching Marks data from db", error.message);
        res.status(500).json({
            status: "Error",
            message: "Server Error"
        });
    }
};

//_________________________________________________________________________________________________



// // Update marks status by studentSrn and examId (PUT). Updates the student's marks status
// export const updateMarksBySrnAndExamId = async (req, res) => {
//     //console.log("I am inside marks controller, updateMarksBySrnAndExamId API");

//     try {
//         // Extract studentSrn and date from query parameters
//         const { studentSrn, examId, schoolId, userId, classofStudent } = req.query;
//        const { marksObtained, recordedBy, marksUpdatedOn } = req.body; // The field to update (isAttendanceMarked)

//        //console.log('hello marks')
//         //console.log(req.query);
//         //console.log('hello marks')

//         //console.log(studentSrn, examId)
//         //console.log("req.body is:", req.body);

//        // const isAttendanceMarked = true
//         //console.log("i am coming from frontend", marksObtained, recordedBy, marksUpdatedOn)

//         // Ensure both studentSrn and date are provided
//         if (!studentSrn || !examId) {
//             return res.status(400).json({ status: "Error", message: "Missing studentSrn or examId in query parameters" });
//         }

//         // Convert the date from the query param into a Date object
//         //const marksUpdatedOnDate = new Date(date);

//         // Find the student attendance record where both studentSrn and date match, then update the isAttendanceMarked field
//         const marks = await Marks.findOneAndUpdate(
//             { studentSrn, examId },  // Find by studentSrn and date
//             { marksObtained, recordedBy, marksUpdatedOn }, // Update the field
//             { new: true, runValidators: true } // Return the updated document and validate it
//         );



//         //Handling gamification point.
                    
//             // const date = loginTime
        
//                   const keyValue = "makrs-upload"
        
//                   const AwardPoints = awardPoints({keyValue, userId, examId, schoolId, classofStudent})
        
//             //------------------------------------------------------------
        



//         // If no record was found
//         if (!marks) {
//             return res.status(404).json({ status: "Error", message: "Marks record not found for the given student and date" });
//         }

//         // Return the updated attendance record
//         res.status(200).json({ status: "Success", data: marks });
//     } catch (error) {
//         //console.log("Error updating Marks", error.message);
//         res.status(500).json({ status: "Error", message: "Server error" });
//     }
// };
// //___________________________________________________________________








// Update marks status by studentSrn and examId (PUT). Updates the student's marks status
export const updateMarksBySrnAndExamId = async (req, res) => {

    console.log('upload marks cont data')
    try {
        // Extract all data from request body
        const { 
            studentSrn, 
            examId, 
            schoolId, 
            userId, 
            classofStudent, 
            marksObtained, 
            recordedBy, 
            marksUpdatedOn,
            testFileUrl // New field for test file URL
        } = req.body;

        // Ensure both studentSrn and examId are provided
        if (!studentSrn || !examId) {
            return res.status(400).json({ status: "Error", message: "Missing studentSrn or examId in request body" });
        }

        // Create update object
        const updateData = { 
            marksObtained, 
            recordedBy, 
            marksUpdatedOn 
        };

        // Add testFileUrl to update if provided
        if (testFileUrl) {
            updateData.testFileUrl = testFileUrl;
        }

        // Find the student marks record and update it
        const marks = await Marks.findOneAndUpdate(
            { studentSrn, examId },  // Find by studentSrn and examId
            updateData, // Update the fields
            { new: true, runValidators: true } // Return the updated document and validate it
        );

        // Handling gamification point
        const keyValue = "marks-upload";
        const AwardPoints = awardPoints({keyValue, userId, examId, schoolId, classofStudent});

        // If no record was found
        if (!marks) {
            return res.status(404).json({ status: "Error", message: "Marks record not found for the given student and exam" });
        }

        // Return the updated marks record
        res.status(200).json({ status: "Success", data: marks });
    } catch (error) {
        console.log("Error updating Marks", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// New endpoint to upload test file
export const uploadTestFile = async (req, res) => {


    console.log('test file upload')

    try {
        const { studentSrn, examId } = req.body;

        console.log(req.body)

        console.log(req.file)
        
        if (!studentSrn || !examId) {
            return res.status(400).json({ 
                status: "Error", 
                message: "Missing studentSrn or examId" 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                status: "Error", 
                message: "No file uploaded" 
            });
        }

        // Check file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (req.file.size > maxSize) {
            return res.status(400).json({ 
                status: "Error", 
                message: "File size exceeds 10MB limit" 
            });
        }

        // Check file type (allow PDF and images)
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp'
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ 
                status: "Error", 
                message: "Invalid file type. Only PDF and image files are allowed." 
            });
        }

        // Upload to DigitalOcean Spaces
        const fileUrl = await uploadTestFileToDOStorage(
            req.file.buffer,
            studentSrn,
            examId,
            req.file.mimetype
        );

        // Update marks record with file URL
        const marks = await Marks.findOneAndUpdate(
            { studentSrn, examId },
            { fileUrl: fileUrl },
            { new: true }
        );

        res.status(200).json({ 
            status: "Success", 
            message: "File uploaded successfully",
            fileUrl: fileUrl,
            data: marks 
        });

    } catch (error) {
        console.log("Error uploading test file", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};


//Version 2 api


// export const getStudentMarksByExam = async (req, res) => {
//   try {
//     const { 
//       examAndTestId,
//       batch,
//       isSlcTaken,
//       schoolId,      // optional - filter by school
//       districtId,    // optional - filter by district
//       blockId        // optional - filter by block
//     } = req.body;   

//     console.log(req.body)
//     // Validate required fields
//     if (!examAndTestId || !batch || isSlcTaken === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: examAndTestId, batch, isSlcTaken"
//       });
//     }

//     // Verify exam exists
//     const exam = await ExamAndTest.findById(examAndTestId);
//     if (!exam) {
//       return res.status(404).json({
//         success: false,
//         message: "Exam not found"
//       });
//     }

//     // Build match condition dynamically
//     const matchCondition = {
//       batch: batch,
//       isSlcTaken: isSlcTaken
//     };

//     // Add optional filters
//     if (schoolId) matchCondition.schoolId = schoolId;
//     if (districtId) matchCondition.districtId = districtId;
//     if (blockId) matchCondition.blockId = blockId;

//     // console.log("Match condition:", matchCondition);

//     // Aggregation pipeline
//     const studentsWithMarks = await Student.aggregate([
//       {
//         $match: matchCondition
//       },
//       {
//         $lookup: {
//           from: "marks",
//           let: { studentId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$unqStudentObjectId", "$$studentId"] },
//                     { $eq: ["$examAndTestUnqObjectId", { $toObjectId: examAndTestId }] }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: "marksData"
//         }
//       },
//       {
//         $addFields: {
//           marksObtained: { $ifNull: [{ $arrayElemAt: ["$marksData.marksObtained", 0] }, null] },
//           remark: { $ifNull: [{ $arrayElemAt: ["$marksData.remark", 0] }, null] },
//           fileUrl: { $ifNull: [{ $arrayElemAt: ["$marksData.fileUrl", 0] }, null] },
//           marksUpdatedOn: { $ifNull: [{ $arrayElemAt: ["$marksData.marksUpdatedOn", 0] }, null] },
//           marksId: { $ifNull: [{ $arrayElemAt: ["$marksData._id", 0] }, null] },
//           isMarksRecordExist: { $gt: [{ $size: "$marksData" }, 0] },
//           // Add marks percentage if maxMarks available
//           marksPercentage: {
//             $cond: {
//               if: { $and: [
//                 { $ne: [{ $arrayElemAt: ["$marksData.marksObtained", 0] }, null] },
//                 { $ne: [exam.maxMarks, null] },
//                 { $ne: [exam.maxMarks, 0] }
//               ]},
//               then: {
//                 $multiply: [
//                   { $divide: [{ $arrayElemAt: ["$marksData.marksObtained", 0] }, exam.maxMarks] },
//                   100
//                 ]
//               },
//               else: null
//             }
//           }
//         }
//       },
//       {
//         $project: { marksData: 0 }
//       },
//       {
//         $sort: { rollNumber: 1 }
//       }
//     ]);

//     // Also fetch students without marks filter (for debugging)
//     const totalAvailableStudents = await Student.countDocuments(matchCondition);

//     return res.status(200).json({
//       success: true,
     
//       data: {
//         exam: {
//           _id: exam._id,
//           examId: exam.examId,
//           examType: exam.examType,
//           subject: exam.subject,
//           examDate: exam.examDate,
//           maxMarks: exam.maxMarks,
//           passingMarks: exam.passingMarks
//         },
//         filters: {
//           batch,
//           isSlcTaken,
//           schoolId: schoolId || null,
//           districtId: districtId || null,
//           blockId: blockId || null
//         },
//         summary: {
//           totalStudentsFound: studentsWithMarks.length,
//           totalStudentsAvailable: totalAvailableStudents,
//           withMarks: studentsWithMarks.filter(s => s.isMarksRecordExist).length,
//           withoutMarks: studentsWithMarks.filter(s => !s.isMarksRecordExist).length
//         },
//         students: studentsWithMarks.map(student => ({
//           // Student Info
//           _id: student._id,
//           studentSrn: student.studentSrn,
//           rollNumber: student.rollNumber,
//           firstName: student.firstName,
//           fatherName: student.fatherName,
//           motherName: student.motherName,
//           gender: student.gender,
//           category: student.category,
//           // Location Info
//           districtId: student.districtId,
//           blockId: student.blockId,
//           schoolId: student.schoolId,
//           // Class Info
//           classofStudent: student.classofStudent,
//           batch: student.batch,
//           isSlcTaken: student.isSlcTaken,
//           // Marks Info (null if not exist)
//           marksObtained: student.marksObtained,
//           marksPercentage: student.marksPercentage,
//           remark: student.remark,
//           fileUrl: student.fileUrl,
//           marksUpdatedOn: student.marksUpdatedOn,
//           marksId: student.marksId,
//           isMarksRecordExist: student.isMarksRecordExist
//         }))
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



export const getStudentMarksByExam = async (req, res) => {
  try {
    const { 
      examAndTestId,
      batch,
      isSlcTaken,
      schoolId,
      districtId,
      blockId
    } = req.body;

    // Validate required fields
    if (!examAndTestId || !batch || isSlcTaken === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: examAndTestId, batch, isSlcTaken"
      });
    }

    // Verify exam exists
    const exam = await ExamAndTest.findById(examAndTestId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    // Build match condition dynamically
    const matchCondition = {
      batch: batch,
      isSlcTaken: isSlcTaken
    };

    // Add optional filters
    if (schoolId) matchCondition.schoolId = schoolId;
    if (districtId) matchCondition.districtId = districtId;
    if (blockId) matchCondition.blockId = blockId;

    console.log("Match condition:", matchCondition);

    // Aggregation pipeline
    const studentsWithMarks = await Student.aggregate([
      {
        $match: matchCondition
      },
      {
        $lookup: {
          from: "marks",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$unqStudentObjectId", "$$studentId"] },
                    { $eq: ["$examAndTestUnqObjectId", { $toObjectId: examAndTestId }] }
                  ]
                }
              }
            }
          ],
          as: "marksData"
        }
      },
      {
        $addFields: {
          marksObtained: { 
            $ifNull: [{ $arrayElemAt: ["$marksData.marksObtained", 0] }, null] 
          },
          remark: { 
            $ifNull: [{ $arrayElemAt: ["$marksData.remark", 0] }, null] 
          },
          fileUrl: { 
            $ifNull: [{ $arrayElemAt: ["$marksData.fileUrl", 0] }, null] 
          },
          marksUpdatedOn: { 
            $ifNull: [{ $arrayElemAt: ["$marksData.marksUpdatedOn", 0] }, null] 
          },
          marksId: { 
            $ifNull: [{ $arrayElemAt: ["$marksData._id", 0] }, null] 
          },
          isMarksRecordExist: { 
            $gt: [{ $size: "$marksData" }, 0] 
          },
          // Convert marksObtained to number if it's a string
          marksObtainedNumber: {
            $cond: {
              if: { $eq: [{ $type: { $arrayElemAt: ["$marksData.marksObtained", 0] } }, "string"] },
              then: { $toDouble: { $arrayElemAt: ["$marksData.marksObtained", 0] } },
              else: { $arrayElemAt: ["$marksData.marksObtained", 0] }
            }
          }
        }
      },
      {
        $addFields: {
          // Calculate percentage using the converted number
          marksPercentage: {
            $cond: {
              if: { 
                $and: [
                  { $ne: ["$marksObtainedNumber", null] },
                  { $ne: ["$marksObtainedNumber", ""] },
                  { $ne: [exam.maxMarks, null] },
                  { $ne: [exam.maxMarks, 0] }
                ]
              },
              then: {
                $multiply: [
                  { $divide: ["$marksObtainedNumber", exam.maxMarks] },
                  100
                ]
              },
              else: null
            }
          }
        }
      },
      {
        $project: { 
          marksData: 0,
          marksObtainedNumber: 0
        }
      },
      {
        $sort: { rollNumber: 1 }
      }
    ]);

    const totalAvailableStudents = await Student.countDocuments(matchCondition);

    return res.status(200).json({
      success: true,
      data: {
        exam: {
          _id: exam._id,
          examId: exam.examId,
          examType: exam.examType,
          subject: exam.subject,
          examDate: exam.examDate,
          maxMarks: exam.maxMarks,
          passingMarks: exam.passingMarks
        },
        filters: {
          batch,
          isSlcTaken,
          schoolId: schoolId || null,
          districtId: districtId || null,
          blockId: blockId || null
        },
        summary: {
          totalStudentsFound: studentsWithMarks.length,
          totalStudentsAvailable: totalAvailableStudents,
          withMarks: studentsWithMarks.filter(s => s.isMarksRecordExist).length,
          withoutMarks: studentsWithMarks.filter(s => !s.isMarksRecordExist).length
        },
        students: studentsWithMarks.map(student => ({
          _id: student._id,
          studentSrn: student.studentSrn,
          rollNumber: student.rollNumber,
          firstName: student.firstName,
          fatherName: student.fatherName,
          motherName: student.motherName,
          gender: student.gender,
          category: student.category,
          districtId: student.districtId,
          blockId: student.blockId,
          schoolId: student.schoolId,
          classofStudent: student.classofStudent,
          batch: student.batch,
          isSlcTaken: student.isSlcTaken,
          marksObtained: student.marksObtained,
          marksPercentage: student.marksPercentage,
          remark: student.remark,
          fileUrl: student.fileUrl,
          marksUpdatedOn: student.marksUpdatedOn,
          marksId: student.marksId,
          isMarksRecordExist: student.isMarksRecordExist
        }))
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




//UpdateMarks




export const updateMarksByExamAndStudent = async (req, res) => {

console.log('I am inside marks.controller.js, api: updateMarksByExamAndStudent' )

  try {
    const { 
      examAndTestUnqObjectId,  // Required: Exam _id
      unqStudentObjectId,      // Required: Student _id
      studentSrn,              // Optional: Student SRN (if student not found)
      firstName,              // Optional: First name (if student not found)
      fatherName,             // Optional: Father name (if student not found)
      districtId,             // Optional: District ID (if student not found)
      blockId,                // Optional: Block ID (if student not found)
      schoolId,               // Optional: School ID (if student not found)
      classofStudent,         // Optional: Class (if student not found)
      marksObtained,          // Optional: Marks obtained
      remark,                 // Optional: Remark
      fileUrl,                // Optional: File URL
      recordedBy              // Optional: User who recorded
    } = req.body;


    console.log(req.body)

    // Validate required fields
    if (!examAndTestUnqObjectId || !unqStudentObjectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: examAndTestUnqObjectId and unqStudentObjectId"
      });
    }

    // Verify exam exists
    const exam = await ExamAndTest.findById(examAndTestUnqObjectId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    // Try to find student
    let student = await Student.findById(unqStudentObjectId);
    let studentFound = true;

    // Prepare update data
    const updateData = {
      unqStudentObjectId: unqStudentObjectId,
      examAndTestUnqObjectId: examAndTestUnqObjectId,
      examId: exam.examId,
      marksUpdatedOn: new Date()
    };

    if (student) {
      // Student found - use student data
      updateData.studentSrn = student.studentSrn;
      updateData.firstName = student.firstName;
      updateData.fatherName = student.fatherName;
      updateData.districtId = student.districtId;
      updateData.blockId = student.blockId;
      updateData.schoolId = student.schoolId;
      updateData.classofStudent = student.classofStudent;
    } else {
      // Student not found - use provided data or fallback
      studentFound = false;
      updateData.studentSrn = studentSrn || "Unknown";
      updateData.firstName = firstName || "Unknown";
      updateData.fatherName = fatherName || "Unknown";
      updateData.districtId = districtId || "Unknown";
      updateData.blockId = blockId || "Unknown";
      updateData.schoolId = schoolId || "Unknown";
      updateData.classofStudent = classofStudent || "Unknown";
    }

    // Add optional fields if provided
    if (marksObtained !== undefined && marksObtained !== "") {
      updateData.marksObtained = marksObtained;
    }
    if (remark !== undefined) {
      updateData.remark = remark;
    }
    if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl;
    }
    if (recordedBy !== undefined) {
      updateData.recordedBy = recordedBy;
    }

    // Check if marks document exists
    const existingMark = await Marks.findOne({
      examAndTestUnqObjectId: examAndTestUnqObjectId,
      unqStudentObjectId: unqStudentObjectId
    });

    let result;
    let operation;

    if (existingMark) {
      // Update existing marks document
      result = await Marks.findByIdAndUpdate(
        existingMark._id,
        { $set: updateData },
        { new: true }
      );
      operation = "updated";
    } else {
      // Create new marks document
      const newMark = new Marks(updateData);
      result = await newMark.save();
      operation = "inserted";
    }

    return res.status(200).json({
      success: true,
      message: `Marks ${operation} successfully`,
      data: {
        operation: operation,
        studentFound: studentFound,
        exam: {
          _id: exam._id,
          examId: exam.examId,
          subject: exam.subject,
          examType: exam.examType,
          maxMarks: exam.maxMarks
        },
        student: student ? {
          _id: student._id,
          studentSrn: student.studentSrn,
          firstName: student.firstName,
          fatherName: student.fatherName,
          classofStudent: student.classofStudent
        } : {
          _id: unqStudentObjectId,
          studentSrn: studentSrn || "Unknown",
          firstName: firstName || "Unknown",
          fatherName: fatherName || "Unknown",
          classofStudent: classofStudent || "Unknown",
          note: "Student not found in database, using provided data"
        },
        marks: {
          _id: result._id,
          unqStudentObjectId: result.unqStudentObjectId,
          examAndTestUnqObjectId: result.examAndTestUnqObjectId,
          marksObtained: result.marksObtained,
          remark: result.remark,
          fileUrl: result.fileUrl,
          recordedBy: result.recordedBy,
          marksUpdatedOn: result.marksUpdatedOn
        }
      }
    });

  } catch (error) {
    console.error("Error in updateMarksByExamAndStudent:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};