//Writing all the Business logic, Rest APIs, for student.model.js;

import mongoose from "mongoose";

// import { Student } from "../models/Student.model.js";

// import  {Student}  from "../models/student.model.js"
// import  StudentDb  from "../models/student.model.js";

import path from "path";
import multer from "multer";
import AWS from "aws-sdk"; 
import {Student}  from "../models/student.model.js";


import { District_Block_School } from "../models/district_block_school.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";


export const createPost = async (req, res) => {

    console.log("i am inside student controller, createPost api")


    try {

        const {studentSrn, rollNumber, firstName, fatherName, motherName,email, personalContact,
            ParentContact, otherContact, dob, gender, category, address,districtId, blockId, schoolId, classofStudent, 
            parent, enrollmentDate, batch, session, documents, singleSideDistance, bothSideDistance, slc, isSlcTaken,
            slcReleasingDate, erpEnrollingDate, medium, isStudentOf, isDressGiven, isTabGiven, tabIMEI, isSimGiven,
            simNumber, simIMSI, bankName, bankIFSC, bankAccNumber, bankHolderName, batchCompleted
         } = req.body;
        
         const student = await Student.create( {
            

            studentSrn, rollNumber, firstName, fatherName, motherName,email, personalContact,
            ParentContact, otherContact, dob, gender, category, address,districtId, blockId, schoolId, classofStudent, 
            parent, enrollmentDate, batch, session, documents, singleSideDistance, bothSideDistance, slc, isSlcTaken,
            slcReleasingDate, erpEnrollingDate, medium, isStudentOf, isDressGiven, isTabGiven, tabIMEI, isSimGiven,
            simNumber, simIMSI, bankName, bankIFSC, bankAccNumber, bankHolderName, batchCompleted

         })

         res.status(201).json({status: "Success", data: student})

    } catch (error) {
        console.log("Student data has not posted to db due to server error", error.message)
    }
}


//isSlcTaken === false
//Get API for fetching all students in backend. 
export const getStudentIfisSlcTakenIsFalse = async (req, res) => {
    console.log("I am inside student controller, getStudent api");

    try {
        // const { studentSrn, id } = req.params;

        // Find student whose slc isSlcTaken status is false. That means they have not release their slc and still our students
        const student = await Student.find({isSlcTaken: false });

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", data: student });
        // console.log(student)
    } catch (error) {
        console.log("Error fetching student data from DB", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//________________________________________________________________________________

//Below API shows all the students dta with all the database fields.

export const getAllStudents = async (req, res) => {

    console.log("I am inside student controller, getAllStudents api");


    try {
        const student = await Student.find();
        if (!student){
            
          return res.status(404).json({status: "Error", message: "Student not found"})
        
        }
        
        res.status(200).json({status: "Success", data: student})
    
      } catch (error) {
        
        console.log("Error fetching studnts data from db", error.message)
       
        res.status(500).json({status: "Eroor" , message: "Server Error"})
    
      }

    


}

//____________________________________________________________________


// PUT API to update student by SRN
export const updateStudentBySrn = async (req, res) => {
    console.log("I am inside student controller, updateStudentBySrn api");

    try {
        const { studentSrn } = req.params;

        // Find the student by studentSrn
        const student = await Student.findOneAndUpdate(
            { studentSrn },
            req.body, // This will update the student with the data in the request body
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", data: student });
    } catch (error) {
        console.log("Error updating student data", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//____________________________________________________________________________


// PATCH API to update student data by SRN
export const patchStudentBySrn = async (req, res) => {
    console.log("I am inside student controller, patchStudentBySrn api");

    try {
        const { studentSrn } = req.params;

        // Find the student by studentSrn and update only the fields provided in the request body
        const student = await Student.findOneAndUpdate(
            { studentSrn },
            req.body, // Partially update the student with the provided fields in the request body
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", data: student });
    } catch (error) {
        console.log("Error patching student data", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

//________________________________________________________________


// DELETE API to delete student by SRN
export const deleteStudentBySrn = async (req, res) => {
    console.log("I am inside student controller, deleteStudentBySrn api");

    try {
        const { studentSrn } = req.params;

        // Find and delete the student based on studentSrn
        const student = await Student.findOneAndDelete({ studentSrn });

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", message: "Student deleted successfully" });
    } catch (error) {
        console.log("Error deleting student data", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};


//___________________________________________________________________


//Api for getting students by query parmas.

export const getStudentsByQueryParams = async (req, res) => {
  console.log("I am inside get students by query params");

  const {
    studentSrn,
    rollNumber,
    firstName,
    fatherName,
    districtId,
    blockId,
    schoolId,
    classofStudent,
  } = req.query;

  const schoolIds = Array.isArray(schoolId)
    ? schoolId
    : schoolId?.split(",") || [];

  const classofStudents = Array.isArray(classofStudent)
    ? classofStudent
    : classofStudent?.split(",") || [];

  try {
    const matchQuery = {};
    if (studentSrn) matchQuery.studentSrn = studentSrn;
    if (rollNumber) matchQuery.rollNumber = rollNumber;
    if (firstName)
      matchQuery.firstName = { $regex: `^${firstName}`, $options: "i" };
    if (fatherName) matchQuery.fatherName = fatherName;
    if (districtId) matchQuery.districtId = districtId;
    if (blockId) matchQuery.blockId = blockId;
    if (schoolIds.length) matchQuery.schoolId = { $in: schoolIds };
    if (classofStudents.length)
      matchQuery.classofStudent = { $in: classofStudents };

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "studentdisciplinaries",
          localField: "studentSrn",
          foreignField: "studentSrn",
          as: "disciplinaryRecords",
        },
      },
      {
        $addFields: {
          disciplinaryCount: {
            $size: {
              $filter: {
                input: "$disciplinaryRecords",
                as: "record",
                cond: { $eq: ["$$record.status", "Disciplinary"] },
              },
            },
          },
          countOfNotesChecking: {
            $size: {
              $filter: {
                input: "$disciplinaryRecords",
                as: "record",
                cond: { $eq: ["$$record.status", "Copy Checking"] },
              },
            },
          },
          todayCopyChecking: {
            $filter: {
              input: "$disciplinaryRecords",
              as: "record",
              cond: {
                $and: [
                  { $eq: ["$$record.status", "Copy Checking"] },
                  {
                    $eq: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$$record.createdAt",
                        },
                      },
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: new Date(),
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          disciplinaryRecords: 0,
        },
      },
    ];

    const students = await Student.aggregate(pipeline);

    res.status(200).json({ status: "Success", data: students });
  } catch (error) {
    console.error("Error in getStudentsByQueryParams:", error);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};




//Below controller takes the file from frontend and uploads it in the drive
//Dress size form
// Multer memory storage
const storage = multer.memoryStorage();
export const uploadDressSizePdf = multer({ storage }).single("dressSizeConfirmationForm");
// Controller
export const uploadDressSizeConfirmationForm = async (req, res) => {
  try {
    const { studentSrn } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ status: "Error", message: "No file uploaded" });
    }

    // DigitalOcean Spaces configuration
    const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || "https://blr1.digitaloceanspaces.com");
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: process.env.DO_SPACES_KEY || "DO00PWB6WHQMX2R4GED9",
      secretAccessKey: process.env.DO_SPACES_SECRET || "F06Kgqhk88UCiCWqINK3K8fgis9Ba5TCBLOqa6sqWls",
      region: process.env.DO_SPACES_REGION || "blr1",
    });

    // Create file name and path
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${studentSrn}_dressSizeConfirmation.${fileExt}`;
    const filePath = `dressSizeConfirmationForm/${fileName}`;

    // Upload to DO Spaces
    const uploadParams = {
      Bucket: process.env.DO_SPACES_BUCKET || "vikalpaexamination",
      Key: filePath,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    const fileUrl = uploadResult.Location; // Public URL of uploaded PDF

    // Update student document
    const student = await Student.findOneAndUpdate(
      { studentSrn },
      { dressSizeConfirmationForm: fileUrl },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ status: "Error", message: "Student not found" });
    }

    res.status(200).json({
      status: "Success",
      message: "Dress size confirmation PDF uploaded successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error uploading dress size PDF:", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }
};







//Get students by classOfStudent and slc status

export const GetStudentsBySlc = async (req, res) =>{



 try {
  const response = await Student.find({slc: true,  classofStudent:'9'})

      res.status(200).json({
      status: "Success",
     datalen: response.length,
      data: response,
      
    });
 } catch (error) {
   
    res.status(500).json({ status: "Error", message: "Server error" });
 }
}














//Version 2 apis 11-May-2026

// export const GetMBStudents = async (req, res) => {
//   try {
//     const { districtId, blockId, schoolId, batch, isSlcTaken } = req.body;

//     console.log(req.body)

//     console.log("i am inside 'student.controller.js' and api: 'GetMBStudents'")
    
//     // Build dynamic query object
//     let query = {};
    
//     // Add filters only if they are provided
//     if (districtId && districtId.length > 0) {
//       query.districtId = { $in: districtId };
//     }
    
//     if (blockId && blockId.length > 0) {
//       query.blockId = { $in: blockId };
//     }
    
//     if (schoolId && schoolId.length > 0) {
//       query.schoolId = { $in: schoolId };
//     }
    
//     if (batch && batch.length > 0) {
//       query.batch = { $in: batch };
//     }
    
//     if (isSlcTaken !== undefined && isSlcTaken !== null && isSlcTaken !== '') {
//       query.isSlcTaken = isSlcTaken;
//     }

//     console.log(query)
    
//     // If no filters provided, query will be empty {} which returns all documents
//     const students = await Student.find(query);
    
//     return res.status(200).json({
//       success: true,
//       data: students,
//       count: students.length,
//       filters: query
//     });
    
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching students",
//       error: error.message
//     });
//   }
// };











// Version 2 apis 11-May-2026



// export const GetMBStudents = async (req, res) => {
//   try {
//     const { 
//       districtId, 
//       blockId, 
//       schoolId, 
//       batch, 
     
//       startDate  // Single date only
//     } = req.body;
//  let  isSlcTaken = false;
//     console.log(req.body)
//     console.log("i am inside 'student.controller.js' and api: 'GetMBStudents'")
    
//     // Build dynamic query object for students
//     let studentQuery = {};
    
//     if (districtId && districtId.length > 0) {
//       studentQuery.districtId = { $in: districtId };
//     }
    
//     if (blockId && blockId.length > 0) {
//       studentQuery.blockId = { $in: blockId };
//     }
    
//     if (schoolId && schoolId.length > 0) {
//       studentQuery.schoolId = { $in: schoolId };
//     }
    
//     if (batch && batch.length > 0) {
//       studentQuery.batch = { $in: batch };
//     }
    
//     if (isSlcTaken !== undefined && isSlcTaken !== null && isSlcTaken !== '') {
//       studentQuery.isSlcTaken = isSlcTaken;
//     }

//     console.log(studentQuery)
    
//     // Get students
//     const students = await Student.find(studentQuery);
    
//     if (students.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: [],
//         count: 0,
//         filters: studentQuery
//       });
//     }
    
//     // Set date for attendance - SINGLE DATE ONLY
//     let targetDate;
    
//     if (startDate) {
//       // Create date from startDate string (YYYY-MM-DD) with time set to 00:00:00 in local timezone
//       const [year, month, day] = startDate.split('-').map(Number);
//       targetDate = new Date(year, month - 1, day, 0, 0, 0);
//     } else {
//       // Default to current date with time set to 00:00:00 in local timezone
//       const currentDate = new Date();
//       targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
//     }
    
//     // Create end of day for the same date (23:59:59.999)
//     const endOfDay = new Date(targetDate);
//     endOfDay.setHours(23, 59, 59, 999);
    
//     console.log("Target Date:", {
//       startDate: targetDate,
//       endOfDay: endOfDay,
//       ISOString: targetDate.toISOString(),
//       localString: targetDate.toString()
//     });
    
//     // Get student IDs
//     const studentIds = students.map(s => s._id);
    
//     // Fetch existing attendance records from database for the single date
//     const existingAttendanceRecords = await StudentAttendance.find({
//       unqStudentObjectId: { $in: studentIds },
//       date: { $gte: targetDate, $lte: endOfDay }
//     });
    
//     console.log(`Found ${existingAttendanceRecords.length} attendance records for date: ${targetDate.toDateString()}`);
    
//     // Create a map for quick lookup: studentId -> attendance record
//     const attendanceMap = new Map();
//     existingAttendanceRecords.forEach(record => {
//       const studentId = record.unqStudentObjectId.toString();
//       attendanceMap.set(studentId, record);
//     });
    
//     // Attach attendance to each student
//     const studentsWithAttendance = students.map(student => {
//       const studentId = student._id.toString();
//       const existingRecord = attendanceMap.get(studentId);
      
//       let attendanceRecord = null;
//       let status = "Absent";
//       let isAttendanceMarked = false;
      
//       if (existingRecord) {
//         // Record exists in database - use actual status
//         attendanceRecord = existingRecord.toObject();
//         status = existingRecord.status;
//         isAttendanceMarked = existingRecord.isAttendanceMarked || false;
//       } else {
//         // No record in database - create dummy record for display
//         attendanceRecord = {
//           _id: `dummy_${studentId}_${targetDate.toISOString().split('T')[0]}`,
//           unqStudentObjectId: student._id,
//           date: targetDate,
//           status: "Absent",
//           isAttendanceMarked: false,
//           TA: 0,
//           absenteeCallingStatus: null,
//           callingRemark1: null,
//           callingRemark2: null,
//           comments: null,
//           isDummy: true,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         };
//         status = "Absent";
//         isAttendanceMarked = false;
//       }
      
//       // Convert to plain object and add attendance fields
//       const studentObj = student.toObject();
//       studentObj.attendanceRecord = attendanceRecord;
//       studentObj.attendanceStatus = status;
//       studentObj.isAttendanceMarked = isAttendanceMarked;
//       studentObj.attendanceDate = targetDate;
      
//       return studentObj;
//     });
    
//     return res.status(200).json({
//       success: true,
//       data: studentsWithAttendance,
//       count: studentsWithAttendance.length,
//       filters: studentQuery,
//       selectedDate: {
//         date: targetDate,
//         dateString: targetDate.toISOString().split('T')[0],
//         formattedDate: targetDate.toLocaleDateString('en-IN')
//       }
//     });
    
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching students",
//       error: error.message
//     });
//   }
// };






export const GetMBStudents = async (req, res) => {
  try {
    const { 
      districtId, 
      blockId, 
      schoolId, 
      batch, 
      startDate  // Single date only (YYYY-MM-DD)
    } = req.body;
    
    let isSlcTaken = false;
    console.log(req.body);
    console.log("i am inside 'student.controller.js' and api: 'GetMBStudents'");
    
    // Build dynamic query object for students
    let studentQuery = {};
    
    if (districtId && districtId.length > 0) {
      studentQuery.districtId = { $in: districtId };
    }
    
    if (blockId && blockId.length > 0) {
      studentQuery.blockId = { $in: blockId };
    }
    
    if (schoolId && schoolId.length > 0) {
      studentQuery.schoolId = { $in: schoolId };
    }
    
    if (batch && batch.length > 0) {
      studentQuery.batch = { $in: batch };
    }
    
    if (isSlcTaken !== undefined && isSlcTaken !== null && isSlcTaken !== '') {
      studentQuery.isSlcTaken = isSlcTaken;
    }

    console.log("Student Query:", studentQuery);
    
    // Get students
    const students = await Student.find(studentQuery);
    
    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        filters: studentQuery
      });
    }
    
    // Set date for attendance - SINGLE DATE ONLY with UTC timezone
    let startOfDayUTC;
    let endOfDayUTC;
    let dateString;
    let resultDate
    
    if (startDate) {
      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = startDate.split('-').map(Number);
      
      // Create UTC date for start of day (00:00:00.000 UTC)
      startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    //   startOfDayUTC =new Date(startDate + 'T00:00:00Z');
    //   startOfDayUTC.setUTCDate(startOfDayUTC.getUTCDate() + 2);

    //   resultDate = startOfDayUTC.toISOString(); // '2026-05-15T00:00:00.000Z'
    //  console.log(resultDate)
      
      // Create UTC date for end of day (23:59:59.999 UTC)
      endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      
      dateString = startDate;
    } else {
      // Default to current date in UTC
      const currentDate = new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth();
      const day = currentDate.getUTCDate();
      
      startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      
      dateString = startOfDayUTC.toISOString().split('T')[0];
    }
    
    console.log("Target Date Range (UTC):", {
      startOfDayUTC: startOfDayUTC.toISOString(),
      endOfDayUTC: endOfDayUTC.toISOString(),
      dateString: dateString,
      startTimestamp: startOfDayUTC.getTime(),
      endTimestamp: endOfDayUTC.getTime()
    });
    
    // Get student IDs
    const studentIds = students.map(s => s._id);
    
    // Fetch existing attendance records for the single date using UTC range
    const existingAttendanceRecords = await StudentAttendance.find({
      unqStudentObjectId: { $in: studentIds },
      date: { 
        $gte: startOfDayUTC,
        $lte: endOfDayUTC
      }
    });
    
    console.log(`Found ${existingAttendanceRecords.length} attendance records for date: ${dateString}`);
    
    // Create a map for quick lookup: studentId -> attendance record
    const attendanceMap = new Map();
    existingAttendanceRecords.forEach(record => {
      const studentId = record.unqStudentObjectId.toString();
      attendanceMap.set(studentId, record);
    });
    
    // Attach attendance to each student
    const studentsWithAttendance = students.map(student => {
      const studentId = student._id.toString();
      const existingRecord = attendanceMap.get(studentId);
      
      let attendanceRecord = null;
      let status = "Absent";
      let isAttendanceMarked = false;
      
      if (existingRecord) {
        // Record exists in database - use actual status
        attendanceRecord = existingRecord.toObject();
        status = existingRecord.status;
        isAttendanceMarked = existingRecord.isAttendanceMarked || false;
      } else {
        // No record in database - create dummy record for display
        attendanceRecord = {
          _id: `dummy_${studentId}_${dateString}`,
          unqStudentObjectId: student._id,
          date: startOfDayUTC,
          status: "Absent",
          isAttendanceMarked: false,
          TA: 0,
          absenteeCallingStatus: null,
          callingRemark1: null,
          callingRemark2: null,
          comments: null,
          isDummy: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        status = "Absent";
        isAttendanceMarked = false;
      }
      
      // Convert to plain object and add attendance fields
      const studentObj = student.toObject();
      studentObj.attendanceRecord = attendanceRecord;
      studentObj.attendanceStatus = status;
      studentObj.isAttendanceMarked = isAttendanceMarked;
      studentObj.attendanceDate = startOfDayUTC;
      
      return studentObj;
    });
    
    return res.status(200).json({
      success: true,
      data: studentsWithAttendance,
      count: studentsWithAttendance.length,
      filters: studentQuery,
      selectedDate: {
        date: startOfDayUTC,
        dateString: dateString,
        formattedDate: startOfDayUTC.toLocaleDateString('en-IN', { timeZone: 'UTC' }),
        startOfDayUTC: startOfDayUTC.toISOString(),
        endOfDayUTC: endOfDayUTC.toISOString()
      }
    });
    
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message
    });
  }
};





// Marking student attendance
export const MarkMBStudentAttendance = async (req, res) => {
  try {
    const { _id, status, isAttendanceMarked, startDate } = req.body;

    console.log("I am inside student.controller.js and api: MarkMBStudentAttendance")
    console.log(req.body)

    // Validation
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required (Present/Absent)"
      });
    }

    // Set target date - use startDate if provided, otherwise use current date
    let targetDate;
    let dateString; // Store as YYYY-MM-DD for consistency
    
    if (startDate) {
      // Use the date string as is for storage
      dateString = startDate;
      
      // Create UTC date at midnight (00:00:00.000Z)
      // This ensures the date is stored with zero hours in UTC
      const [year, month, day] = startDate.split('-').map(Number);
      targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    } else {
      // Default to current date in UTC at midnight
      const currentDate = new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth();
      const day = currentDate.getUTCDate();
      targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
      dateString = targetDate.toISOString().split('T')[0];
    }
    
    console.log("Target Date Details:", {
      receivedStartDate: startDate,
      targetDate: targetDate,
      ISOString: targetDate.toISOString(),
      dateString: dateString,
      UTC: targetDate.toUTCString(),
      Local: targetDate.toString()
    });

    // Create date boundaries for query (using UTC)
    const startOfDay = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      0, 0, 0
    ));
    
    const endOfDay = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      23, 59, 59, 999
    ));

    // Check if attendance already exists for this student on the target date
    const existingAttendance = await StudentAttendance.findOne({
      unqStudentObjectId: _id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // If exists, update the attendance
    if (existingAttendance) {
      const updatedAttendance = await StudentAttendance.findByIdAndUpdate(
        existingAttendance._id,
        {
          status: status,
          isAttendanceMarked: isAttendanceMarked !== undefined ? isAttendanceMarked : true,
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log("Updated Attendance Date:", {
        storedDate: updatedAttendance.date,
        storedISO: updatedAttendance.date.toISOString(),
        expectedDate: dateString
      });

      return res.status(200).json({
        success: true,
        message: `Attendance updated successfully for ${dateString}`,
        data: updatedAttendance,
        attendanceDate: targetDate,
        dateString: dateString
      });
    }

    // If not exists, create new attendance record with UTC midnight date
    const attendanceRecord = {
      unqStudentObjectId: _id,
      date: targetDate, // This will be stored as UTC midnight (00:00:00.000Z)
      status: status,
      isAttendanceMarked: isAttendanceMarked !== undefined ? isAttendanceMarked : true,
      absenteeCallingStatus: null,
      callingRemark1: null,
      callingRemark2: null,
      comments: null,
    };

    const newAttendance = new StudentAttendance(attendanceRecord);
    await newAttendance.save();

    console.log("Saved Attendance:", {
      id: newAttendance._id,
      storedDate: newAttendance.date,
      storedISO: newAttendance.date.toISOString(),
      expectedDate: dateString,
      expectedISO: `${dateString}T00:00:00.000Z`
    });

    return res.status(201).json({
      success: true,
      message: `Attendance marked successfully for ${dateString}`,
      data: newAttendance,
      attendanceDate: targetDate,
      dateString: dateString
    });

  } catch (error) {
    console.error("Error in MarkMBStudentAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};




// //Absentee calling api
// // Update absentee calling status for students
// export const StudentAbsenteeCalling = async (req, res) => {
//   try {
//     const { 
//       _id, 
//       absenteeCallingStatus, 
//       callingRemark1, 
//       callingRemark2,
//       comments,
//       startDate,
//       status,
//       isAttendanceMarked
//     } = req.body;

//     console.log("I am inside student.controller.js and api: StudentAbsenteeCalling");
//     console.log(req.body);

//     // Validation
//     if (!_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Student ID is required"
//       });
//     }

//     // Set target date - use startDate if provided, otherwise use current date
//     let targetDate;
//     let dateString;
    
//     if (startDate) {
//       dateString = startDate;
//       const [year, month, day] = startDate.split('-').map(Number);
//       targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
//     } else {
//       const currentDate = new Date();
//       const year = currentDate.getUTCFullYear();
//       const month = currentDate.getUTCMonth();
//       const day = currentDate.getUTCDate();
//       targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
//       dateString = targetDate.toISOString().split('T')[0];
//     }
    
//     // Create date boundaries for query (using UTC)
//     const startOfDay = new Date(Date.UTC(
//       targetDate.getUTCFullYear(),
//       targetDate.getUTCMonth(),
//       targetDate.getUTCDate(),
//       0, 0, 0
//     ));
    
//     const endOfDay = new Date(Date.UTC(
//       targetDate.getUTCFullYear(),
//       targetDate.getUTCMonth(),
//       targetDate.getUTCDate(),
//       23, 59, 59, 999
//     ));

//     // Check if attendance record exists for this student on the target date
//     const existingAttendance = await StudentAttendance.findOne({
//       unqStudentObjectId: _id,
//       date: { $gte: startOfDay, $lte: endOfDay }
//     });

//     // Prepare update object with only provided fields
//     const updateFields = {};
    
//     if (absenteeCallingStatus !== undefined) {
//       updateFields.absenteeCallingStatus = absenteeCallingStatus;
//     }
//     if (callingRemark1 !== undefined) {
//       updateFields.callingRemark1 = callingRemark1;
//     }
//     if (callingRemark2 !== undefined) {
//       updateFields.callingRemark2 = callingRemark2;
//     }
//     if (comments !== undefined) {
//       updateFields.comments = comments;
//     }
//     if (status !== undefined) {
//       updateFields.status = status;
//     }
//     if (isAttendanceMarked !== undefined) {
//       updateFields.isAttendanceMarked = isAttendanceMarked;
//     }
    
//     updateFields.updatedAt = new Date();

//     // If record exists, update the calling fields
//     if (existingAttendance) {
//       const updatedAttendance = await StudentAttendance.findByIdAndUpdate(
//         existingAttendance._id,
//         updateFields,
//         { new: true }
//       );

//       return res.status(200).json({
//         success: true,
//         message: `Absentee calling information updated successfully for ${dateString}`,
//         data: updatedAttendance,
//         dateString: dateString
//       });
//     }

//     // If no attendance record exists, create a new one with absentee calling fields
//     const attendanceRecord = {
//       unqStudentObjectId: _id,
//       date: targetDate,
//       status: status || "Absent",
//       isAttendanceMarked: isAttendanceMarked !== undefined ? isAttendanceMarked : true,
//       TA: 0,
//       absenteeCallingStatus: absenteeCallingStatus || null,
//       callingRemark1: callingRemark1 || null,
//       callingRemark2: callingRemark2 || null,
//       comments: comments || null,
//     };

//     const newAttendance = new StudentAttendance(attendanceRecord);
//     await newAttendance.save();

//     return res.status(201).json({
//       success: true,
//       message: `Absentee calling information recorded successfully for ${dateString}`,
//       data: newAttendance,
//       dateString: dateString
//     });

//   } catch (error) {
//     console.error("Error in StudentAbsenteeCalling:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };















// Marking student attendance
export const StudentAbsenteeCalling = async (req, res) => {

  console.log('I am inside student.controller.js, api:StudentAbsenteeCalling ')
  try {
    const { _id, status, isAttendanceMarked, startDate, absenteeCallingStatus, callingRemark1
      , callingRemark2, comments
     } = req.body;

    console.log("I am inside student.controller.js and api: MarkMBStudentAttendance")
    console.log(req.body)

    // Validation
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required (Present/Absent)"
      });
    }

    // Set target date - use startDate if provided, otherwise use current date
    let targetDate;
    let dateString; // Store as YYYY-MM-DD for consistency
    
    if (startDate) {
      // Use the date string as is for storage
      dateString = startDate;
      
      // Create UTC date at midnight (00:00:00.000Z)
      // This ensures the date is stored with zero hours in UTC
      const [year, month, day] = startDate.split('-').map(Number);
      targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    } else {
      // Default to current date in UTC at midnight
      const currentDate = new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth();
      const day = currentDate.getUTCDate();
      targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
      dateString = targetDate.toISOString().split('T')[0];
    }
    
    console.log("Target Date Details:", {
      receivedStartDate: startDate,
      targetDate: targetDate,
      ISOString: targetDate.toISOString(),
      dateString: dateString,
      UTC: targetDate.toUTCString(),
      Local: targetDate.toString()
    });

    // Create date boundaries for query (using UTC)
    const startOfDay = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      0, 0, 0
    ));
    
    const endOfDay = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      23, 59, 59, 999
    ));

    // Check if attendance already exists for this student on the target date
    const existingAttendance = await StudentAttendance.findOne({
      unqStudentObjectId: _id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // If exists, update the attendance
    if (existingAttendance) {
      const updatedAttendance = await StudentAttendance.findByIdAndUpdate(
        existingAttendance._id,
        {
          status: status,
          isAttendanceMarked: isAttendanceMarked !== undefined ? isAttendanceMarked : true,
          absenteeCallingStatus: absenteeCallingStatus,
          callingRemark1: callingRemark1,
          callingRemark2: callingRemark2,
          comments: comments,
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log("Updated Attendance Date:", {
        storedDate: updatedAttendance.date,
        storedISO: updatedAttendance.date.toISOString(),
        expectedDate: dateString
      });

      return res.status(200).json({
        success: true,
        message: `Attendance updated successfully for ${dateString}`,
        data: updatedAttendance,
        attendanceDate: targetDate,
        dateString: dateString
      });
    }

    // If not exists, create new attendance record with UTC midnight date
    const attendanceRecord = {
      unqStudentObjectId: _id,
      date: targetDate, // This will be stored as UTC midnight (00:00:00.000Z)
      status: status,
      isAttendanceMarked: isAttendanceMarked !== undefined ? isAttendanceMarked : true,
      absenteeCallingStatus: absenteeCallingStatus,
      callingRemark1: callingRemark1,
      callingRemark2: callingRemark2,
      comments: comments,
    };

    const newAttendance = new StudentAttendance(attendanceRecord);
    await newAttendance.save();

    console.log("Saved Attendance:", {
      id: newAttendance._id,
      storedDate: newAttendance.date,
      storedISO: newAttendance.date.toISOString(),
      expectedDate: dateString,
      expectedISO: `${dateString}T00:00:00.000Z`
    });

    return res.status(201).json({
      success: true,
      message: `Attendance marked successfully for ${dateString}`,
      data: newAttendance,
      attendanceDate: targetDate,
      dateString: dateString
    });

  } catch (error) {
    console.error("Error in MarkMBStudentAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};






//Student attendance dashboard

// export const StudentAttendanceDashboard = async (req, res) => {

//   const {batch, isSlcTaken, schoolId, status}

//   try {
    
//   } catch (error) {
    
//   }
// }


// Student attendance dashboard
export const StudentAttendanceDashboard = async (req, res) => {
    try {
        const { batch, isSlcTaken, schoolId, districtId, blockId, date } = req.body;

        // Use current date if no date provided
        let attendanceDate;
        if (date) {
            attendanceDate = new Date(date);
            if (isNaN(attendanceDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format"
                });
            }
        } else {
            attendanceDate = new Date();
        }
        
        // Set date range for attendance lookup (start to end of day)
        const startOfDay = new Date(attendanceDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(attendanceDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Build match conditions for students
        const studentMatchConditions = {};
        
        if (batch) {
            studentMatchConditions.batch = batch;
        }
        
        if (isSlcTaken !== undefined) {
            studentMatchConditions.isSlcTaken = isSlcTaken;
        }
        
        if (schoolId) {
            studentMatchConditions.schoolId = schoolId;
        }

        // First, get all schools that are not closed
        let schoolQuery = { isCenterClosed: false };
        if (districtId) schoolQuery.districtId = districtId;
        if (blockId) schoolQuery.blockId = blockId;
        if (schoolId) schoolQuery.schoolId = schoolId;
        
        const allSchools = await District_Block_School.find(schoolQuery).lean();
        
        if (allSchools.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No schools found",
                filters: { batch, isSlcTaken, schoolId, districtId, blockId, date: attendanceDate.toISOString().split('T')[0] },
                summary: {
                    totalSchools: 0,
                    totalStudents: 0,
                    totalPresent: 0,
                    totalAbsent: 0,
                    overallAttendancePercentage: 0
                },
                schoolsData: []
            });
        }

        // Get student counts and attendance per school
        const studentAggregation = await Student.aggregate([
            // Match students with filters
            { $match: studentMatchConditions },
            
            // Lookup attendance for the specific date
            {
                $lookup: {
                    from: "studentattendances",
                    let: { studentId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$unqStudentObjectId", "$$studentId"] },
                                        { $gte: ["$date", startOfDay] },
                                        { $lte: ["$date", endOfDay] }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: "attendance"
                }
            },
            
            // Add attendance status field
            {
                $addFields: {
                    attendanceStatus: {
                        $ifNull: [
                            { $arrayElemAt: ["$attendance.status", 0] },
                            "Not Marked"
                        ]
                    }
                }
            },
            
            // Group by schoolId
            {
                $group: {
                    _id: "$schoolId",
                    totalStudents: { $sum: 1 },
                    presentCount: {
                        $sum: {
                            $cond: [{ $eq: ["$attendanceStatus", "Present"] }, 1, 0]
                        }
                    },
                    absentCount: {
                        $sum: {
                            $cond: [{ $eq: ["$attendanceStatus", "Absent"] }, 1, 0]
                        }
                    },
                    notMarkedCount: {
                        $sum: {
                            $cond: [{ $eq: ["$attendanceStatus", "Not Marked"] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        
        // Create map for quick lookup
        const studentStatsMap = {};
        studentAggregation.forEach(item => {
            studentStatsMap[item._id] = {
                totalStudents: item.totalStudents,
                presentCount: item.presentCount,
                absentCount: item.absentCount,
                notMarkedCount: item.notMarkedCount,
                attendancePercentage: item.totalStudents > 0 
                    ? ((item.presentCount / item.totalStudents) * 100).toFixed(2)
                    : 0
            };
        });

        // Build school-wise data
        const schoolsData = [];
        let totalStudentsAll = 0;
        let totalPresentAll = 0;
        let totalAbsentAll = 0;
        let totalNotMarkedAll = 0;
        
        for (const school of allSchools) {
            const schoolIdStr = school.schoolId;
            const stats = studentStatsMap[schoolIdStr];
            
            if (!stats || stats.totalStudents === 0) {
                // School has no students matching criteria, skip
                continue;
            }
            
            totalStudentsAll += stats.totalStudents;
            totalPresentAll += stats.presentCount;
            totalAbsentAll += stats.absentCount;
            totalNotMarkedAll += stats.notMarkedCount;
            
            schoolsData.push({
                schoolDetails: {
                    schoolId: school.schoolId,
                    schoolName: school.schoolName,
                    districtId: school.districtId,
                    districtName: school.districtName,
                    blockId: school.blockId,
                    blockName: school.blockName
                },
                totalStudents: stats.totalStudents,
                attendance: {
                    present: stats.presentCount,
                    absent: stats.absentCount,
                    notMarked: stats.notMarkedCount,
                    percentage: parseFloat(stats.attendancePercentage)
                }
            });
        }
        
        // Sort schools by attendance percentage (highest first)
        schoolsData.sort((a, b) => b.attendance.percentage - a.attendance.percentage);
        
        // Calculate overall statistics
        const totalStats = {
            totalSchools: schoolsData.length,
            totalStudents: totalStudentsAll,
            totalPresent: totalPresentAll,
            totalAbsent: totalAbsentAll,
            totalNotMarked: totalNotMarkedAll,
            overallAttendancePercentage: totalStudentsAll > 0 
                ? ((totalPresentAll / totalStudentsAll) * 100).toFixed(2)
                : 0
        };

        return res.status(200).json({
            success: true,
            message: "Student attendance dashboard data fetched successfully",
            filters: {
                batch: batch || "All",
                isSlcTaken: isSlcTaken !== undefined ? isSlcTaken : "All",
                schoolId: schoolId || "All",
                districtId: districtId || "All",
                blockId: blockId || "All",
                date: attendanceDate.toISOString().split('T')[0]
            },
            summary: totalStats,
            schoolsData: schoolsData
        });

    } catch (error) {
        console.error("Error in StudentAttendanceDashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};










//Download students attendance data:

export const GetAllMbStudentsData = async (req, res) => {
  try {
    const { 
      districtId, 
      blockId, 
      schoolId, 
      batch, 
      startDate  // Single date only (YYYY-MM-DD)
    } = req.body;
    
    let isSlcTaken = false;
    console.log(req.body);
    console.log("i am inside 'student.controller.js' and api: 'GetMBStudents'");
    
    // Build query for District_Block_School to get filtered schools
    let schoolQuery = {};
    
    if (districtId && districtId.length > 0) {
      schoolQuery.districtId = { $in: districtId };
    }
    
    if (blockId && blockId.length > 0) {
      schoolQuery.blockId = { $in: blockId };
    }
    
    if (schoolId && schoolId.length > 0) {
      schoolQuery.schoolId = { $in: schoolId };
    }
    
    // Get all schools that match the filters (or all schools if no filters)
    const allSchools = await District_Block_School.find(schoolQuery).lean();
    
    if (allSchools.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        filters: schoolQuery,
        schoolsCount: 0,
        selectedDate: null
      });
    }
    
    // Get school IDs from filtered schools
    const schoolIds = allSchools.map(school => school.schoolId);
    
    // Build dynamic query object for students
    let studentQuery = {};
    
    if (schoolIds.length > 0) {
      studentQuery.schoolId = { $in: schoolIds };
    }
    
    if (batch && batch.length > 0) {
      studentQuery.batch = { $in: batch };
    }
    
    if (isSlcTaken !== undefined && isSlcTaken !== null && isSlcTaken !== '') {
      studentQuery.isSlcTaken = isSlcTaken;
    }

    console.log("Student Query:", studentQuery);
    console.log("Filtered Schools Count:", allSchools.length);
    console.log("School IDs:", schoolIds);
    
    // Get students (can be empty array if no students found)
    const students = await Student.find(studentQuery);
    
    // Set date for attendance - SINGLE DATE ONLY with UTC timezone
    let startOfDayUTC;
    let endOfDayUTC;
    let dateString;
    
    if (startDate) {
      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = startDate.split('-').map(Number);
      
      // Create UTC date for start of day (00:00:00.000 UTC)
      startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      // Create UTC date for end of day (23:59:59.999 UTC)
      endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      
      dateString = startDate;
    } else {
      // Default to current date in UTC
      const currentDate = new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth();
      const day = currentDate.getUTCDate();
      
      startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      
      dateString = startOfDayUTC.toISOString().split('T')[0];
    }
    
    console.log("Target Date Range (UTC):", {
      startOfDayUTC: startOfDayUTC.toISOString(),
      endOfDayUTC: endOfDayUTC.toISOString(),
      dateString: dateString
    });
    
    // Get student IDs
    const studentIds = students.map(s => s._id);
    
    // Fetch existing attendance records for the single date using UTC range
    const existingAttendanceRecords = await StudentAttendance.find({
      unqStudentObjectId: { $in: studentIds },
      date: { 
        $gte: startOfDayUTC,
        $lte: endOfDayUTC
      }
    });
    
    console.log(`Found ${existingAttendanceRecords.length} attendance records for date: ${dateString}`);
    
    // Create a map for quick lookup: studentId -> attendance record
    const attendanceMap = new Map();
    existingAttendanceRecords.forEach(record => {
      const studentId = record.unqStudentObjectId.toString();
      attendanceMap.set(studentId, record);
    });
    
    // Create a map of students by schoolId
    const studentsBySchool = new Map();
    students.forEach(student => {
      const schoolIdStr = student.schoolId;
      if (!studentsBySchool.has(schoolIdStr)) {
        studentsBySchool.set(schoolIdStr, []);
      }
      studentsBySchool.get(schoolIdStr).push(student);
    });
    
    // Build result array with all schools (including those with no students)
    const resultWithSchools = [];
    
    for (const school of allSchools) {
      const schoolIdStr = school.schoolId;
      const schoolStudents = studentsBySchool.get(schoolIdStr) || [];
      
      // Create school object with students (or empty array if no students)
      const schoolWithStudents = {
        schoolDetails: {
          schoolId: school.schoolId,
          schoolName: school.schoolName,
          districtId: school.districtId,
          districtName: school.districtName,
          blockId: school.blockId,
          blockName: school.blockName,
          isCenterClosed: school.isCenterClosed || false
        },
        totalStudents: schoolStudents.length,
        students: schoolStudents.map(student => {
          const studentId = student._id.toString();
          const existingRecord = attendanceMap.get(studentId);
          
          let attendanceRecord = null;
          let status = "Absent";
          let isAttendanceMarked = false;
          
          if (existingRecord) {
            // Record exists in database - use actual status
            attendanceRecord = existingRecord.toObject();
            status = existingRecord.status;
            isAttendanceMarked = existingRecord.isAttendanceMarked || false;
          } else if (studentId && startOfDayUTC) {
            // No record in database - create dummy record for display
            attendanceRecord = {
              _id: `dummy_${studentId}_${dateString}`,
              unqStudentObjectId: student._id,
              date: startOfDayUTC,
              status: "Absent",
              isAttendanceMarked: false,
              TA: 0,
              absenteeCallingStatus: null,
              callingRemark1: null,
              callingRemark2: null,
              comments: null,
              isDummy: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            status = "Absent";
            isAttendanceMarked = false;
          }
          
          // Convert to plain object and add attendance fields
          const studentObj = student.toObject();
          studentObj.attendanceRecord = attendanceRecord;
          studentObj.attendanceStatus = status;
          studentObj.isAttendanceMarked = isAttendanceMarked;
          studentObj.attendanceDate = startOfDayUTC;
          
          return studentObj;
        })
      };
      
      resultWithSchools.push(schoolWithStudents);
    }
    
    // Calculate summary statistics
    const totalSchools = resultWithSchools.length;
    const totalStudents = resultWithSchools.reduce((sum, school) => sum + school.totalStudents, 0);
    const totalPresent = resultWithSchools.reduce((sum, school) => {
      return sum + school.students.filter(s => s.attendanceStatus === "Present").length;
    }, 0);
    const totalAbsent = resultWithSchools.reduce((sum, school) => {
      return sum + school.students.filter(s => s.attendanceStatus === "Absent").length;
    }, 0);
    
    return res.status(200).json({
      success: true,
      data: resultWithSchools,
      count: resultWithSchools.length,
      totalStudents: totalStudents,
      totalPresent: totalPresent,
      totalAbsent: totalAbsent,
      filters: {
        districtId: districtId || "All",
        blockId: blockId || "All",
        schoolId: schoolId || "All",
        batch: batch || "All"
      },
      selectedDate: {
        date: startOfDayUTC,
        dateString: dateString,
        formattedDate: startOfDayUTC.toLocaleDateString('en-IN', { timeZone: 'UTC' }),
        startOfDayUTC: startOfDayUTC.toISOString(),
        endOfDayUTC: endOfDayUTC.toISOString()
      }
    });
    
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message
    });
  }
};