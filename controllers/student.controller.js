//Writing all the Business logic, Rest APIs, for student.model.js;


import mongoose from 'mongoose';
// import { Student } from "../models/Student.model.js";

// import  {Student}  from "../models/student.model.js"
// import  StudentDb  from "../models/student.model.js";

import path from "path";
import multer from "multer";
import AWS from "aws-sdk"; 
import {Student}  from "../models/student.model.js";


import { District_Block_School } from "../models/district_block_school.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";
import { constants } from "buffer";

import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

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
 const response = await Student.find({
  // slc: true, 
  classofStudent: '9',
  focus200ExamVenue: { 
    $exists: true,
    $ne: null,
    $nin: ["", " "]
  }
});

      res.status(200).json({
      status: "Success",
     datalen: response.length,
      data: response,
      
    });
 } catch (error) {
   
    res.status(500).json({ status: "Error", message: "Server error" });
 }
}






export const GetMBStudents = async (req, res) => {
  try {
    const { 
      districtId, 
      blockId, 
      schoolId, 
      batch, 
      startDate  // Single date only (YYYY-MM-DD)
    } = req.body;
    
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

    console.log("Student Query:", studentQuery);
    
    // Get students with all required fields including request-related fields
    const students = await Student.find(studentQuery)
      .select({
        _id: 1,
        studentSrn: 1,
        rollNumber: 1,
        firstName: 1,
        lastName: 1,
        fatherName: 1,
        motherName: 1,
        email: 1,
        personalContact: 1,
        ParentContact: 1,
        otherContact: 1,
        dob: 1,
        gender: 1,
        category: 1,
        address: 1,
        districtId: 1,
        blockId: 1,
        schoolId: 1,
        classofStudent: 1,
        parent: 1,
        enrollmentDate: 1,
        batch: 1,
        session: 1,
        documents: 1,
        singleSideDistance: 1,
        bothSideDistance: 1,
        slc: 1,
        isSlcTaken: 1,
        slcReleasingDate: 1,
        erpEnrollingDate: 1,
        medium: 1,
        isStudentOf: 1,
        isDressGiven: 1,
        isTabGiven: 1,
        tabIMEI: 1,
        isSimGiven: 1,
        simNumber: 1,
        simIMSI: 1,
        bankName: 1,
        bankIFSC: 1,
        bankAccNumber: 1,
        bankHolderName: 1,
        batchCompleted: 1,
        shirtSizeInInches: 1,
        waistSizeInInches: 1,
        waistToBottomLengthInInches: 1,
        dressAmountSubmitted: 1,
        dressSizeConfirmationForm: 1,
        examinationVenue: 1,
        studentCreatedBy: 1,
        studentRemovedBy: 1,
        studentCreationDate: 1,
        studentRemoveDate: 1,
        studentCRUDStatus: 1,
        request: 1,              // Added this field
        requestDate: 1,          // Added this field
        requestStatus: 1,        // Added this field
        requestApprovedBy: 1,    // Added this field
        createdAt: 1,
        updatedAt: 1
      });
    
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









export const GetMBStudentsForAttendance = async (req, res) => {
  try {
    const { 
      districtId, 
      blockId, 
      schoolId, 
      batch, 
      startDate  // Single date only (YYYY-MM-DD)
    } = req.body;
    
    console.log(req.body);
    console.log("i am inside 'student.controller.js' and api: 'GetMBStudentsForAttendance'");
    
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

    // ADD THIS FILTER: Only fetch students where slc is true AND isSlcTaken is false
    studentQuery.slc = true;
    studentQuery.isSlcTaken = false;

    console.log("Student Query:", studentQuery);
    
    // Get students with all required fields including request-related fields
    const students = await Student.find(studentQuery)
      .select({
        _id: 1,
        studentSrn: 1,
        rollNumber: 1,
        firstName: 1,
        lastName: 1,
        fatherName: 1,
        motherName: 1,
        email: 1,
        personalContact: 1,
        ParentContact: 1,
        otherContact: 1,
        dob: 1,
        gender: 1,
        category: 1,
        address: 1,
        districtId: 1,
        blockId: 1,
        schoolId: 1,
        classofStudent: 1,
        parent: 1,
        enrollmentDate: 1,
        batch: 1,
        session: 1,
        documents: 1,
        singleSideDistance: 1,
        bothSideDistance: 1,
        slc: 1,
        isSlcTaken: 1,
        slcReleasingDate: 1,
        erpEnrollingDate: 1,
        medium: 1,
        isStudentOf: 1,
        isDressGiven: 1,
        isTabGiven: 1,
        tabIMEI: 1,
        isSimGiven: 1,
        simNumber: 1,
        simIMSI: 1,
        bankName: 1,
        bankIFSC: 1,
        bankAccNumber: 1,
        bankHolderName: 1,
        batchCompleted: 1,
        shirtSizeInInches: 1,
        waistSizeInInches: 1,
        waistToBottomLengthInInches: 1,
        dressAmountSubmitted: 1,
        dressSizeConfirmationForm: 1,
        examinationVenue: 1,
        studentCreatedBy: 1,
        studentRemovedBy: 1,
        studentCreationDate: 1,
        studentRemoveDate: 1,
        studentCRUDStatus: 1,
        request: 1,
        requestDate: 1,
        requestStatus: 1,
        requestApprovedBy: 1,
        createdAt: 1,
        updatedAt: 1
      });
    
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



// export const updateDressSize = async (req, res) =>{

//   const {_id, shirtSizeInInches,  waistToBottomLengthInInches} = req.body;

//   try {
//     const response = await Student.findByIdAndUpdate({_id:_id}, {
//       shirtSizeInInches:shirtSizeInInches,
//       waistToBottomLengthInInches:waistToBottomLengthInInches
//     })
//   } catch (error) {
    
//   }
// }





export const updateDressSize = async (req, res) => {
  const { _id, shirtSizeInInches, waistToBottomLengthInInches } = req.body;

  try {
    // Validate _id
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID (_id) is required"
      });
    }

    // Validate at least one field is provided
    if (shirtSizeInInches === undefined && waistToBottomLengthInInches === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (shirtSizeInInches or waistToBottomLengthInInches) must be provided"
      });
    }

    // Build update object dynamically
    const updateData = {};
    if (shirtSizeInInches !== undefined) {
      if (typeof shirtSizeInInches !== 'number' || shirtSizeInInches < 0) {
        return res.status(400).json({
          success: false,
          message: "shirtSizeInInches must be a positive number"
        });
      }
      updateData.shirtSizeInInches = shirtSizeInInches;
    }

    if (waistToBottomLengthInInches !== undefined) {
      if (typeof waistToBottomLengthInInches !== 'number' || waistToBottomLengthInInches < 0) {
        return res.status(400).json({
          success: false,
          message: "waistToBottomLengthInInches must be a positive number"
        });
      }
      updateData.waistToBottomLengthInInches = waistToBottomLengthInInches;
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dress size updated successfully",
      data: {
        _id: updatedStudent._id,
        studentSrn: updatedStudent.studentSrn,
        firstName: updatedStudent.firstName,
        shirtSizeInInches: updatedStudent.shirtSizeInInches,
        waistToBottomLengthInInches: updatedStudent.waistToBottomLengthInInches
      }
    });

  } catch (error) {
    console.error("Error updating dress size:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update dress size"
    });
  }
};



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











// export const StudentAbsenteeCallingDashboard = async (req, res) => {
//     try {
//         const { batch, schoolId, districtId, blockId, date } = req.body;

//         // Use current date if no date provided
//         let attendanceDate;
//         if (date) {
//             attendanceDate = new Date(date);
//             if (isNaN(attendanceDate.getTime())) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid date format"
//                 });
//             }
//         } else {
//             attendanceDate = new Date();
//         }
        
//         // Set date range for attendance lookup (start to end of day)
//         const startOfDay = new Date(attendanceDate);
//         startOfDay.setHours(0, 0, 0, 0);
        
//         const endOfDay = new Date(attendanceDate);
//         endOfDay.setHours(23, 59, 59, 999);

//         // Build match conditions for students
//         const studentMatchConditions = {};
        
//         if (batch) {
//             studentMatchConditions.batch = batch;
//         }
        
//         // Always get students where isSlcTaken is false
//         studentMatchConditions.isSlcTaken = false;

//         // Build school query
//         let schoolQuery = { isCenterClosed: false };
//         if (districtId) schoolQuery.districtId = districtId;
//         if (blockId) schoolQuery.blockId = blockId;
//         if (schoolId) schoolQuery.schoolId = schoolId;
        
//         const allSchools = await District_Block_School.find(schoolQuery).lean();
        
//         if (allSchools.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 message: "No schools found",
//                 filters: { batch, schoolId, districtId, blockId, date: attendanceDate.toISOString().split('T')[0] },
//                 summary: {
//                     totalSchools: 0,
//                     totalAbsentStudents: 0,
//                     connectedCount: 0,
//                     notConnectedCount: 0,
//                     notCalledCount: 0
//                 },
//                 schoolsData: []
//             });
//         }

//         // Get school IDs
//         const schoolIds = allSchools.map(school => school.schoolId);
        
//         // Add schoolId filter to student conditions
//         if (schoolIds.length > 0) {
//             studentMatchConditions.schoolId = { $in: schoolIds };
//         }

//         // Get students and their attendance with absentee calling status
//         const studentAggregation = await Student.aggregate([
//             { $match: studentMatchConditions },
//             {
//                 $lookup: {
//                     from: "studentattendances",
//                     let: { studentId: "$_id" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$unqStudentObjectId", "$$studentId"] },
//                                         { $gte: ["$date", startOfDay] },
//                                         { $lte: ["$date", endOfDay] }
//                                     ]
//                                 }
//                             }
//                         },
//                         { $limit: 1 }
//                     ],
//                     as: "attendance"
//                 }
//             },
//             {
//                 $addFields: {
//                     attendanceRecord: {
//                         $arrayElemAt: ["$attendance", 0]
//                     },
//                     attendanceStatus: {
//                         $ifNull: [
//                             { $arrayElemAt: ["$attendance.status", 0] },
//                             "Not Marked"
//                         ]
//                     }
//                 }
//             },
//             {
//                 $match: {
//                     $or: [
//                         { attendanceStatus: "Absent" },
//                         { 
//                             $and: [
//                                 { attendanceStatus: "Not Marked" },
//                                 { attendanceRecord: { $exists: false } }
//                             ]
//                         }
//                     ]
//                 }
//             },
//             {
//                 $addFields: {
//                     callingCategory: {
//                         $switch: {
//                             branches: [
//                                 {
//                                     case: { $eq: ["$attendanceRecord.absenteeCallingStatus", "Connected"] },
//                                     then: "Connected"
//                                 },
//                                 {
//                                     case: { $eq: ["$attendanceRecord.absenteeCallingStatus", "Not Connected"] },
//                                     then: "Not Connected"
//                                 }
//                             ],
//                             default: "Not Called"
//                         }
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "district_block_schools",
//                     let: { schoolId: "$schoolId" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $eq: ["$schoolId", "$$schoolId"]
//                                 }
//                             }
//                         },
//                         { $limit: 1 }
//                     ],
//                     as: "schoolDetails"
//                 }
//             },
//             {
//                 $addFields: {
//                     schoolDetails: {
//                         $arrayElemAt: ["$schoolDetails", 0]
//                     }
//                 }
//             }
//         ]);
        
//         // Group by school
//         const schoolsMap = new Map();
        
//         studentAggregation.forEach(student => {
//             const schoolIdStr = student.schoolId;
//             const callingCategory = student.callingCategory;
            
//             if (!schoolsMap.has(schoolIdStr)) {
//                 schoolsMap.set(schoolIdStr, {
//                     schoolDetails: {
//                         schoolId: student.schoolDetails?.schoolId || schoolIdStr,
//                         schoolName: student.schoolDetails?.schoolName || "Unknown School",
//                         districtId: student.schoolDetails?.districtId || "",
//                         districtName: student.schoolDetails?.districtName || "",
//                         blockId: student.schoolDetails?.blockId || "",
//                         blockName: student.schoolDetails?.blockName || ""
//                     },
//                     totalAbsentStudents: 0,
//                     connectedCount: 0,
//                     notConnectedCount: 0,
//                     notCalledCount: 0,
//                     students: []
//                 });
//             }
            
//             const schoolData = schoolsMap.get(schoolIdStr);
//             schoolData.totalAbsentStudents++;
            
//             if (callingCategory === "Connected") {
//                 schoolData.connectedCount++;
//             } else if (callingCategory === "Not Connected") {
//                 schoolData.notConnectedCount++;
//             } else {
//                 schoolData.notCalledCount++;
//             }
            
//             schoolData.students.push({
//                 studentId: student._id,
//                 studentName: student.name,
//                 studentUserId: student.userId,
//                 className: student.className,
//                 section: student.section,
//                 fatherName: student.fatherName,
//                 motherName: student.motherName,
//                 contact1: student.contact1,
//                 contact2: student.contact2,
//                 attendanceStatus: student.attendanceStatus,
//                 absenteeCallingStatus: student.attendanceRecord?.absenteeCallingStatus || null,
//                 callingRemark1: student.attendanceRecord?.callingRemark1 || null,
//                 callingRemark2: student.attendanceRecord?.callingRemark2 || null,
//                 comments: student.attendanceRecord?.comments || null,
//                 TA: student.attendanceRecord?.TA || 0,
//                 isAttendanceMarked: student.attendanceRecord?.isAttendanceMarked || false,
//                 callingCategory: callingCategory
//             });
//         });
        
//         // FIXED: Build final schoolsData including schools with no absent students
//         const schoolsData = [];
//         let totalAbsentStudents = 0;
//         let totalConnected = 0;
//         let totalNotConnected = 0;
//         let totalNotCalled = 0;
        
//         for (const school of allSchools) {
//             const schoolIdStr = school.schoolId;
//             const schoolStats = schoolsMap.get(schoolIdStr);
            
//             if (schoolStats) {
//                 // School has absent students
//                 totalAbsentStudents += schoolStats.totalAbsentStudents;
//                 totalConnected += schoolStats.connectedCount;
//                 totalNotConnected += schoolStats.notConnectedCount;
//                 totalNotCalled += schoolStats.notCalledCount;
                
//                 schoolsData.push({
//                     schoolDetails: schoolStats.schoolDetails,
//                     totalAbsentStudents: schoolStats.totalAbsentStudents,
//                     connectedCount: schoolStats.connectedCount,
//                     notConnectedCount: schoolStats.notConnectedCount,
//                     notCalledCount: schoolStats.notCalledCount,
//                     students: schoolStats.students
//                 });
//             } else {
//                 // School has ZERO absent students - include it with zeros
//                 schoolsData.push({
//                     schoolDetails: {
//                         schoolId: school.schoolId,
//                         schoolName: school.schoolName,
//                         districtId: school.districtId,
//                         districtName: school.districtName,
//                         blockId: school.blockId,
//                         blockName: school.blockName
//                     },
//                     totalAbsentStudents: 0,
//                     connectedCount: 0,
//                     notConnectedCount: 0,
//                     notCalledCount: 0,
//                     students: []
//                 });
//             }
//         }
        
//         // Sort schools by school name
//         schoolsData.sort((a, b) => 
//             a.schoolDetails.schoolName.localeCompare(b.schoolDetails.schoolName)
//         );
        
//         // Calculate percentages
//         const connectedPercentage = totalAbsentStudents > 0 
//             ? ((totalConnected / totalAbsentStudents) * 100).toFixed(2)
//             : 0;
//         const notConnectedPercentage = totalAbsentStudents > 0 
//             ? ((totalNotConnected / totalAbsentStudents) * 100).toFixed(2)
//             : 0;
//         const notCalledPercentage = totalAbsentStudents > 0 
//             ? ((totalNotCalled / totalAbsentStudents) * 100).toFixed(2)
//             : 0;

//         return res.status(200).json({
//             success: true,
//             message: "Student absentee calling dashboard data fetched successfully",
//             filters: {
//                 batch: batch || "All",
//                 schoolId: schoolId || "All",
//                 districtId: districtId || "All",
//                 blockId: blockId || "All",
//                 date: attendanceDate.toISOString().split('T')[0]
//             },
//             summary: {
//                 totalSchools: schoolsData.length,
//                 totalAbsentStudents: totalAbsentStudents,
//                 connectedCount: totalConnected,
//                 notConnectedCount: totalNotConnected,
//                 notCalledCount: totalNotCalled,
//                 connectedPercentage: parseFloat(connectedPercentage),
//                 notConnectedPercentage: parseFloat(notConnectedPercentage),
//                 notCalledPercentage: parseFloat(notCalledPercentage)
//             },
//             schoolsData: schoolsData
//         });

//     } catch (error) {
//         console.error("Error in StudentAbsenteeCallingDashboard:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };









export const StudentAbsenteeCallingDashboard = async (req, res) => {
    try {
        const { batch, schoolId, districtId, blockId, date } = req.body;

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
        
        // Always get students where isSlcTaken is false
        studentMatchConditions.isSlcTaken = false;

        // Build school query
        let schoolQuery = { isCenterClosed: false };
        if (districtId) schoolQuery.districtId = districtId;
        if (blockId) schoolQuery.blockId = blockId;
        if (schoolId) schoolQuery.schoolId = schoolId;
        
        const allSchools = await District_Block_School.find(schoolQuery).lean();
        
        if (allSchools.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No schools found",
                filters: { batch, schoolId, districtId, blockId, date: attendanceDate.toISOString().split('T')[0] },
                summary: {
                    totalSchools: 0,
                    totalAbsentStudents: 0,
                    connectedCount: 0,
                    notConnectedCount: 0,
                    notCalledCount: 0
                },
                schoolsData: []
            });
        }

        // Get school IDs
        const schoolIds = allSchools.map(school => school.schoolId);
        
        // Add schoolId filter to student conditions
        if (schoolIds.length > 0) {
            studentMatchConditions.schoolId = { $in: schoolIds };
        }

        // Get students and their attendance with absentee calling status
        const studentAggregation = await Student.aggregate([
            { $match: studentMatchConditions },
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
            {
                $addFields: {
                    attendanceRecord: {
                        $arrayElemAt: ["$attendance", 0]
                    },
                    attendanceStatus: {
                        $ifNull: [
                            { $arrayElemAt: ["$attendance.status", 0] },
                            "Not Marked"
                        ]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { attendanceStatus: "Absent" },
                        { 
                            $and: [
                                { attendanceStatus: "Not Marked" },
                                { attendanceRecord: { $exists: false } }
                            ]
                        }
                    ]
                }
            },
            {
                $addFields: {
                    callingCategory: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$attendanceRecord.absenteeCallingStatus", "Connected"] },
                                    then: "Connected"
                                },
                                {
                                    case: { $eq: ["$attendanceRecord.absenteeCallingStatus", "Not Connected"] },
                                    then: "Not Connected"
                                }
                            ],
                            default: "Not Called"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "district_block_schools",
                    let: { schoolId: "$schoolId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$schoolId", "$$schoolId"]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: "schoolDetails"
                }
            },
            {
                $addFields: {
                    schoolDetails: {
                        $arrayElemAt: ["$schoolDetails", 0]
                    }
                }
            }
        ]);
        
        // Group by school
        const schoolsMap = new Map();
        
        studentAggregation.forEach(student => {
            const schoolIdStr = student.schoolId;
            const callingCategory = student.callingCategory;
            
            if (!schoolsMap.has(schoolIdStr)) {
                schoolsMap.set(schoolIdStr, {
                    schoolDetails: {
                        schoolId: student.schoolDetails?.schoolId || schoolIdStr,
                        schoolName: student.schoolDetails?.schoolName || "Unknown School",
                        districtId: student.schoolDetails?.districtId || "",
                        districtName: student.schoolDetails?.districtName || "",
                        blockId: student.schoolDetails?.blockId || "",
                        blockName: student.schoolDetails?.blockName || ""
                    },
                    totalAbsentStudents: 0,
                    connectedCount: 0,
                    notConnectedCount: 0,
                    notCalledCount: 0,
                    students: []
                });
            }
            
            const schoolData = schoolsMap.get(schoolIdStr);
            schoolData.totalAbsentStudents++;
            
            if (callingCategory === "Connected") {
                schoolData.connectedCount++;
            } else if (callingCategory === "Not Connected") {
                schoolData.notConnectedCount++;
            } else {
                schoolData.notCalledCount++;
            }
            
            // FIXED: Now using all fields from student collection
            schoolData.students.push({
                studentId: student._id,
                // Student personal details
                studentSrn: student.studentSrn || "N/A",
                firstName: student.firstName || "N/A",
                studentName: student.name || student.firstName || "N/A", // fallback
                studentUserId: student.userId || "N/A",
                // Parent details
                fatherName: student.fatherName || "N/A",
                motherName: student.motherName || "N/A",
                // Contact details
                contact1: student.contact1 || "N/A",
                contact2: student.contact2 || "N/A",
                personalContact: student.personalContact || "N/A",
                parentContact: student.ParentContact || "N/A",
                otherContact: student.otherContact || "N/A",
                // Academic details
                className: student.className || student.classofStudent || "N/A",
                section: student.section || "N/A",
                rollNumber: student.rollNumber || "N/A",
                // Attendance and calling status
                attendanceStatus: student.attendanceStatus,
                absenteeCallingStatus: student.attendanceRecord?.absenteeCallingStatus || null,
                callingRemark1: student.attendanceRecord?.callingRemark1 || null,
                callingRemark2: student.attendanceRecord?.callingRemark2 || null,
                comments: student.attendanceRecord?.comments || null,
                TA: student.attendanceRecord?.TA || 0,
                isAttendanceMarked: student.attendanceRecord?.isAttendanceMarked || false,
                callingCategory: callingCategory
            });
        });
        
        // Build final schoolsData including schools with no absent students
        const schoolsData = [];
        let totalAbsentStudents = 0;
        let totalConnected = 0;
        let totalNotConnected = 0;
        let totalNotCalled = 0;
        
        for (const school of allSchools) {
            const schoolIdStr = school.schoolId;
            const schoolStats = schoolsMap.get(schoolIdStr);
            
            if (schoolStats) {
                // School has absent students
                totalAbsentStudents += schoolStats.totalAbsentStudents;
                totalConnected += schoolStats.connectedCount;
                totalNotConnected += schoolStats.notConnectedCount;
                totalNotCalled += schoolStats.notCalledCount;
                
                schoolsData.push({
                    schoolDetails: schoolStats.schoolDetails,
                    totalAbsentStudents: schoolStats.totalAbsentStudents,
                    connectedCount: schoolStats.connectedCount,
                    notConnectedCount: schoolStats.notConnectedCount,
                    notCalledCount: schoolStats.notCalledCount,
                    students: schoolStats.students
                });
            } else {
                // School has ZERO absent students - include it with zeros
                schoolsData.push({
                    schoolDetails: {
                        schoolId: school.schoolId,
                        schoolName: school.schoolName,
                        districtId: school.districtId,
                        districtName: school.districtName,
                        blockId: school.blockId,
                        blockName: school.blockName
                    },
                    totalAbsentStudents: 0,
                    connectedCount: 0,
                    notConnectedCount: 0,
                    notCalledCount: 0,
                    students: []
                });
            }
        }
        
        // Sort schools by school name
        schoolsData.sort((a, b) => 
            a.schoolDetails.schoolName.localeCompare(b.schoolDetails.schoolName)
        );
        
        // Calculate percentages
        const connectedPercentage = totalAbsentStudents > 0 
            ? ((totalConnected / totalAbsentStudents) * 100).toFixed(2)
            : 0;
        const notConnectedPercentage = totalAbsentStudents > 0 
            ? ((totalNotConnected / totalAbsentStudents) * 100).toFixed(2)
            : 0;
        const notCalledPercentage = totalAbsentStudents > 0 
            ? ((totalNotCalled / totalAbsentStudents) * 100).toFixed(2)
            : 0;

        return res.status(200).json({
            success: true,
            message: "Student absentee calling dashboard data fetched successfully",
            filters: {
                batch: batch || "All",
                schoolId: schoolId || "All",
                districtId: districtId || "All",
                blockId: blockId || "All",
                date: attendanceDate.toISOString().split('T')[0]
            },
            summary: {
                totalSchools: schoolsData.length,
                totalAbsentStudents: totalAbsentStudents,
                connectedCount: totalConnected,
                notConnectedCount: totalNotConnected,
                notCalledCount: totalNotCalled,
                connectedPercentage: parseFloat(connectedPercentage),
                notConnectedPercentage: parseFloat(notConnectedPercentage),
                notCalledPercentage: parseFloat(notCalledPercentage)
            },
            schoolsData: schoolsData
        });

    } catch (error) {
        console.error("Error in StudentAbsenteeCallingDashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};










//Create Student
export const CreateStudent = async (req, res) => {

  console.log("I am inside student.controller.js, api: CreateStudent")
  const { students, isBulk } = req.body;

  console.log(req.body)

  try {
    // Helper function to safely convert to string (handles null/undefined)
    const safeToString = (value) => {
      if (value === null || value === undefined || value === '') return null;
      return value.toString().trim();
    };

    // Helper function to parse date fields
    const parseDate = (dateValue) => {
      if (!dateValue || dateValue === null || dateValue === undefined || dateValue === '') return null;
      if (dateValue instanceof Date) return dateValue;
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Helper function to parse boolean fields
    const parseBoolean = (value) => {
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
      }
      if (typeof value === 'number') return value === 1;
      return null;
    };

    // Helper function to parse number fields
    const parseNumber = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    // Helper function to validate required fields
    const validateStudentData = (data) => {
      const required = ['studentSrn', 'rollNumber', 'firstName', 'gender', 'districtId', 'blockId', 'schoolId', 'classofStudent', 'medium', 'isStudentOf'];
      const missing = required.filter(field => !data[field]);
      if (missing.length > 0) {
        return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
      }
      return { valid: true };
    };

    // Helper function to transform raw data to student model format
    const transformStudentData = (rawData) => {
      return {
        studentSrn: safeToString(rawData.studentSrn),
        rollNumber: safeToString(rawData.rollNumber),
        firstName: safeToString(rawData.firstName),
        lastName: safeToString(rawData.lastName),
        fatherName: safeToString(rawData.fatherName),
        motherName: safeToString(rawData.motherName),
        email: safeToString(rawData.email),
        personalContact: safeToString(rawData.personalContact),
        ParentContact: safeToString(rawData.ParentContact),
        otherContact: safeToString(rawData.otherContact),
        dob: parseDate(rawData.dob),
        gender: safeToString(rawData.gender),
        category: safeToString(rawData.category),
        address: safeToString(rawData.address),
        districtId: safeToString(rawData.districtId),
        blockId: safeToString(rawData.blockId),
        schoolId: safeToString(rawData.schoolId),
        classofStudent: safeToString(rawData.classofStudent),
        parent: safeToString(rawData.parent),
        enrollmentDate: parseDate(rawData.enrollmentDate) || new Date(),
        batch: safeToString(rawData.batch),
        session: {
          session1: safeToString(rawData.session1),
          session2: safeToString(rawData.session2),
        },
        singleSideDistance: parseNumber(rawData.singleSideDistance),
        bothSideDistance: parseNumber(rawData.bothSideDistance),
        slc: parseBoolean(rawData.slc),
        isSlcTaken: parseBoolean(rawData.isSlcTaken),
        slcReleasingDate: parseDate(rawData.slcReleasingDate),
        erpEnrollingDate: parseDate(rawData.erpEnrollingDate),
        medium: safeToString(rawData.medium),
        isStudentOf: safeToString(rawData.isStudentOf),
        isDressGiven: parseBoolean(rawData.isDressGiven),
        isTabGiven: parseBoolean(rawData.isTabGiven),
        tabIMEI: safeToString(rawData.tabIMEI),
        isSimGiven: parseBoolean(rawData.isSimGiven),
        simNumber: safeToString(rawData.simNumber),
        simIMSI: safeToString(rawData.simIMSI),
        bankName: safeToString(rawData.bankName),
        bankIFSC: safeToString(rawData.bankIFSC),
        bankAccNumber: safeToString(rawData.bankAccNumber),
        bankHolderName: safeToString(rawData.bankHolderName),
        batchCompleted: parseBoolean(rawData.batchCompleted),
        shirtSizeInInches: parseNumber(rawData.shirtSizeInInches),
        waistSizeInInches: parseNumber(rawData.waistSizeInInches),
        waistToBottomLengthInInches: parseNumber(rawData.waistToBottomLengthInInches),
        dressAmountSubmitted: parseBoolean(rawData.dressAmountSubmitted),
        dressSizeConfirmationForm: safeToString(rawData.dressSizeConfirmationForm),
        examinationVenue: safeToString(rawData.examinationVenue),
      };
    };

    // Handle single student creation
    if (!isBulk || !students || students.length === 0) {
      const studentData = req.body;
      
      // Check if it's a single student (not bulk)
      if (!studentData.studentSrn) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request. Provide student data or use isBulk=true with students array'
        });
      }

      const validation = validateStudentData(studentData);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      const transformedData = transformStudentData(studentData);

      // Check for existing student
      const existingStudent = await Student.findOne({
        $or: [
          { studentSrn: transformedData.studentSrn },
          { rollNumber: transformedData.rollNumber }
        ]
      });

      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: `Student with SRN ${transformedData.studentSrn} or Roll Number ${transformedData.rollNumber} already exists`,
        });
      }

      const student = new Student(transformedData);
      await student.save();

      return res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student,
      });
    }

    // Handle bulk student creation
    const results = {
      successful: [],
      failed: [],
      total: students.length,
    };

    for (let i = 0; i < students.length; i++) {
      const rawData = students[i];
      const rowNumber = i + 2;

      try {
        // Validate required fields
        const validation = validateStudentData(rawData);
        if (!validation.valid) {
          results.failed.push({
            row: rowNumber,
            index: i,
            data: rawData,
            error: validation.error,
          });
          continue;
        }

        // Transform data
        const studentData = transformStudentData(rawData);

        // Check for existing student in database
        const existingStudent = await Student.findOne({
          $or: [
            { studentSrn: studentData.studentSrn },
            { rollNumber: studentData.rollNumber }
          ]
        });

        if (existingStudent) {
          results.failed.push({
            row: rowNumber,
            index: i,
            data: rawData,
            error: `Duplicate: Student with SRN ${studentData.studentSrn} or Roll Number ${studentData.rollNumber} already exists`,
          });
          continue;
        }

        // Check for duplicates within the same batch
        const duplicateInBatch = results.successful.some(
          s => s.studentSrn === studentData.studentSrn || s.rollNumber === studentData.rollNumber
        );

        if (duplicateInBatch) {
          results.failed.push({
            row: rowNumber,
            index: i,
            data: rawData,
            error: `Duplicate in batch: Student with SRN ${studentData.studentSrn} or Roll Number ${studentData.rollNumber} already exists in this upload`,
          });
          continue;
        }

        // Create student
        const student = new Student(studentData);
        await student.save();
        
        results.successful.push({
          row: rowNumber,
          index: i,
          studentSrn: student.studentSrn,
          rollNumber: student.rollNumber,
          id: student._id,
        });
      } catch (error) {
        console.error(`Error creating student at row ${rowNumber}:`, error);
        results.failed.push({
          row: rowNumber,
          index: i,
          data: rawData,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk upload completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results,
    });

  } catch (error) {
    console.error('Error in CreateStudent:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



// Create Student Form (Single Student)
export const CreateStudentFormAPI = async (req, res) => {
  console.log("I am inside student.controller.js, api: CreateStudentFormAPI");
  const studentData = req.body;
  const { studentCRUDStatus } = studentData; // 'Added', 'Removed', 'SLC Released'

  console.log("Received data:", studentData);
  console.log("Student CRUD Status:", studentCRUDStatus);

  try {
    // Helper function to safely convert to string
    const safeToString = (value) => {
      if (value === null || value === undefined || value === '') return null;
      return value.toString().trim();
    };

    // Helper function to parse date fields
    const parseDate = (dateValue) => {
      if (!dateValue || dateValue === null || dateValue === undefined || dateValue === '') return null;
      if (dateValue instanceof Date) return dateValue;
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Helper function to parse number fields
    const parseNumber = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    // Helper function to convert userId to ObjectId
    const getObjectId = (id) => {
      if (!id) return null;
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return null;
      } catch (error) {
        console.error("Error converting to ObjectId:", error);
        return null;
      }
    };

    // Check if SRN already exists
    const checkExistingSRN = async (srn) => {
      if (!srn) return null;
      const existingStudent = await Student.findOne({ studentSrn: srn });
      
      if (existingStudent) {
        return {
          exists: true,
          student: existingStudent
        };
      }
      return { exists: false };
    };

    // Handle Remove case
    const handleRemoveStudent = async (existingStudent) => {
      console.log("Removing student:", existingStudent.studentSrn);
      
      const updatedStudent = await Student.findOneAndUpdate(
        { studentSrn: existingStudent.studentSrn },
        {
          $set: {
            slc: null,
            isSlcTaken: null,
            studentCRUDStatus: "Removed",
            studentRemovedBy: getObjectId(studentData.userId),
            studentRemoveDate: new Date().toISOString(),
            request:"Removed",
            requestDate:new Date(),
            requestStatus: "Pending",
            requestApprovedBy:null

          }
        },
        { new: true }
      );
      
      return {
        updated: true,
        student: updatedStudent
      };
    };

    // Handle SLC Release case - Same as Remove, just different status
    const handleSLCRelease = async (existingStudent) => {
      console.log("Releasing SLC for student:", existingStudent.studentSrn);
      
      const updatedStudent = await Student.findOneAndUpdate(
        { studentSrn: existingStudent.studentSrn },
        {
          $set: {
            slc: true,
            isSlcTaken: false,
            studentCRUDStatus: "SLC Released",
            studentRemovedBy: getObjectId(studentData.userId),
            studentRemoveDate: new Date(),
            request:"SLC Released",
            requestDate:new Date(),
            requestStatus: "Pending",
            requestApprovedBy:null

          }
        },
        { new: true }
      );
      
      return {
        updated: true,
        student: updatedStudent
      };
    };

    // Transform data for database (only for Add case)
    const transformStudentData = (rawData) => {
      return {
        studentSrn: safeToString(rawData.studentSrn),
        rollNumber: safeToString(rawData.rollNumber),
        firstName: safeToString(rawData.firstName),
        lastName: null,
        fatherName: safeToString(rawData.fatherName),
        motherName: safeToString(rawData.motherName),
        email: null,
        personalContact: safeToString(rawData.personalContact),
        ParentContact: safeToString(rawData.ParentContact),
        otherContact: safeToString(rawData.otherContact),
        dob: parseDate(rawData.dob),
        gender: safeToString(rawData.gender),
        category: safeToString(rawData.category),
        address: safeToString(rawData.address),
        districtId: safeToString(rawData.districtId),
        blockId: safeToString(rawData.blockId),
        schoolId: safeToString(rawData.schoolId),
        classofStudent: safeToString(rawData.classofStudent),
        parent: null,
        enrollmentDate: new Date(),
        batch: safeToString(rawData.batch),
        session: {
          session1: null,
          session2: null,
        },
        singleSideDistance: parseNumber(rawData.singleSideDistance),
        bothSideDistance: parseNumber(rawData.bothSideDistance),
        slc: null,
        isSlcTaken: null,
        slcReleasingDate: null,
        erpEnrollingDate: new Date(),
        medium: null,
        isStudentOf: rawData.isStudentOf || "MB",
        isDressGiven: false,
        isTabGiven: false,
        tabIMEI: null,
        isSimGiven: false,
        simNumber: null,
        simIMSI: null,
        bankName: null,
        bankIFSC: null,
        bankAccNumber: null,
        bankHolderName: null,
        batchCompleted: false,
        shirtSizeInInches: null,
        waistSizeInInches: null,
        waistToBottomLengthInInches: null,
        dressAmountSubmitted: false,
        dressSizeConfirmationForm: null,
        examinationVenue: null,
        studentCreatedBy: getObjectId(rawData.userId),
        studentCreationDate: new Date(),
        studentCRUDStatus: "Added",
        studentRemovedBy: null,
        studentRemoveDate: null,
        request:"Added",
        requestDate:new Date(),
        requestStatus:"Pending",
        requestApprovedBy:null
      };
    };

    // First, check if SRN already exists
    const srnCheck = await checkExistingSRN(studentData.studentSrn);
    
    // Handle cases when student exists
    if (srnCheck.exists) {
      const existingStudent = srnCheck.student;
      
      // Case 1: Remove student
      if (studentCRUDStatus === "Removed") {
        const result = await handleRemoveStudent(existingStudent);
        return res.status(200).json({
          success: true,
          message: 'Student removed successfully',
          data: result.student
        });
      }
      
      // Case 2: SLC Released - NO CONDITION CHECK, directly update
      if (studentCRUDStatus === "SLC Released") {
        const result = await handleSLCRelease(existingStudent);
        return res.status(200).json({
          success: true,
          message: 'Student SLC released successfully',
          data: result.student
        });
      }
      
      // Case 3: Add but student already exists (normal duplicate)
      if (studentCRUDStatus === "Added") {
        return res.status(409).json({
          success: false,
          message: `Student with SRN ${studentData.studentSrn} already exists`,
          existingStudent: {
            studentSrn: existingStudent.studentSrn,
            firstName: existingStudent.firstName,
            lastName: existingStudent.lastName,
            fatherName: existingStudent.fatherName,
            districtId: existingStudent.districtId,
            blockId: existingStudent.blockId,
            schoolId: existingStudent.schoolId,
            classofStudent: existingStudent.classofStudent,
            batch: existingStudent.batch
          }
        });
      }
    }

    // If student doesn't exist and we're trying to Remove or SLC Released
    if (!srnCheck.exists && (studentCRUDStatus === "Removed" || studentCRUDStatus === "SLC Released")) {
      return res.status(404).json({
        success: false,
        message: `Student with SRN ${studentData.studentSrn} not found`,
      });
    }

    // Validate required fields for Add case
    const requiredFields = [
      'studentSrn', 'firstName', 'gender', 
      'districtId', 'blockId', 'schoolId', 
      'classofStudent', 'batch'
    ];
    
    const missing = requiredFields.filter(field => !studentData[field] || studentData[field] === '');
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }
    
    // Validate SRN - should be 10 digits
    if (studentData.studentSrn && !/^\d{10}$/.test(studentData.studentSrn)) {
      return res.status(400).json({
        success: false,
        message: 'Student SRN must be exactly 10 digits'
      });
    }

    // Transform data for Add case
    const transformedData = transformStudentData(studentData);

    // Double check for existing student (race condition)
    const existingStudent = await Student.findOne({
      $or: [
        { studentSrn: transformedData.studentSrn },
        ...(transformedData.rollNumber ? [{ rollNumber: transformedData.rollNumber }] : [])
      ]
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Student with SRN ${transformedData.studentSrn} already exists`,
      });
    }

    // Create new student (Add case)
    const student = new Student(transformedData);
    await student.save();

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });

  } catch (error) {
    console.error('Error in CreateStudentFormAPI:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



// // Update Student by SRN with selective fields
// export const UpdateStudentBySrn = async (req, res) => {
//   console.log("I am inside student.controller.js, api: UpdateStudentBySrn");
  
//   const { studentSrn, updates, isBulk } = req.body;

//   try {
//     // Helper functions (reuse the same helpers from CreateStudent)
//     const safeToString = (value) => {
//       if (value === null || value === undefined || value === '') return null;
//       return value.toString().trim();
//     };

//     const parseDate = (dateValue) => {
//       if (!dateValue || dateValue === null || dateValue === undefined || dateValue === '') return null;
//       if (dateValue instanceof Date) return dateValue;
//       const parsed = new Date(dateValue);
//       return isNaN(parsed.getTime()) ? null : parsed;
//     };

//     const parseBoolean = (value) => {
//       if (value === null || value === undefined || value === '') return null;
//       if (typeof value === 'boolean') return value;
//       if (typeof value === 'string') {
//         const lower = value.toLowerCase().trim();
//         if (lower === 'true' || lower === 'yes' || lower === '1') return true;
//         if (lower === 'false' || lower === 'no' || lower === '0') return false;
//       }
//       if (typeof value === 'number') return value === 1;
//       return null;
//     };

//     const parseNumber = (value) => {
//       if (value === null || value === undefined || value === '') return null;
//       const num = Number(value);
//       return isNaN(num) ? null : num;
//     };

//     // Field-specific transformation
//     const transformUpdateValue = (field, value) => {
//       // String fields
//       const stringFields = ['studentSrn', 'rollNumber', 'firstName', 'lastName', 'fatherName', 'motherName', 
//         'email', 'personalContact', 'ParentContact', 'otherContact', 'gender', 'category', 'address', 
//         'districtId', 'blockId', 'schoolId', 'classofStudent', 'parent', 'batch', 'medium', 'isStudentOf',
//         'tabIMEI', 'simNumber', 'simIMSI', 'bankName', 'bankIFSC', 'bankAccNumber', 'bankHolderName',
//         'dressSizeConfirmationForm', 'examinationVenue'];
      
//       // Date fields
//       const dateFields = ['dob', 'enrollmentDate', 'slcReleasingDate', 'erpEnrollingDate'];
      
//       // Boolean fields
//       const booleanFields = ['slc', 'isSlcTaken', 'isDressGiven', 'isTabGiven', 'isSimGiven', 'batchCompleted', 'dressAmountSubmitted'];
      
//       // Number fields
//       const numberFields = ['singleSideDistance', 'bothSideDistance', 'shirtSizeInInches', 'waistSizeInInches', 'waistToBottomLengthInInches'];
      
//       // Session object fields
//       const sessionFields = ['session1', 'session2'];

//       if (stringFields.includes(field)) {
//         return safeToString(value);
//       }
      
//       if (dateFields.includes(field)) {
//         return parseDate(value);
//       }
      
//       if (booleanFields.includes(field)) {
//         return parseBoolean(value);
//       }
      
//       if (numberFields.includes(field)) {
//         return parseNumber(value);
//       }
      
//       if (sessionFields.includes(field)) {
//         return safeToString(value);
//       }
      
//       return value;
//     };

//     // Validate that updates object is not empty
//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No update fields provided'
//       });
//     }

//     // Handle single student update
//     if (!isBulk || !updates || !Array.isArray(updates)) {
//       // Single student update
//       if (!studentSrn) {
//         return res.status(400).json({
//           success: false,
//           message: 'studentSrn is required for single student update'
//         });
//       }

//       // Check if student exists
//       const existingStudent = await Student.findOne({ studentSrn });
//       if (!existingStudent) {
//         return res.status(404).json({
//           success: false,
//           message: `Student with SRN ${studentSrn} not found`
//         });
//       }

//       // Transform update values
//       const transformedUpdates = {};
//       for (const [key, value] of Object.entries(updates)) {
//         if (key === 'session') {
//           // Handle session object
//           if (value.session1 !== undefined) {
//             transformedUpdates['session.session1'] = safeToString(value.session1);
//           }
//           if (value.session2 !== undefined) {
//             transformedUpdates['session.session2'] = safeToString(value.session2);
//           }
//         } else {
//           transformedUpdates[key] = transformUpdateValue(key, value);
//         }
//       }

//       // Update student
//       const updatedStudent = await Student.findOneAndUpdate(
//         { studentSrn },
//         { $set: transformedUpdates },
//         { new: true, runValidators: true }
//       );

//       return res.status(200).json({
//         success: true,
//         message: 'Student updated successfully',
//         data: updatedStudent
//       });
//     }

//     // Handle bulk student updates
//     const results = {
//       successful: [],
//       failed: [],
//       total: updates.length
//     };

//     for (let i = 0; i < updates.length; i++) {
//       const updateItem = updates[i];
//       const rowNumber = i + 2;

//       try {
//         const { studentSrn: srn, ...updateFields } = updateItem;

//         if (!srn) {
//           results.failed.push({
//             row: rowNumber,
//             index: i,
//             data: updateItem,
//             error: 'studentSrn is required'
//           });
//           continue;
//         }

//         // Check if student exists
//         const existingStudent = await Student.findOne({ studentSrn: srn });
//         if (!existingStudent) {
//           results.failed.push({
//             row: rowNumber,
//             index: i,
//             data: updateItem,
//             error: `Student with SRN ${srn} not found`
//           });
//           continue;
//         }

//         // Transform update values
//         const transformedUpdates = {};
//         for (const [key, value] of Object.entries(updateFields)) {
//           if (key === 'session') {
//             if (value.session1 !== undefined) {
//               transformedUpdates['session.session1'] = safeToString(value.session1);
//             }
//             if (value.session2 !== undefined) {
//               transformedUpdates['session.session2'] = safeToString(value.session2);
//             }
//           } else {
//             transformedUpdates[key] = transformUpdateValue(key, value);
//           }
//         }

//         // Update student
//         const updatedStudent = await Student.findOneAndUpdate(
//           { studentSrn: srn },
//           { $set: transformedUpdates },
//           { new: true, runValidators: true }
//         );

//         results.successful.push({
//           row: rowNumber,
//           index: i,
//           studentSrn: srn,
//           updatedFields: Object.keys(updateFields),
//           id: updatedStudent._id
//         });

//       } catch (error) {
//         console.error(`Error updating student at row ${rowNumber}:`, error);
//         results.failed.push({
//           row: rowNumber,
//           index: i,
//           data: updateItem,
//           error: error.message
//         });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Bulk update completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
//       results
//     });

//   } catch (error) {
//     console.error('Error in UpdateStudentBySrn:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };






// // Update Student by SRN with selective fields

// export const UpdateStudentBySrn = async (req, res) => {
//   console.log(
//     "I am inside student.controller.js, api: UpdateStudentBySrn"
//   );

//   const { studentSrn, updates, isBulk } = req.body;

//   try {
//     /* -------------------------------------------------------------------------- */
//     /*                                  HELPERS                                   */
//     /* -------------------------------------------------------------------------- */

//     const safeToString = (value) => {
//       if (
//         value === null ||
//         value === undefined ||
//         value === ""
//       ) {
//         return null;
//       }

//       return value.toString().trim();
//     };

//     const parseDate = (dateValue) => {
//       if (
//         !dateValue ||
//         dateValue === null ||
//         dateValue === undefined ||
//         dateValue === ""
//       ) {
//         return null;
//       }

//       if (dateValue instanceof Date) {
//         return dateValue;
//       }

//       const parsed = new Date(dateValue);

//       return isNaN(parsed.getTime()) ? null : parsed;
//     };

//     const parseBoolean = (value) => {
//       if (
//         value === null ||
//         value === undefined ||
//         value === ""
//       ) {
//         return null;
//       }

//       if (typeof value === "boolean") {
//         return value;
//       }

//       if (typeof value === "string") {
//         const lower = value.toLowerCase().trim();

//         if (
//           lower === "true" ||
//           lower === "yes" ||
//           lower === "1"
//         ) {
//           return true;
//         }

//         if (
//           lower === "false" ||
//           lower === "no" ||
//           lower === "0"
//         ) {
//           return false;
//         }
//       }

//       if (typeof value === "number") {
//         return value === 1;
//       }

//       return null;
//     };

//     const parseNumber = (value) => {
//       if (
//         value === null ||
//         value === undefined ||
//         value === ""
//       ) {
//         return null;
//       }

//       const num = Number(value);

//       return isNaN(num) ? null : num;
//     };

//     /* -------------------------------------------------------------------------- */
//     /*                                FIELD TYPES                                 */
//     /* -------------------------------------------------------------------------- */

//     const stringFields = [
//       "studentSrn",
//       "rollNumber",
//       "firstName",
//       "lastName",
//       "fatherName",
//       "motherName",
//       "email",
//       "personalContact",
//       "ParentContact",
//       "otherContact",
//       "gender",
//       "category",
//       "address",
//       "districtId",
//       "blockId",
//       "schoolId",
//       "classofStudent",
//       "parent",
//       "batch",
//       "medium",
//       "isStudentOf",
//       "tabIMEI",
//       "simNumber",
//       "simIMSI",
//       "bankName",
//       "bankIFSC",
//       "bankAccNumber",
//       "bankHolderName",
//       "dressSizeConfirmationForm",
//       "examinationVenue",
//     ];

//     const dateFields = [
//       "dob",
//       "enrollmentDate",
//       "slcReleasingDate",
//       "erpEnrollingDate",
//     ];

//     const booleanFields = [
//       "slc",
//       "isSlcTaken",
//       "isDressGiven",
//       "isTabGiven",
//       "isSimGiven",
//       "batchCompleted",
//       "dressAmountSubmitted",
//     ];

//     const numberFields = [
//       "singleSideDistance",
//       "bothSideDistance",
//       "shirtSizeInInches",
//       "waistSizeInInches",
//       "waistToBottomLengthInInches",
//     ];

//     const sessionFields = ["session1", "session2"];

//     /* -------------------------------------------------------------------------- */
//     /*                         TRANSFORM UPDATE VALUES                            */
//     /* -------------------------------------------------------------------------- */

//     const transformUpdateValue = (field, value) => {
//       if (stringFields.includes(field)) {
//         return safeToString(value);
//       }

//       if (dateFields.includes(field)) {
//         return parseDate(value);
//       }

//       if (booleanFields.includes(field)) {
//         return parseBoolean(value);
//       }

//       if (numberFields.includes(field)) {
//         return parseNumber(value);
//       }

//       if (sessionFields.includes(field)) {
//         return safeToString(value);
//       }

//       return value;
//     };

//     /* -------------------------------------------------------------------------- */
//     /*                              VALIDATIONS                                   */
//     /* -------------------------------------------------------------------------- */

//     if (!updates) {
//       return res.status(400).json({
//         success: false,
//         message: "updates field is required",
//       });
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                             SINGLE UPDATE                                  */
//     /* -------------------------------------------------------------------------- */

//     if (!isBulk) {
//       if (!studentSrn) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "studentSrn is required for single student update",
//         });
//       }

//       if (
//         typeof updates !== "object" ||
//         Array.isArray(updates)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "updates must be an object for single update",
//         });
//       }

//       if (Object.keys(updates).length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "No update fields provided",
//         });
//       }

//       /* -------------------------- CHECK STUDENT EXISTS ------------------------- */

//       const existingStudent = await Student.findOne({
//         studentSrn,
//       });

//       if (!existingStudent) {
//         return res.status(404).json({
//           success: false,
//           message: `Student with SRN ${studentSrn} not found`,
//         });
//       }

//       /* --------------------------- TRANSFORM VALUES ---------------------------- */

//       const transformedUpdates = {};

//       for (const [key, value] of Object.entries(updates)) {
//         if (key === "session") {
//           if (value?.session1 !== undefined) {
//             transformedUpdates["session.session1"] =
//               safeToString(value.session1);
//           }

//           if (value?.session2 !== undefined) {
//             transformedUpdates["session.session2"] =
//               safeToString(value.session2);
//           }
//         } else {
//           transformedUpdates[key] =
//             transformUpdateValue(key, value);
//         }
//       }

//       /* ----------------------------- UPDATE DATA ------------------------------ */

//       const updatedStudent =
//         await Student.findOneAndUpdate(
//           { studentSrn },
//           {
//             $set: transformedUpdates,
//           },
//           {
//             new: true,
//             runValidators: true,
//           }
//         );

//       return res.status(200).json({
//         success: true,
//         message: "Student updated successfully",
//         data: updatedStudent,
//       });
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                              BULK UPDATE                                   */
//     /* -------------------------------------------------------------------------- */

//     if (!Array.isArray(updates)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "updates must be an array for bulk update",
//       });
//     }

//     if (updates.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No bulk update data provided",
//       });
//     }

//     const results = {
//       successful: [],
//       failed: [],
//       total: updates.length,
//     };

//     /* -------------------------------------------------------------------------- */
//     /*                              PROCESS LOOP                                  */
//     /* -------------------------------------------------------------------------- */

//     for (let i = 0; i < updates.length; i++) {
//       const updateItem = updates[i];

//       const rowNumber = i + 2;

//       try {
//         const {
//           studentSrn: srn,
//           ...updateFields
//         } = updateItem;

//         /* ------------------------------ VALIDATION ----------------------------- */

//         if (!srn) {
//           results.failed.push({
//             row: rowNumber,
//             index: i,
//             data: updateItem,
//             error: "studentSrn is required",
//           });

//           continue;
//         }

//         if (
//           !updateFields ||
//           Object.keys(updateFields).length === 0
//         ) {
//           results.failed.push({
//             row: rowNumber,
//             index: i,
//             data: updateItem,
//             error: "No fields provided to update",
//           });

//           continue;
//         }

//         /* -------------------------- CHECK STUDENT EXISTS ------------------------- */

//         const existingStudent = await Student.findOne({
//           studentSrn: srn,
//         });

//         if (!existingStudent) {
//           results.failed.push({
//             row: rowNumber,
//             index: i,
//             data: updateItem,
//             error: `Student with SRN ${srn} not found`,
//           });

//           continue;
//         }

//         /* --------------------------- TRANSFORM VALUES ---------------------------- */

//         const transformedUpdates = {};

//         for (const [key, value] of Object.entries(
//           updateFields
//         )) {
//           if (key === "session") {
//             if (value?.session1 !== undefined) {
//               transformedUpdates["session.session1"] =
//                 safeToString(value.session1);
//             }

//             if (value?.session2 !== undefined) {
//               transformedUpdates["session.session2"] =
//                 safeToString(value.session2);
//             }
//           } else {
//             transformedUpdates[key] =
//               transformUpdateValue(key, value);
//           }
//         }

//         /* ------------------------------ UPDATE DB ------------------------------ */

//         const updatedStudent =
//           await Student.findOneAndUpdate(
//             {
//               studentSrn: srn,
//             },
//             {
//               $set: transformedUpdates,
//             },
//             {
//               new: true,
//               runValidators: true,
//             }
//           );

//         /* ------------------------------ SUCCESS -------------------------------- */

//         results.successful.push({
//           row: rowNumber,
//           index: i,
//           studentSrn: srn,
//           updatedFields: Object.keys(updateFields),
//           id: updatedStudent._id,
//         });
//       } catch (error) {
//         console.error(
//           `Error updating student at row ${rowNumber}:`,
//           error
//         );

//         results.failed.push({
//           row: rowNumber,
//           index: i,
//           data: updateItem,
//           error: error.message,
//         });
//       }
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                               FINAL RESPONSE                               */
//     /* -------------------------------------------------------------------------- */

//     return res.status(200).json({
//       success: true,
//       message: `Bulk update completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
//       results,
//     });
//   } catch (error) {
//     console.error(
//       "Error in UpdateStudentBySrn:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };




// Update Student by SRN with selective fields

export const UpdateStudentBySrn = async (req, res) => {
  console.log(
    "I am inside student.controller.js, api: UpdateStudentBySrn"
  );

  const { studentSrn, updates, isBulk } = req.body;

  try {
    /* -------------------------------------------------------------------------- */
    /*                                  HELPERS                                   */
    /* -------------------------------------------------------------------------- */

    const safeToString = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      return value.toString().trim();
    };

    // FIXED: Parse date without timezone conversion
    const parseDate = (dateValue) => {
      if (
        !dateValue ||
        dateValue === null ||
        dateValue === undefined ||
        dateValue === ""
      ) {
        return null;
      }

      // If it's already a Date object
      if (dateValue instanceof Date) {
        // Create new date at UTC midnight to preserve the date
        return new Date(Date.UTC(
          dateValue.getFullYear(),
          dateValue.getMonth(),
          dateValue.getDate()
        ));
      }

      // If it's a string in YYYY-MM-DD format
      if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateValue.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        // Create date at UTC midnight
        return new Date(Date.UTC(year, month, day));
      }

      // If it's a string in DD-MM-YYYY format
      if (typeof dateValue === 'string' && dateValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const parts = dateValue.split('-');
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        // Create date at UTC midnight
        return new Date(Date.UTC(year, month, day));
      }

      // If it's a string in DD/MM/YYYY format
      if (typeof dateValue === 'string' && dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parts = dateValue.split('/');
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        // Create date at UTC midnight
        return new Date(Date.UTC(year, month, day));
      }

      // Try to parse as date string
      const parsed = new Date(dateValue);
      
      if (isNaN(parsed.getTime())) {
        return null;
      }

      // Return UTC midnight date
      return new Date(Date.UTC(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate()
      ));
    };

    const parseBoolean = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      if (typeof value === "boolean") {
        return value;
      }

      if (typeof value === "string") {
        const lower = value.toLowerCase().trim();

        if (
          lower === "true" ||
          lower === "yes" ||
          lower === "1"
        ) {
          return true;
        }

        if (
          lower === "false" ||
          lower === "no" ||
          lower === "0"
        ) {
          return false;
        }
      }

      if (typeof value === "number") {
        return value === 1;
      }

      return null;
    };

    const parseNumber = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      const num = Number(value);

      return isNaN(num) ? null : num;
    };

    /* -------------------------------------------------------------------------- */
    /*                                FIELD TYPES                                 */
    /* -------------------------------------------------------------------------- */

    const stringFields = [
      "studentSrn",
      "rollNumber",
      "firstName",
      "lastName",
      "fatherName",
      "motherName",
      "email",
      "personalContact",
      "ParentContact",
      "otherContact",
      "gender",
      "category",
      "address",
      "districtId",
      "blockId",
      "schoolId",
      "classofStudent",
      "parent",
      "batch",
      "medium",
      "isStudentOf",
      "tabIMEI",
      "simNumber",
      "simIMSI",
      "bankName",
      "bankIFSC",
      "bankAccNumber",
      "bankHolderName",
      "dressSizeConfirmationForm",
      "examinationVenue",
    ];

    const dateFields = [
      "dob",
      "enrollmentDate",
      "slcReleasingDate",
      "erpEnrollingDate",
    ];

    const booleanFields = [
      "slc",
      "isSlcTaken",
      "isDressGiven",
      "isTabGiven",
      "isSimGiven",
      "batchCompleted",
      "dressAmountSubmitted",
    ];

    const numberFields = [
      "singleSideDistance",
      "bothSideDistance",
      "shirtSizeInInches",
      "waistSizeInInches",
      "waistToBottomLengthInInches",
    ];

    const sessionFields = ["session1", "session2"];

    /* -------------------------------------------------------------------------- */
    /*                         TRANSFORM UPDATE VALUES                            */
    /* -------------------------------------------------------------------------- */

    const transformUpdateValue = (field, value) => {
      if (stringFields.includes(field)) {
        return safeToString(value);
      }

      if (dateFields.includes(field)) {
        return parseDate(value);
      }

      if (booleanFields.includes(field)) {
        return parseBoolean(value);
      }

      if (numberFields.includes(field)) {
        return parseNumber(value);
      }

      if (sessionFields.includes(field)) {
        return safeToString(value);
      }

      return value;
    };

    /* -------------------------------------------------------------------------- */
    /*                              VALIDATIONS                                   */
    /* -------------------------------------------------------------------------- */

    if (!updates) {
      return res.status(400).json({
        success: false,
        message: "updates field is required",
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                             SINGLE UPDATE                                  */
    /* -------------------------------------------------------------------------- */

    if (!isBulk) {
      if (!studentSrn) {
        return res.status(400).json({
          success: false,
          message:
            "studentSrn is required for single student update",
        });
      }

      if (
        typeof updates !== "object" ||
        Array.isArray(updates)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "updates must be an object for single update",
        });
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No update fields provided",
        });
      }

      /* -------------------------- CHECK STUDENT EXISTS ------------------------- */

      const existingStudent = await Student.findOne({
        studentSrn,
      });

      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          message: `Student with SRN ${studentSrn} not found`,
        });
      }

      /* --------------------------- TRANSFORM VALUES ---------------------------- */

      const transformedUpdates = {};

      for (const [key, value] of Object.entries(updates)) {
        if (key === "session") {
          if (value?.session1 !== undefined) {
            transformedUpdates["session.session1"] =
              safeToString(value.session1);
          }

          if (value?.session2 !== undefined) {
            transformedUpdates["session.session2"] =
              safeToString(value.session2);
          }
        } else {
          transformedUpdates[key] =
            transformUpdateValue(key, value);
        }
      }

      /* ----------------------------- UPDATE DATA ------------------------------ */

      const updatedStudent =
        await Student.findOneAndUpdate(
          { studentSrn },
          {
            $set: transformedUpdates,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                              BULK UPDATE                                   */
    /* -------------------------------------------------------------------------- */

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message:
          "updates must be an array for bulk update",
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No bulk update data provided",
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: updates.length,
    };

    /* -------------------------------------------------------------------------- */
    /*                              PROCESS LOOP                                  */
    /* -------------------------------------------------------------------------- */

    for (let i = 0; i < updates.length; i++) {
      const updateItem = updates[i];

      const rowNumber = i + 2;

      try {
        const {
          studentSrn: srn,
          ...updateFields
        } = updateItem;

        /* ------------------------------ VALIDATION ----------------------------- */

        if (!srn) {
          results.failed.push({
            row: rowNumber,
            index: i,
            data: updateItem,
            error: "studentSrn is required",
          });

          continue;
        }

        if (
          !updateFields ||
          Object.keys(updateFields).length === 0
        ) {
          results.failed.push({
            row: rowNumber,
            index: i,
            data: updateItem,
            error: "No fields provided to update",
          });

          continue;
        }

        /* -------------------------- CHECK STUDENT EXISTS ------------------------- */

        const existingStudent = await Student.findOne({
          studentSrn: srn,
        });

        if (!existingStudent) {
          results.failed.push({
            row: rowNumber,
            index: i,
            data: updateItem,
            error: `Student with SRN ${srn} not found`,
          });

          continue;
        }

        /* --------------------------- TRANSFORM VALUES ---------------------------- */

        const transformedUpdates = {};

        for (const [key, value] of Object.entries(
          updateFields
        )) {
          if (key === "session") {
            if (value?.session1 !== undefined) {
              transformedUpdates["session.session1"] =
                safeToString(value.session1);
            }

            if (value?.session2 !== undefined) {
              transformedUpdates["session.session2"] =
                safeToString(value.session2);
            }
          } else {
            transformedUpdates[key] =
              transformUpdateValue(key, value);
          }
        }

        /* ------------------------------ UPDATE DB ------------------------------ */

        const updatedStudent =
          await Student.findOneAndUpdate(
            {
              studentSrn: srn,
            },
            {
              $set: transformedUpdates,
            },
            {
              new: true,
              runValidators: true,
            }
          );

        /* ------------------------------ SUCCESS -------------------------------- */

        results.successful.push({
          row: rowNumber,
          index: i,
          studentSrn: srn,
          updatedFields: Object.keys(updateFields),
          id: updatedStudent._id,
        });
      } catch (error) {
        console.error(
          `Error updating student at row ${rowNumber}:`,
          error
        );

        results.failed.push({
          row: rowNumber,
          index: i,
          data: updateItem,
          error: error.message,
        });
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                               FINAL RESPONSE                               */
    /* -------------------------------------------------------------------------- */

    return res.status(200).json({
      success: true,
      message: `Bulk update completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results,
    });
  } catch (error) {
    console.error(
      "Error in UpdateStudentBySrn:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



//Version 2 api

export const GetStudents = async (req, res) => {
  const { 
    batch, 
    districtId, 
    schoolId, 
    studentSrn, 
    gender, 
    isSlcTaken,
    page = 1,
    limit = 100,
    sortBy = '-createdAt'
  } = req.body;

  try {
    // Build the filter object dynamically
    const filter = {};

    // Handle batch - can be single string or array
    if (batch) {
      if (Array.isArray(batch) && batch.length > 0) {
        filter.batch = { $in: batch };
      } else if (typeof batch === 'string') {
        filter.batch = batch;
      }
    }

    // Handle districtId - can be single string or array
    if (districtId) {
      if (Array.isArray(districtId) && districtId.length > 0) {
        filter.districtId = { $in: districtId };
      } else if (typeof districtId === 'string') {
        filter.districtId = districtId;
      }
    }

    // Handle schoolId - can be single string or array
    if (schoolId) {
      if (Array.isArray(schoolId) && schoolId.length > 0) {
        filter.schoolId = { $in: schoolId };
      } else if (typeof schoolId === 'string') {
        filter.schoolId = schoolId;
      }
    }

    // Handle studentSrn - can be single string or array
    if (studentSrn) {
      if (Array.isArray(studentSrn) && studentSrn.length > 0) {
        filter.studentSrn = { $in: studentSrn };
      } else if (typeof studentSrn === 'string') {
        filter.studentSrn = studentSrn;
      }
    }

    // Handle gender - single value
    if (gender) {
      filter.gender = gender;
    }

    // Handle isSlcTaken - boolean value
    if (isSlcTaken !== undefined && isSlcTaken !== null) {
      filter.isSlcTaken = isSlcTaken;
    }

    // Build the query - without select() to get ALL fields
    let query = Student.find(filter);

    // Apply sorting
    if (sortBy) {
      query = query.sort(sortBy);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute query - using lean() to get plain objects with all fields
    const students = await query.lean();

    // Get total count for pagination info
    const totalCount = await Student.countDocuments(filter);

    // Check if students found
    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found matching the criteria',
        data: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          pages: 0
        }
      });
    }

    // Return success response with ALL fields
    return res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      count: students.length,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / limit)
      },
      data: students  // This will contain ALL fields from the documents
    });

  } catch (error) {
    console.error('Error in GetStudents API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching students',
      error: error.message
    });
  }
};





// DownloadStudentData
export const DownloadStudentData = async (req, res) => {
  const {
    // Fields to include in the download (set to true to include)
    studentSrn,
    rollNumber,
    firstName,
    gender,
    fatherName,
    category,
    districtName,
    blockName,
    schoolName,
    personalContact,
    ParentContact,
    // Additional fields that can be added dynamically
    ...additionalFields
  } = req.body;

  const {
    // Filter fields
    districtId,
    blockId,
    schoolId,
    batch,
    isSlcTaken,
    medium,
    format = 'Excel', // Default format
    downloadType = 'student-data', // 'student-data', 'top-absentee', 'consecutive-absentee'
    numberOfDays = 30, // For absentee types, number of days to check
    exactMatch = true // NEW: If true, only return students with exact numberOfDays absence
  } = req.body;

  console.log(req.body)
  try {
    let students = [];

    // 1. Build base filter for students
    const baseFilter = {};
    if (districtId) baseFilter.districtId = districtId;
    if (blockId) baseFilter.blockId = blockId;
    if (schoolId) baseFilter.schoolId = schoolId;
    
    if (batch) {
      if (Array.isArray(batch) && batch.length > 0) {
        baseFilter.batch = { $in: batch };
      } else if (typeof batch === 'string') {
        baseFilter.batch = batch;
      }
    }
    
    if (isSlcTaken !== undefined && isSlcTaken !== null) {
      baseFilter.isSlcTaken = isSlcTaken;
    }
    if (medium) baseFilter.medium = medium;

    // 2. Handle different download types
    if (downloadType === 'top-absentee') {
      // Fetch top absent students (total absences)
      students = await getTopAbsentStudents(numberOfDays, baseFilter, exactMatch);
    } else if (downloadType === 'consecutive-absentee') {
      // Fetch consecutive absent students
      students = await getConsecutiveAbsentStudents(numberOfDays, baseFilter, exactMatch);
    } else {
      // Default: student-data
      students = await Student.find(baseFilter).lean();
    }

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found matching the criteria'
      });
    }

    // 3. Get all unique schoolIds from students
    const schoolIds = [...new Set(students.map(s => s.schoolId).filter(Boolean))];
    
    // 4. Fetch school details from district_block_schools collection
    const schoolDetails = await District_Block_School.find({
      schoolId: { $in: schoolIds }
    }).lean();

    // Create a map for quick lookup
    const schoolMap = {};
    schoolDetails.forEach(school => {
      schoolMap[school.schoolId] = {
        districtName: school.districtName || '',
        blockName: school.blockName || '',
        schoolName: school.schoolName || ''
      };
    });

    // 5. Prepare the fields to be included in the download
    const requestedFields = {
      'S.No.': true,
      studentSrn,
      rollNumber,
      firstName,
      fatherName,
      gender,
      category,
      districtName,
      blockName,
      schoolName,
      personalContact,
      ParentContact,
      ...additionalFields
    };

    // Get the list of fields that are requested (value is true or truthy)
    const fieldsToInclude = Object.keys(requestedFields).filter(
      key => requestedFields[key] === true || requestedFields[key] === 'true'
    );

    // If no fields specified, include default fields
    let finalFields = fieldsToInclude.length > 0 ? fieldsToInclude : [
      'S.No.',
      'studentSrn', 
      'rollNumber', 
      'firstName', 
      'fatherName',
      'gender', 
      'category',
      'districtName', 
      'blockName', 
      'schoolName', 
      'personalContact', 
      'ParentContact'
    ];

    // Add specific fields based on download type
    if (downloadType === 'top-absentee') {
      if (!finalFields.includes('presentCount')) {
        finalFields.push('presentCount');
      }
      if (!finalFields.includes('absenceCount')) {
        finalFields.push('absenceCount');
      }
    } else if (downloadType === 'consecutive-absentee') {
      if (!finalFields.includes('consecutiveAbsentDays')) {
        finalFields.push('consecutiveAbsentDays');
      }
    }

    // 6. Enrich student data with school details
    const enrichedStudents = students.map(student => {
      const schoolInfo = schoolMap[student.schoolId] || {};
      return {
        ...student,
        districtName: schoolInfo.districtName || '',
        blockName: schoolInfo.blockName || '',
        schoolName: schoolInfo.schoolName || ''
      };
    });

    // 7. Sort students by: schoolName -> blockName -> districtName -> firstName
    enrichedStudents.sort((a, b) => {
      // First sort by schoolName
      const schoolCompare = (a.schoolName || '').localeCompare(b.schoolName || '');
      if (schoolCompare !== 0) return schoolCompare;
      
      // Then by blockName
      const blockCompare = (a.blockName || '').localeCompare(b.blockName || '');
      if (blockCompare !== 0) return blockCompare;
      
      // Then by districtName
      const districtCompare = (a.districtName || '').localeCompare(b.districtName || '');
      if (districtCompare !== 0) return districtCompare;
      
      // Finally by firstName
      return (a.firstName || '').localeCompare(b.firstName || '');
    });

    // 8. Map student data with requested fields
    const mappedData = enrichedStudents.map((student, index) => {
      const studentData = {};
      
      // Map each requested field
      finalFields.forEach(field => {
        switch(field) {
          case 'S.No.':
            studentData[field] = index + 1;
            break;
          case 'districtName':
            studentData[field] = student.districtName || '';
            break;
          case 'blockName':
            studentData[field] = student.blockName || '';
            break;
          case 'schoolName':
            studentData[field] = student.schoolName || '';
            break;
          case 'category':
            studentData[field] = student.category || '';
            break;
          case 'presentCount':
            studentData[field] = student.presentCount || 0;
            break;
          case 'absenceCount':
            studentData[field] = student.absenceCount || 0;
            break;
          case 'consecutiveAbsentDays':
            studentData[field] = student.consecutiveAbsentDays || 0;
            break;
          default:
            // For fields that exist directly on student object
            studentData[field] = student[field] !== undefined && student[field] !== null 
              ? student[field] 
              : '';
        }
      });
      
      return studentData;
    });

    // 9. Generate file based on format
    const formatLower = format.toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${downloadType}_${timestamp}`;

    switch(formatLower) {
      case 'excel':
      case 'xlsx':
        return await generateExcelFile(mappedData, fileName, res);
      
      case 'csv':
        return await generateCSVFile(mappedData, fileName, res);
      
      case 'pdf':
        return await generatePDFFile(mappedData, fileName, finalFields, res);
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: Excel, CSV, PDF'
        });
    }

  } catch (error) {
    console.error('Error in DownloadStudentData API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while downloading student data',
      error: error.message
    });
  }
};
// Helper function to get top absent students (total absences)
async function getTopAbsentStudents(numberOfDays, baseFilter, exactMatch = false) {
  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numberOfDays);

    console.log('Top Absentee - Date Range:', { startDate, endDate });
    console.log('Top Absentee - Filters:', baseFilter);
    console.log('Top Absentee - Exact Match:', exactMatch);

    // 1. Get all students matching the filters
    const allStudents = await Student.find(baseFilter).lean();
    console.log('Total students matching filters:', allStudents.length);

    if (allStudents.length === 0) {
      return [];
    }

    // 2. Get attendance records for these students in the date range
    const studentObjectIds = allStudents.map(s => s._id);
    
    const attendanceRecords = await StudentAttendance.find({
      unqStudentObjectId: { $in: studentObjectIds },
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ["Present", "present", "PRESENT"] }
    }).lean();

    console.log('Total attendance records found:', attendanceRecords.length);

    // 3. Count present days per student
    const presentCountMap = {};
    attendanceRecords.forEach(record => {
      const studentId = record.unqStudentObjectId.toString();
      presentCountMap[studentId] = (presentCountMap[studentId] || 0) + 1;
    });

    // 4. Calculate absence count for each student
    const totalDays = numberOfDays;

    let studentsWithAttendance = allStudents.map(student => {
      const studentId = student._id.toString();
      const presentCount = presentCountMap[studentId] || 0;
      const absenceCount = totalDays - presentCount;
      
      // 🔥 CONSOLE LOG: Show each student's absence count
      console.log(`📊 Student: ${student.firstName} (${student.studentSrn}) | Present: ${presentCount} days | Absent: ${Math.max(0, absenceCount)} days out of ${totalDays} days`);
      
      return {
        ...student,
        presentCount,
        absenceCount: Math.max(0, absenceCount)
      };
    });

    // 5. If exactMatch is true, filter only students with exact numberOfDays absence
    if (exactMatch) {
      studentsWithAttendance = studentsWithAttendance.filter(
        student => student.absenceCount === numberOfDays
      );
      console.log(`Students with exactly ${numberOfDays} absences:`, studentsWithAttendance.length);
    }

    // 🔥 FINAL SUMMARY: Show top absent students
    console.log('📊 TOP ABSENT STUDENTS SUMMARY:');
    console.log('=========================================');
    studentsWithAttendance.slice(0, 10).forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} (${student.studentSrn}) - Absent: ${student.absenceCount}/${numberOfDays} days`);
    });
    if (studentsWithAttendance.length > 10) {
      console.log(`... and ${studentsWithAttendance.length - 10} more students`);
    }
    console.log('=========================================');

    return studentsWithAttendance;

  } catch (error) {
    console.error('Error in getTopAbsentStudents:', error);
    throw new Error(`Failed to fetch top absent students: ${error.message}`);
  }
}

// Helper function to get consecutive absent students
async function getConsecutiveAbsentStudents(numberOfDays, baseFilter, exactMatch = false) {
  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numberOfDays);

    console.log('Consecutive Absentee - Date Range:', { startDate, endDate });
    console.log('Consecutive Absentee - Filters:', baseFilter);
    console.log('Consecutive Absentee - Exact Match:', exactMatch);

    // 1. Get all students matching the filters
    const allStudents = await Student.find(baseFilter).lean();
    console.log('Total students matching filters:', allStudents.length);

    if (allStudents.length === 0) {
      return [];
    }

    // 2. Get attendance records for these students in the date range
    const studentObjectIds = allStudents.map(s => s._id);
    
    const attendanceRecords = await StudentAttendance.find({
      unqStudentObjectId: { $in: studentObjectIds },
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).lean();

    console.log('Total attendance records found:', attendanceRecords.length);

    // 3. Group attendance records by student
    const studentAttendanceMap = {};
    attendanceRecords.forEach(record => {
      const studentId = record.unqStudentObjectId.toString();
      if (!studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId] = [];
      }
      studentAttendanceMap[studentId].push({
        date: record.date,
        status: record.status
      });
    });

    // 4. Calculate consecutive absent days for each student
    let studentsWithConsecutiveAbsence = allStudents.map(student => {
      const studentId = student._id.toString();
      const attendance = studentAttendanceMap[studentId] || [];
      
      // Create a set of present dates for quick lookup
      const presentDateSet = new Set();
      attendance.forEach(record => {
        if (record.status === 'Present' || record.status === 'present' || record.status === 'PRESENT') {
          const dateStr = record.date.toISOString().split('T')[0];
          presentDateSet.add(dateStr);
        }
      });
      
      // Check consecutive absence from endDate backwards
      let consecutiveAbsentDays = 0;
      let currentDate = new Date(endDate);
      
      for (let i = 0; i < numberOfDays; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if student was present on this date
        if (presentDateSet.has(dateStr)) {
          // Student was present, break the streak
          break;
        } else {
          // Student was absent (no record or record with Absent status)
          consecutiveAbsentDays++;
        }
        
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return {
        ...student,
        consecutiveAbsentDays,
        totalAttendanceRecords: attendance.length
      };
    });

    // 5. If exactMatch is true, filter only students with exact numberOfDays consecutive absence
    if (exactMatch) {
      studentsWithConsecutiveAbsence = studentsWithConsecutiveAbsence.filter(
        student => student.consecutiveAbsentDays === numberOfDays
      );
      console.log(`Students with exactly ${numberOfDays} consecutive absences:`, studentsWithConsecutiveAbsence.length);
    }

    return studentsWithConsecutiveAbsence;

  } catch (error) {
    console.error('Error in getConsecutiveAbsentStudents:', error);
    throw new Error(`Failed to fetch consecutive absent students: ${error.message}`);
  }
}

// Helper function to generate Excel file
async function generateExcelFile(data, fileName, res) {
  try {
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data to export to Excel'
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    throw new Error(`Excel generation failed: ${error.message}`);
  }
}

// Helper function to generate CSV file
async function generateCSVFile(data, fileName, res) {
  try {
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data to export to CSV'
      });
    }

    const fields = Object.keys(data[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    res.send(csv);
  } catch (error) {
    throw new Error(`CSV generation failed: ${error.message}`);
  }
}

// Helper function to generate PDF file
async function generatePDFFile(data, fileName, fields, res) {
  try {
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data to export to PDF'
      });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    });

    // Title based on download type
    let title = 'Student Data Report';
    if (fileName.includes('top-absentee')) {
      title = 'Top Absentee Students Report';
    } else if (fileName.includes('consecutive-absentee')) {
      title = 'Consecutive Absent Students Report';
    }

    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    
    // Add timestamp
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();
    
    // Add total count
    doc.fontSize(12).text(`Total Students: ${data.length}`, { align: 'center' });
    doc.moveDown(2);

    // If data is too large, limit to first 50 records for PDF
    const displayData = data.length > 50 ? data.slice(0, 50) : data;
    const hasMoreData = data.length > 50;

    // Table headers
    const tableTop = doc.y;
    const tableHeaders = fields.map(field => {
      if (field === 'S.No.') return 'S.No.';
      if (field === 'absenceCount') return 'Absent Days';
      if (field === 'presentCount') return 'Present Days';
      if (field === 'consecutiveAbsentDays') return 'Consecutive Absent Days';
      return field.replace(/([A-Z])/g, ' $1').trim()
        .replace(/^./, str => str.toUpperCase());
    });
    
    const columnWidth = Math.min((doc.page.width - 60) / tableHeaders.length, 150);
    
    // Draw header background
    doc.rect(30, tableTop, doc.page.width - 60, 25)
       .fill('#4472C4')
       .fillColor('white');
    
    // Write headers
    let xPos = 30;
    doc.fontSize(8).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 5, tableTop + 5, {
        width: columnWidth - 10,
        align: 'left'
      });
      xPos += columnWidth;
    });

    let yPos = tableTop + 25;
    doc.font('Helvetica').fontSize(7);

    // Write data rows
    displayData.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (yPos > doc.page.height - 50) {
        doc.addPage();
        yPos = 30;
        
        // Redraw headers on new page
        doc.rect(30, yPos, doc.page.width - 60, 25)
           .fill('#4472C4')
           .fillColor('white');
        
        xPos = 30;
        doc.font('Helvetica-Bold').fontSize(8);
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos + 5, yPos + 5, {
            width: columnWidth - 10,
            align: 'left'
          });
          xPos += columnWidth;
        });
        
        yPos += 25;
        doc.font('Helvetica').fontSize(7);
      }

      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.rect(30, yPos, doc.page.width - 60, 18)
           .fill('#E9ECF4')
           .fillColor('black');
      }

      // Write row data
      xPos = 30;
      fields.forEach(field => {
        const value = row[field] !== undefined && row[field] !== null ? String(row[field]) : '';
        // Truncate long text
        const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
        doc.text(displayValue, xPos + 5, yPos + 3, {
          width: columnWidth - 10,
          align: 'left'
        });
        xPos += columnWidth;
      });

      yPos += 18;
    });

    // Add note about truncated data
    if (hasMoreData) {
      doc.fontSize(10).text(`\nNote: Showing first 50 of ${data.length} records. Download Excel/CSV for complete data.`, 30, yPos + 10);
    }

    // Add page numbers
    const pages = doc.bufferedPageRange();
    if (pages && pages.count > 0) {
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(
          `Page ${i + 1} of ${pages.count}`,
          30,
          doc.page.height - 30,
          { align: 'center' }
        );
      }
    }

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}




//Student add request



export const getstudentAddRequest = async (req, res) => {
  try {
    const { districtIds, request, requestStatus } = req.body;

    // Validate required fields
    if (!districtIds || !Array.isArray(districtIds) || districtIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "districtIds must be a non-empty array"
      });
    }

    // Build the filter object for students
    const filter = {
      districtId: { $in: districtIds }
    };

    // Add request filter if provided - handles both array and single string
    if (request) {
      if (Array.isArray(request) && request.length > 0) {
        filter.request = { $in: request };
      } else if (typeof request === 'string') {
        filter.request = request;
      }
    }

    // Add requestStatus filter if provided - handles both array and single string
    if (requestStatus) {
      if (Array.isArray(requestStatus) && requestStatus.length > 0) {
        filter.requestStatus = { $in: requestStatus };
      } else if (typeof requestStatus === 'string') {
        filter.requestStatus = requestStatus;
      }
    }

    console.log("Final Filter:", filter);

    // Fetch students with the constructed filter
    const students = await Student.find(filter)
      .select({
        _id: 1,
        studentSrn: 1,
        firstName: 1,
        fatherName: 1,
        gender: 1,
        districtId: 1,
        blockId: 1,
        schoolId: 1,
        batch: 1,
        slc: 1,
        isSlcTaken: 1,
        request: 1,
        requestDate: 1,
        requestStatus: 1,
        requestApprovedBy: 1
      })
      .lean();

    // If no students found, return empty array
    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        filters: {
          districtIds,
          request: request || 'All',
          requestStatus: requestStatus || 'All'
        }
      });
    }

    // Extract all unique schoolIds from students
    const schoolIds = [...new Set(students.map(student => student.schoolId).filter(id => id))];

    // Fetch district_block_school data for all schoolIds
    const schoolData = await District_Block_School.find({
      schoolId: { $in: schoolIds }
    }).lean();

    // Create a map for quick lookup: schoolId -> school data
    const schoolMap = {};
    schoolData.forEach(school => {
      schoolMap[school.schoolId] = {
        districtName: school.districtName || null,
        blockName: school.blockName || null,
        schoolName: school.schoolName || null
      };
    });

    // Enrich student data with district, block, and school names
    const enrichedStudents = students.map(student => {
      const schoolInfo = schoolMap[student.schoolId] || {};
      
      return {
        _id: student._id,
        studentSrn: student.studentSrn,
        firstName: student.firstName,
        fatherName: student.fatherName,
        gender: student.gender,
        districtId: student.districtId,
        districtName: schoolInfo.districtName || null,
        blockId: student.blockId,
        blockName: schoolInfo.blockName || null,
        schoolId: student.schoolId,
        schoolName: schoolInfo.schoolName || null,
        batch: student.batch,
        slc: student.slc,
        isSlcTaken: student.isSlcTaken,
        request: student.request,
        requestDate: student.requestDate,
        requestStatus: student.requestStatus,
        requestApprovedBy: student.requestApprovedBy
      };
    });

    // Return response
    return res.status(200).json({
      success: true,
      count: enrichedStudents.length,
      data: enrichedStudents,
      filters: {
        districtIds,
        request: request || 'All',
        requestStatus: requestStatus || 'All'
      }
    });

  } catch (error) {
    console.error("Error in getstudentAddRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};




export const studentAddUpdatedApi = async (req, res) => {

console.log("I am in student.controller.js, api: studentAddUpdateApi")

  try {
    const { studentId, requestStatus, approvedByUserId, request } = req.body;

    console.log(req.body)

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required"
      });
    }

    if (!requestStatus) {
      return res.status(400).json({
        success: false,
        message: "requestStatus is required (Approved or Rejected)"
      });
    }

    // Validate requestStatus value
    if (!['Approved', 'Rejected'].includes(requestStatus)) {
      return res.status(400).json({
        success: false,
        message: "requestStatus must be either 'Approved' or 'Rejected'"
      });
    }

    // Validate request field
    if (!request) {
      return res.status(400).json({
        success: false,
        message: "request is required"
      });
    }

    // Check if student exists
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Prepare update object
    const updateData = {
      requestStatus: requestStatus,
      requestApprovedBy: approvedByUserId || null,
      request: request
    };

    // If Approved, update based on request type
    if (requestStatus === 'Approved') {
      if (request === 'Removed') {
        // Case: request is "Removed" and status is "Approved"
        updateData.slc = null;
        updateData.isSlcTaken = null;
        updateData.studentCRUDStatus = 'Removed';
        updateData.studentRemoveDate = new Date().toISOString();
        updateData.studentCreationDate = null;
        updateData.slcReleasingDate = null;
      } 
      else if (request === 'SLC Released') {
        // Case: request is "SLC Released" and status is "Approved"
        updateData.slc = null;
        updateData.isSlcTaken = null;
        updateData.studentCRUDStatus = 'SLC Released';
        updateData.slcReleasingDate = new Date();
        updateData.studentRemoveDate = null;
        updateData.studentCreationDate = null;
      } 
      else if (request === 'Added') {
        // Case: request is "Added" and status is "Approved"
        updateData.slc = true;
        updateData.isSlcTaken = false;
        updateData.studentCRUDStatus = 'Added';
        updateData.studentCreationDate = new Date();
        updateData.studentRemoveDate = null;
        updateData.slcReleasingDate = null;
      }
      else {
        // Default case for any other request type
        updateData.slc = null;
        updateData.isSlcTaken = null;
      }
    } 
    // If Rejected, update based on request type
    else if (requestStatus === 'Rejected') {
      if (request === 'Added') {
          updateData.slc = null;
        updateData.isSlcTaken = null;
      } 
      else if (request === 'Removed') {
      updateData.slc = true;
        updateData.isSlcTaken = false;
      } 
      else if (request === 'SLC Released') {
         updateData.slc = true;
        updateData.isSlcTaken = false;
      }
      else {
        // Default case: Keep existing values
        // Do NOT change slc, isSlcTaken, or date fields
        
      }
      
      // CRITICAL: For Rejected, we DO NOT update slc, isSlcTaken, 
      // studentCRUDStatus, or any date fields
      // They remain as they are in the database
    }

    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true, runValidators: false }
    )
    .select({
      _id: 1,
      studentSrn: 1,
      firstName: 1,
      fatherName: 1,
      gender: 1,
      districtId: 1,
      blockId: 1,
      schoolId: 1,
      batch: 1,
      slc: 1,
      isSlcTaken: 1,
      request: 1,
      requestDate: 1,
      requestStatus: 1,
      requestApprovedBy: 1,
      studentCRUDStatus: 1,
      studentCreationDate: 1,
      studentRemoveDate: 1,
      slcReleasingDate: 1
    })
    .lean();

    // Fetch school data for enrichment
    if (updatedStudent && updatedStudent.schoolId) {
      const schoolInfo = await District_Block_School.findOne({
        schoolId: updatedStudent.schoolId
      }).lean();

      const enrichedStudent = {
        ...updatedStudent,
        districtName: schoolInfo?.districtName || null,
        blockName: schoolInfo?.blockName || null,
        schoolName: schoolInfo?.schoolName || null
      };

      return res.status(200).json({
        success: true,
        message: `Student request ${requestStatus.toLowerCase()} successfully`,
        data: enrichedStudent
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student request ${requestStatus.toLowerCase()} successfully`,
      data: updatedStudent
    });

  } catch (error) {
    console.error("Error in studentAddUpdatedApi:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};