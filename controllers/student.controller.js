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



export const GetMBStudents = async (req, res) => {
  try {
    const { 
      districtId, 
      blockId, 
      schoolId, 
      batch, 
      isSlcTaken,
      startDate  // Single date only
    } = req.body;

    console.log(req.body)
    console.log("i am inside 'student.controller.js' and api: 'GetMBStudents'")
    
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

    console.log(studentQuery)
    
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
    
    // Set date for attendance - SINGLE DATE ONLY
    let targetDate;
    
    if (startDate) {
      // Create date from startDate string (YYYY-MM-DD) with time set to 00:00:00 in local timezone
      const [year, month, day] = startDate.split('-').map(Number);
      targetDate = new Date(year, month - 1, day, 0, 0, 0);
    } else {
      // Default to current date with time set to 00:00:00 in local timezone
      const currentDate = new Date();
      targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
    }
    
    // Create end of day for the same date (23:59:59.999)
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log("Target Date:", {
      startDate: targetDate,
      endOfDay: endOfDay,
      ISOString: targetDate.toISOString(),
      localString: targetDate.toString()
    });
    
    // Get student IDs
    const studentIds = students.map(s => s._id);
    
    // Fetch existing attendance records from database for the single date
    const existingAttendanceRecords = await StudentAttendance.find({
      unqStudentObjectId: { $in: studentIds },
      date: { $gte: targetDate, $lte: endOfDay }
    });
    
    console.log(`Found ${existingAttendanceRecords.length} attendance records for date: ${targetDate.toDateString()}`);
    
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
          _id: `dummy_${studentId}_${targetDate.toISOString().split('T')[0]}`,
          unqStudentObjectId: student._id,
          date: targetDate,
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
      studentObj.attendanceDate = targetDate;
      
      return studentObj;
    });
    
    return res.status(200).json({
      success: true,
      data: studentsWithAttendance,
      count: studentsWithAttendance.length,
      filters: studentQuery,
      selectedDate: {
        date: targetDate,
        dateString: targetDate.toISOString().split('T')[0],
        formattedDate: targetDate.toLocaleDateString('en-IN')
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