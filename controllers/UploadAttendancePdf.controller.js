// BACKEND/controllers/UploadAttendancePdf.controller.js

//Business logic for UploadAttendancePdf.model.js

import { AttendancePdf } from "../models/UploadAttendancePdf.model.js";
import { Student } from "../models/student.model.js";
import DistrictBlockSchool from "./DistrictBlockSchool.json" assert { type: "json" };
import { uploadToDOStorage } from "../utils/digitalOceanSpacesAttendancePdf.utils.js";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import { District_Block_School } from "../models/district_block_school.model.js";




//Createing a cron job for initializing attendance data in backend. So that i can track, 
//... both uploaded pdf (which has url and bollean type true) and not uploaded pdf.

export const createAttendancePdfCronJob = async (req, res) => {
    console.log("Running Attendance PDF Initialization Cron Job");

  const {date} = req.body;
    console.log(date)



    try {


      //Checks for duplicacy and if there is duplicacy then stops further executino
      
                // Step 1: Get current date at midnight UTC (00:00:00)
                      const currentDate = date ? new Date(date) : new Date();
                      currentDate.setUTCHours(0, 0, 0, 0); // ensures it's in format: 2025-05-19T00:00:00.000Z
              
                      // Step 2: Check if attendance for current date already exists
                      const existingAttendance = await AttendancePdf.findOne({ date: currentDate });
              
                      if (existingAttendance) {
                          console.log("Attendance Pdf already created");
                          return res.status(400).json({ message: "Attendance already created for today" });
                      }
      
              //---------------------------------------------------------------------------
      



      // const today = new Date();
      // const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  
      for (const school of DistrictBlockSchool) {
       // const classes = ["9", "10"]; // Class 9 and 10

           const classes = ["10"]; // Class 9 and 10
  
        for (const classofStudent of classes) {
          // Check if record already exists for this school and class today
          const alreadyExists = await AttendancePdf.findOne({
            schoolId: school.schoolId,
            classofStudent,
            dateOfUpload: {
              $gte: currentDate,
            },
          });

         if (alreadyExists) {
                    console.log("Attendance pdf already created");
                    return res.status(400).json({ message: "Attendance pdf already created for this date" });
                }

  
          if (!alreadyExists) {
            const newRecord = new AttendancePdf({
              unqUserObjectId: null,
              userId: null, // keep empty, will be set during actual upload
              districtId: school.districtId,
              districtName: school.districtName,
              blockId: school.blockId,
              blockName: school.blockName,
              schoolId: school.schoolId,
              schoolName: school.schoolName,
            //   dateOfUpload: new Date().toISOString().split["T"][0],
              classofStudent,
              isPdfUploaded: false,
              fileName: "",
              fileUrl: "",
              dateOfUpload: date || new Date().toISOString().split("T")[0],
            });
  
            await newRecord.save();
            console.log(`Initialized attendance for ${school.schoolName} - Class ${classofStudent}`);
            
          } else {
            console.log(`Already exists: ${school.schoolName} - Class ${classofStudent}`);
          }
        }
      }
  
      console.log("Attendance PDF initialization complete.");
      res.status(200).json({status:"success", message:"Attendance instance created successfully"})
    } catch (error) {
      console.error("Error in Attendance Cron Job:", error);
    }
  };
//-----------------------------------------------------------------------------
  
  //Get API. By school ID aND DATE

export const GetDataBySchoolId = async (req, res) => {

    const  {schoolId, dateOfUpload, classofStudent} = req.body;
    console.log(req.body)
    console.log(new Date(dateOfUpload))
    const formattedDate = new Date(dateOfUpload)
      try {
              const response = await AttendancePdf.find({schoolId:schoolId, dateOfUpload:formattedDate, classofStudent:{$in:classofStudent} })
  
              res.status(200).json({status: "success", data: response})

              console.log(response)
  
      } catch (error) {
          console.log("Error fetching data", error)
          
          res.status(500).json({status: "failed", message: error})
  
      }
  }

  //-----------------------------------------------------------


  //Patch API To update attendance file pdf
// Multer for memory storage
const storage = multer.memoryStorage();
export const uploadAttendancePdfFile = multer({ storage }).single('file');

// PATCH API to upload & update attendance PDF
export const PatchAttendancePdf = async (req, res) => {
    console.log(" I am inside patch attendance pdf controller")
  try {
    const { schoolId, classofStudent, dateOfUpload} = req.query;
    const file = req.file;
    const {userId, unqUserObjectId} = req.body;


    if (!schoolId || !classofStudent || !dateOfUpload) {
      return res.status(400).json({ status: "Error", message: "Missing query parameters" });
    }

    if (!file) {
      return res.status(400).json({ status: "Error", message: "No file uploaded" });
    }

    const record = await AttendancePdf.findOne({ schoolId, classofStudent, dateOfUpload });

    if (!record) {
      return res.status(404).json({ status: "Error", message: "Attendance record not found" });
    }

    const fileExt = file.originalname.split('.').pop();
    const schoolNameSanitized = record.schoolName.toLowerCase().replace(/\s+/g, '_');
    const fileName = `${schoolNameSanitized}_${dateOfUpload}_${classofStudent}.${fileExt}`;

    const fileUrl = await uploadToDOStorage(file.buffer, `attendancepdf/${fileName}`, file.mimetype);


    console.log(record)

    record.fileName = fileName;
    record.fileUrl = fileUrl;
    record.isPdfUploaded = true;
    record.userId = userId || "Admin";
    record.unqUserObjectId = unqUserObjectId

    await record.save();




    res.status(200).json({
      status: "Success",
      message: "PDF uploaded and attendance record updated",
      data: record,
    });

   

  } catch (error) {
    console.error("Error uploading PDF:", error.message);
    res.status(500).json({ status: "Error", message: error.message });
  }
};

//------------------------------------------------------------------------------------




//version 2 apis


// Patch API To update attendance file pdf
// Multer for memory storage
// const storage = multer.memoryStorage();
// export const uploadAttendancePdfFile = multer({ storage }).single('file');

// PATCH API to upload & update attendance PDF (Update Only)



export const uploadAttendancePdf = async (req, res) => {
    console.log("I am in UploadAttendancePdf.controller.js, api:uploadAttendancePdf")

    try {
        const { 
            unqUserObjectId,
            district_block_schoolsObjectId,
            batch,
            dateOfUpload,
            isPdfUploaded,
            fileName: providedFileName,
            fileUrl: providedFileUrl
        } = req.body;

        console.log(req.body)
        const file = req.file;

        // Validate required fields for finding/creating the record
        if (!district_block_schoolsObjectId || !batch || !dateOfUpload) {
            return res.status(400).json({ 
                status: "Error", 
                message: "Missing required fields. Required: district_block_schoolsObjectId, batch, dateOfUpload" 
            });
        }

        // Process file if uploaded via multer (priority over provided fileUrl/fileName)
        let finalFileUrl = providedFileUrl;
        let finalFileName = providedFileName;

        if (file) {
            // Generate file name from uploaded file
            const fileExt = file.originalname.split('.').pop();
            const sanitizedDate = new Date(dateOfUpload).toISOString().split('T')[0];
            finalFileName = `attendance_${district_block_schoolsObjectId}_${sanitizedDate}_${batch}.${fileExt}`;
            
            // Upload to cloud storage
            finalFileUrl = await uploadToDOStorage(file.buffer, `attendancepdf/${finalFileName}`, file.mimetype);
        }

        // Find or create the attendance record
        let record = await AttendancePdf.findOne({ 
            district_block_schoolsObjectId, 
            batch, 
            dateOfUpload 
        });

        if (!record) {
            // Create new record if not found
            record = new AttendancePdf({
              unqUserObjectId:unqUserObjectId,
                district_block_schoolsObjectId:district_block_schoolsObjectId,
                batch,
                dateOfUpload,
                unqUserObjectId: unqUserObjectId || null,
                fileName: finalFileName || null,
                fileUrl: finalFileUrl || null,
                isPdfUploaded: file ? true : (isPdfUploaded || false)
            });
        } else {
            // Update existing record with provided fields
            if (unqUserObjectId) record.unqUserObjectId = unqUserObjectId;
            if (batch) record.batch = batch;
            if (isPdfUploaded !== undefined) record.isPdfUploaded = isPdfUploaded;
            if (finalFileName) record.fileName = finalFileName;
            if (finalFileUrl) record.fileUrl = finalFileUrl;
            
            // Always update these if file is uploaded
            if (file) {
                record.isPdfUploaded = true;
            }
        }

        await record.save();

        // Fetch the updated/created record with populated references
        const updatedRecord = await AttendancePdf.findById(record._id)
            .populate('district_block_schoolsObjectId unqUserObjectId');

        res.status(200).json({
            status: "Success",
            message: record.isNew ? "Attendance record created and PDF uploaded successfully" : "PDF uploaded and attendance record updated successfully",
            data: updatedRecord,
        });

    } catch (error) {
        console.error("Error uploading PDF:", error.message);
        res.status(500).json({ 
            status: "Error", 
            message: error.message 
        });
    }
};


// export const getAttendancePdf = async (req, res) => {
//   const { schoolId, dateOfUpload, batch } = req.body;

//   try {
//     // Build match condition for the lookup
//     let matchCondition = {};
    
//     // Add batch filter if provided (always expect batch in req.body)
//     if (batch) {
//       matchCondition.batch = batch;
//     }
    
//     // Add date filter if provided, otherwise use current date
//     let targetDate = dateOfUpload;
//     if (!targetDate) {
//       // Use current date if dateOfUpload not provided
//       targetDate = new Date();
//       targetDate.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
//     } else {
//       targetDate = new Date(dateOfUpload);
//       targetDate.setHours(0, 0, 0, 0);
//     }
    
//     // Create date range for the entire day
//     const nextDay = new Date(targetDate);
//     nextDay.setDate(nextDay.getDate() + 1);
    
//     matchCondition.dateOfUpload = {
//       $gte: targetDate,
//       $lt: nextDay
//     };

//     let pipeline = [
//       {
//         $lookup: {
//           from: "attendancepdfs",
//           let: { schoolId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$district_block_schoolsObjectId", "$$schoolId"] },
//                     { $eq: ["$batch", batch] },
//                     {
//                       $gte: ["$dateOfUpload", targetDate]
//                     },
//                     {
//                       $lt: ["$dateOfUpload", nextDay]
//                     }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: "uploadpdfdetails"
//         }
//       }
//     ];

//     // Add school filter if schoolId is provided
//     if (schoolId) {
//       pipeline.unshift({
//         $match: { schoolId: schoolId }
//       });
//     }

//     const response = await District_Block_School.aggregate(pipeline);
    
//     res.status(200).json({ 
//       status: 'Ok', 
//       data: response,
//       filterApplied: {
//         batch: batch || 'not provided',
//         dateOfUpload: targetDate.toISOString().split('T')[0]
//       }
//     });
    
//   } catch (error) {
//     console.log("Error occurred in getAttendancePdf:", error);
//     res.status(500).json({ 
//       status: 'Error', 
//       message: error.message 
//     });
//   }
// };









// export const getAttendancePdf = async (req, res) => {
//   const { schoolId, dateOfUpload, batch } = req.body;

//   console.log(req.body)

//   try {
//     // Validate required fields
//     if (!batch) {
//       return res.status(400).json({
//         status: 'Error',
//         message: 'Batch is required'
//       });
//     }

//     // Handle schoolId - can be string, array, or undefined
//     let schoolIdsArray = [];
//     if (schoolId) {
//       // If schoolId is a string, convert to array
//       if (typeof schoolId === 'string') {
//         schoolIdsArray = [schoolId];
//       } 
//       // If schoolId is an array, use it directly
//       else if (Array.isArray(schoolId)) {
//         schoolIdsArray = schoolId;
//       }
//       // If it's a number, convert to string and make array
//       else if (typeof schoolId === 'number') {
//         schoolIdsArray = [schoolId.toString()];
//       }
//     }
    
//     // Add date filter if provided, otherwise use current date
//     let targetDate = dateOfUpload;
//     if (!targetDate) {
//       // Use current date if dateOfUpload not provided
//       targetDate = new Date();
//       targetDate.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
//     } else {
//       targetDate = new Date(dateOfUpload);
//       targetDate.setHours(0, 0, 0, 0);
//     }
    
//     // Create date range for the entire day
//     const nextDay = new Date(targetDate);
//     nextDay.setDate(nextDay.getDate() + 1);
    
//     // Build the match condition for schools
//     let schoolMatchCondition = {};
//     if (schoolIdsArray.length > 0) {
//       schoolMatchCondition.schoolId = { $in: schoolIdsArray };
//     }

//     let pipeline = [
//       {
//         $lookup: {
//           from: "attendancepdfs",
//           let: { schoolObjectId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$district_block_schoolsObjectId", "$$schoolObjectId"] },
//                     { $eq: ["$batch", batch] },
//                     {
//                       $gte: ["$dateOfUpload", targetDate]
//                     },
//                     {
//                       $lt: ["$dateOfUpload", nextDay]
//                     }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: "uploadpdfdetails"
//         }
//       },
//       // Only include schools that have matching attendance records (optional)
//       {
//         $match: {
//           "uploadpdfdetails": { $ne: [] }
//         }
//       }
//     ];

//     // Add school filter if schoolIdsArray has values
//     if (schoolIdsArray.length > 0) {
//       pipeline.unshift({
//         $match: schoolMatchCondition
//       });
//     }

//     const response = await District_Block_School.aggregate(pipeline);
    
//     res.status(200).json({ 
//       status: 'Ok', 
//       data: response,
//       filterApplied: {
//         schoolIds: schoolIdsArray.length > 0 ? schoolIdsArray : 'All schools',
//         batch: batch,
//         dateOfUpload: targetDate.toISOString().split('T')[0]
//       },
//       summary: {
//         totalSchoolsFound: response.length,
//         schoolsWithAttendance: response.filter(school => school.uploadpdfdetails.length > 0).length
//       }
//     });
    
//   } catch (error) {
//     console.log("Error occurred in getAttendancePdf:", error);
//     res.status(500).json({ 
//       status: 'Error', 
//       message: error.message 
//     });
//   }
// };




export const getAttendancePdf = async (req, res) => {
  const { schoolId, dateOfUpload, batch } = req.body;

  try {
    if (!batch) {
      return res.status(400).json({
        status: 'Error',
        message: 'Batch is required'
      });
    }

    // Convert schoolId to array
    let schoolIdsArray = [];
    if (schoolId) {
      schoolIdsArray = Array.isArray(schoolId) ? schoolId : [schoolId.toString()];
    }
    
    // Setup date range
    let targetDate = dateOfUpload ? new Date(dateOfUpload) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // First get all schools
    let schoolQuery = {};
    if (schoolIdsArray.length > 0) {
      schoolQuery.schoolId = { $in: schoolIdsArray };
    }
    
    const schools = await District_Block_School.find(schoolQuery);
    const schoolObjectIds = schools.map(s => s._id);
    
    // Then get all attendance records for these schools
    const attendanceRecords = await AttendancePdf.find({
      district_block_schoolsObjectId: { $in: schoolObjectIds },
      batch: batch,
      dateOfUpload: { $gte: targetDate, $lt: nextDay }
    });
    
    // Create a map of attendance records by school ID
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      const schoolIdStr = record.district_block_schoolsObjectId.toString();
      if (!attendanceMap.has(schoolIdStr)) {
        attendanceMap.set(schoolIdStr, []);
      }
      attendanceMap.get(schoolIdStr).push(record);
    });
    
    // Combine schools with their attendance records
    const response = schools.map(school => ({
      ...school.toObject(),
      uploadpdfdetails: attendanceMap.get(school._id.toString()) || []
    }));
    
    res.status(200).json({ 
      status: 'Ok', 
      data: response,
      summary: {
        totalSchoolsFound: response.length,
        schoolsWithAttendance: response.filter(s => s.uploadpdfdetails.length > 0).length
      }
    });
    
  } catch (error) {
    console.log("Error occurred:", error);
    res.status(500).json({ 
      status: 'Error', 
      message: error.message 
    });
  }
};