//Writing all the Business logic, Rest APIs, for student.model.js;

import dotenv from "dotenv";
dotenv.config();


import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// import { Student } from "../models/Student.model.js";

// import  {Student}  from "../models/student.model.js"
// import  StudentDb  from "../models/student.model.js";

import path from "path";
import multer from "multer";
import AWS from "aws-sdk"; 
import {Student, StudentUpload, StudentUploadObjective}  from "../models/student.model.js";


import { District_Block_School } from "../models/district_block_school.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";
import { constants } from "buffer";



export const createStudentUploadObjective = async (req, res) => {
  const {
    objective,
    dateOfObjective,
    subject,
    batch,
    submissionDate,
    descriptionOfObject,
  } = req.body;

  try {
    // Basic validation
    if (!objective) {
      return res.status(400).json({
        success: false,
        message: "Objective is required",
      });
    }

    const newObjective = await StudentUploadObjective.create({
      objective,
      dateOfObjective,
      subject,
      batch,
      submissionDate,
      descriptionOfObject,
    });

    return res.status(201).json({
      success: true,
      message: "Student upload objective created successfully",
      data: newObjective,
    });
  } catch (error) {
    console.error("Create Student Upload Objective Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



//Upload files

// DigitalOcean Spaces Client
const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

export const UplaoadStudentFiles = async (req, res) => {
  try {
    const {

      unqStudentObjectId,
      batch,
      uploadType,
      subject,
      dateOfSubmission,
      topic,
      unqObjectIdOfStudentUploads
    } = req.body;

    // Folder can be changed anytime
    const digitalOceanFolder = "studentuploads";

    // Validation
    if (!unqStudentObjectId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const bucketName = process.env.DO_SPACES_BUCKET;

    // Generate unique file name
    const timestamp = Date.now();

    const fileName = `${timestamp}-${req.file.originalname.replace(
      /\s+/g,
      "-"
    )}`;

    const fileKey = `${digitalOceanFolder}/${fileName}`;

    // Upload to Spaces
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: req.file.buffer,
      ACL: "public-read",
      ContentType: req.file.mimetype,
    });

    await s3.send(uploadCommand);

    // Generate public URL
    const fileUrl = `${
      process.env.DO_SPACES_CDN ||
      `https://${bucketName}.${process.env.DO_SPACES_ENDPOINT.replace(
        "https://",
        ""
      )}`
    }/${fileKey}`;

    // Save in DB
    const studentUpload = await StudentUpload.create({
      unqStudentObjectId,
      fileName,
      fileUrl,
      batch,
      uploadType,
      subject,
      dateOfSubmission,
      topic,
      fileType: req.file.mimetype,
    });

    studentUpload.unqObjectIdOfStudentUploads = unqObjectIdOfStudentUploads;
    await studentUpload.save();

    return res.status(201).json({
      success: true,
      message: "Student file uploaded successfully",
      data: studentUpload,
    });
  } catch (error) {
    console.error("Upload Student File Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload student file",
      error: error.message,
    });
  }
};








//get studentuploadsobjectives

export const getStudentUploadsObjectives = async (req, res) => {

  try {

    // Start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const objectives = await StudentUploadObjective.find({
      submissionDate: {
        $gte: today,
      },
    }).sort({ submissionDate: 1 });

    return res.status(200).json({
      success: true,
      count: objectives.length,
      data: objectives,
    });

  } catch (error) {

    console.error("Error fetching objectives:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch objectives",
      error: error.message,
    });

  }
};



//get students for uploads
export const GetStudentsForUploads = async (req, res) => {

  console.log("I am in StudentUpload.controller.js, api: GetStudentsForUploads")

  try {
    const {
      districtId,
      blockId,
      schoolId,
      batch,
      idofstudentuploadobjectives,
    } = req.body;
    
    console.log(req.body)

    let isSlcTaken = false;

    console.log(req.body);
    console.log(
      "i am inside 'student.controller.js' and api: 'GetStudentsForUploads'"
    );

    // -----------------------------
    // Validate objective id
    // -----------------------------
    if (!idofstudentuploadobjectives) {
      return res.status(400).json({
        success: false,
        message: "idofstudentuploadobjectives is required",
      });
    }

    const objective =
      await StudentUploadObjective.findById(
        idofstudentuploadobjectives
      );

    if (!objective) {
      return res.status(404).json({
        success: false,
        message: "Student Upload Objective not found",
      });
    }

    // -----------------------------
    // Build student query
    // -----------------------------
    let studentQuery = {};

    if (districtId?.length > 0) {
      studentQuery.districtId = {
        $in: districtId,
      };
    }

    if (blockId?.length > 0) {
      studentQuery.blockId = {
        $in: blockId,
      };
    }

    if (schoolId?.length > 0) {
      studentQuery.schoolId = {
        $in: schoolId,
      };
    }

    if (batch?.length > 0) {
      studentQuery.batch = {
        $in: batch,
      };
    }

    if (
      isSlcTaken !== undefined &&
      isSlcTaken !== null &&
      isSlcTaken !== ""
    ) {
      studentQuery.isSlcTaken = isSlcTaken;
    }

    console.log("Student Query:", studentQuery);

    // -----------------------------
    // Fetch students
    // -----------------------------
    const students = await Student.find(studentQuery);

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        filters: studentQuery,
        objective,
      });
    }

    const studentIds = students.map(
      (student) => student._id
    );

    // -----------------------------
    // Fetch uploads for this objective
    // -----------------------------
    const uploadRecords = await StudentUpload.find({
      unqStudentObjectId: {
        $in: studentIds,
      },
      unqObjectIdOfStudentUploads:
        new mongoose.Types.ObjectId(
          idofstudentuploadobjectives
        ),
    });

    console.log(
      `Found ${uploadRecords.length} uploads for objective ${idofstudentuploadobjectives}`
    );

    // -----------------------------
    // Create Upload Map
    // studentId -> upload
    // -----------------------------
    const uploadMap = new Map();

    uploadRecords.forEach((upload) => {
      uploadMap.set(
        upload.unqStudentObjectId.toString(),
        upload
      );
    });

    // -----------------------------
    // Attach upload status
    // -----------------------------
    const studentsWithUploadStatus =
      students.map((student) => {
        const studentId =
          student._id.toString();

        const uploadRecord =
          uploadMap.get(studentId);

        const studentObj =
          student.toObject();

        studentObj.isUploaded =
          !!uploadRecord;

        studentObj.uploadStatus =
          uploadRecord
            ? "Uploaded"
            : "Pending";

        studentObj.uploadRecord =
          uploadRecord
            ? uploadRecord.toObject()
            : null;

        return studentObj;
      });

    // -----------------------------
    // Response
    // -----------------------------
    return res.status(200).json({
      success: true,
      count:
        studentsWithUploadStatus.length,
      filters: studentQuery,
      objective,
      data: studentsWithUploadStatus,
    });
  } catch (error) {
    console.error(
      "Error fetching students upload status:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching students upload status",
      error: error.message,
    });
  }
};




//Delet uploads

export const DeletUploads = async (req, res) => {

  const {_id} = req.body;

  try {
    const response = await StudentUpload.deleteOne({_id:_id})
    res.status(200).json({status:"Ok", data:"Deleted successfully"})
  } catch (error) {
    res.status(400).json({status:"failed", error:error})
  }
}














// // StudentUploadDashboard controller
// export const StudentUploadDashboard = async (req, res) => {
//   console.log("I am in StudentUpload.controller.js, api: StudentUploadDashboard");

//   try {
//     const {
//       districtId,
//       blockId,
//       schoolId,
//       batch,
//       idofstudentuploadobjectives,
//     } = req.body;

//     console.log("Dashboard Request Body:", req.body);

//     // -----------------------------
//     // Validate objective id
//     // -----------------------------
//     if (!idofstudentuploadobjectives) {
//       return res.status(400).json({
//         success: false,
//         message: "idofstudentuploadobjectives is required",
//       });
//     }

//     const objective = await StudentUploadObjective.findById(idofstudentuploadobjectives);

//     if (!objective) {
//       return res.status(404).json({
//         success: false,
//         message: "Student Upload Objective not found",
//       });
//     }

//     // -----------------------------
//     // Build base query for students
//     // -----------------------------
//     let baseQuery = {};

//     if (districtId?.length > 0) {
//       baseQuery.districtId = { $in: districtId };
//     }

//     if (blockId?.length > 0) {
//       baseQuery.blockId = { $in: blockId };
//     }

//     if (schoolId?.length > 0) {
//       baseQuery.schoolId = { $in: schoolId };
//     }

//     if (batch?.length > 0) {
//       baseQuery.batch = { $in: batch };
//     }

//     console.log("Base Query:", baseQuery);

//     // -----------------------------
//     // PART 1: Objective-wise Summary
//     // -----------------------------
    
//     // Get total students count for this objective across ALL batches in DB
//     const objectiveSummaryQuery = { ...baseQuery };
//     // Remove batch filter for overall summary if present
//     delete objectiveSummaryQuery.batch;
    
//     const totalStudentsOverall = await Student.countDocuments(objectiveSummaryQuery);
    
//     // Get total uploaded files count for this objective across ALL batches
//     const allStudentsForObjective = await Student.find(objectiveSummaryQuery).select('_id');
//     const allStudentIds = allStudentsForObjective.map(s => s._id);
    
//     const totalUploadsOverall = await StudentUpload.countDocuments({
//       unqStudentObjectId: { $in: allStudentIds },
//       unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//     });
    
//     // Get batch-wise breakdown for the objective
//     const batchWiseBreakdown = await Student.aggregate([
//       { $match: objectiveSummaryQuery },
//       {
//         $group: {
//           _id: "$batch",
//           totalStudents: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);
    
//     // Add upload counts to each batch
//     const batchWiseData = await Promise.all(
//       batchWiseBreakdown.map(async (batchData) => {
//         const studentsInBatch = await Student.find({ 
//           ...objectiveSummaryQuery, 
//           batch: batchData._id 
//         }).select('_id');
        
//         const studentIdsInBatch = studentsInBatch.map(s => s._id);
        
//         const uploadsInBatch = await StudentUpload.countDocuments({
//           unqStudentObjectId: { $in: studentIdsInBatch },
//           unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//         });
        
//         return {
//           batch: batchData._id || "Unknown Batch",
//           totalStudents: batchData.totalStudents,
//           totalUploads: uploadsInBatch,
//           pendingUploads: batchData.totalStudents - uploadsInBatch,
//           completionPercentage: ((uploadsInBatch / batchData.totalStudents) * 100).toFixed(2)
//         };
//       })
//     );

//     // -----------------------------
//     // PART 2: School-wise Summary (based on filters)
//     // -----------------------------
    
//     // Get all schools matching the filters
//     const schoolQuery = { ...baseQuery };
//     const schools = await Student.aggregate([
//       { $match: schoolQuery },
//       {
//         $group: {
//           _id: {
//             schoolId: "$schoolId",
//             schoolName: "$schoolName"
//           },
//           totalStudents: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           schoolId: "$_id.schoolId",
//           schoolName: "$_id.schoolName",
//           totalStudents: 1,
//           _id: 0
//         }
//       },
//       { $sort: { schoolName: 1 } }
//     ]);
    
//     // Add upload counts to each school
//     const schoolWiseData = await Promise.all(
//       schools.map(async (school) => {
//         const studentsInSchool = await Student.find({
//           ...schoolQuery,
//           schoolId: school.schoolId
//         }).select('_id');
        
//         const studentIdsInSchool = studentsInSchool.map(s => s._id);
        
//         const uploadsInSchool = await StudentUpload.countDocuments({
//           unqStudentObjectId: { $in: studentIdsInSchool },
//           unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//         });
        
//         return {
//           schoolId: school.schoolId,
//           schoolName: school.schoolName || "Unknown School",
//           totalStudents: school.totalStudents,
//           totalUploads: uploadsInSchool,
//           pendingUploads: school.totalStudents - uploadsInSchool,
//           completionPercentage: ((uploadsInSchool / school.totalStudents) * 100).toFixed(2)
//         };
//       })
//     );

//     // -----------------------------
//     // Response
//     // -----------------------------
//     return res.status(200).json({
//       success: true,
//       message: "Dashboard data fetched successfully",
//       data: {
//         objective: {
//           id: objective._id,
//           objective: objective.objective,
//           subject: objective.subject,
//           submissionDate: objective.submissionDate,
//           batch: objective.batch
//         },
//         objectiveWiseSummary: {
//           totalStudentsOverall: totalStudentsOverall,
//           totalUploadsOverall: totalUploadsOverall,
//           pendingUploadsOverall: totalStudentsOverall - totalUploadsOverall,
//           overallCompletionPercentage: totalStudentsOverall > 0 
//             ? ((totalUploadsOverall / totalStudentsOverall) * 100).toFixed(2) 
//             : "0.00",
//           batchWiseBreakdown: batchWiseData
//         },
//         schoolWiseSummary: schoolWiseData
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching Student Upload Dashboard:", error);
    
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching dashboard data",
//       error: error.message,
//     });
//   }
// };


// // StudentUploadDashboard controller
// export const StudentUploadDashboard = async (req, res) => {
//   console.log("I am in StudentUpload.controller.js, api: StudentUploadDashboard");

//   try {
//     const {
//       districtId,
//       blockId,
//       schoolId,
//       batch,
//       idofstudentuploadobjectives,
//     } = req.body;

//     console.log("Dashboard Request Body:", req.body);

//     // -----------------------------
//     // Validate objective id
//     // -----------------------------
//     if (!idofstudentuploadobjectives) {
//       return res.status(400).json({
//         success: false,
//         message: "idofstudentuploadobjectives is required",
//       });
//     }

//     const objective = await StudentUploadObjective.findById(idofstudentuploadobjectives);

//     if (!objective) {
//       return res.status(404).json({
//         success: false,
//         message: "Student Upload Objective not found",
//       });
//     }

//     // -----------------------------
//     // Build base query for students
//     // -----------------------------
//     let baseQuery = {};

//     if (districtId?.length > 0) {
//       baseQuery.districtId = { $in: districtId };
//     }

//     if (blockId?.length > 0) {
//       baseQuery.blockId = { $in: blockId };
//     }

//     if (schoolId?.length > 0) {
//       baseQuery.schoolId = { $in: schoolId };
//     }

//     if (batch?.length > 0) {
//       baseQuery.batch = { $in: batch };
//     }

//     console.log("Base Query:", baseQuery);

//     // -----------------------------
//     // PART 1: Objective-wise Summary
//     // -----------------------------
    
//     // Get total students count for this objective across ALL batches in DB
//     const objectiveSummaryQuery = { ...baseQuery };
//     // Remove batch filter for overall summary if present
//     delete objectiveSummaryQuery.batch;
    
//     const totalStudentsOverall = await Student.countDocuments(objectiveSummaryQuery);
    
//     // Get total uploaded files count for this objective across ALL batches
//     const allStudentsForObjective = await Student.find(objectiveSummaryQuery).select('_id');
//     const allStudentIds = allStudentsForObjective.map(s => s._id);
    
//     const totalUploadsOverall = await StudentUpload.countDocuments({
//       unqStudentObjectId: { $in: allStudentIds },
//       unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//     });
    
//     // Get batch-wise breakdown for the objective
//     const batchWiseBreakdown = await Student.aggregate([
//       { $match: objectiveSummaryQuery },
//       {
//         $group: {
//           _id: "$batch",
//           totalStudents: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);
    
//     // Add upload counts to each batch
//     const batchWiseData = await Promise.all(
//       batchWiseBreakdown.map(async (batchData) => {
//         const studentsInBatch = await Student.find({ 
//           ...objectiveSummaryQuery, 
//           batch: batchData._id 
//         }).select('_id');
        
//         const studentIdsInBatch = studentsInBatch.map(s => s._id);
        
//         const uploadsInBatch = await StudentUpload.countDocuments({
//           unqStudentObjectId: { $in: studentIdsInBatch },
//           unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//         });
        
//         return {
//           batch: batchData._id || "Unknown Batch",
//           totalStudents: batchData.totalStudents,
//           totalUploads: uploadsInBatch,
//           pendingUploads: batchData.totalStudents - uploadsInBatch,
//           completionPercentage: ((uploadsInBatch / batchData.totalStudents) * 100).toFixed(2)
//         };
//       })
//     );

//     // -----------------------------
//     // PART 2: School-wise Summary with District and Block names
//     // -----------------------------
    
//     // Get all schools matching the filters with their district and block info
//     const schools = await Student.aggregate([
//       { $match: baseQuery },
//       {
//         $group: {
//           _id: {
//             schoolId: "$schoolId",
//             schoolName: "$schoolName",
//             districtId: "$districtId",
//             districtName: "$districtName",
//             blockId: "$blockId",
//             blockName: "$blockName"
//           },
//           totalStudents: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           schoolId: "$_id.schoolId",
//           schoolName: "$_id.schoolName",
//           districtId: "$_id.districtId",
//           districtName: "$_id.districtName",
//           blockId: "$_id.blockId",
//           blockName: "$_id.blockName",
//           totalStudents: 1,
//           _id: 0
//         }
//       },
//       { $sort: { schoolName: 1 } }
//     ]);
    
//     // Add upload counts to each school
//     const schoolWiseData = await Promise.all(
//       schools.map(async (school) => {
//         const studentsInSchool = await Student.find({
//           ...baseQuery,
//           schoolId: school.schoolId
//         }).select('_id');
        
//         const studentIdsInSchool = studentsInSchool.map(s => s._id);
        
//         const uploadsInSchool = await StudentUpload.countDocuments({
//           unqStudentObjectId: { $in: studentIdsInSchool },
//           unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//         });
        
//         return {
//           schoolId: school.schoolId,
//           schoolName: school.schoolName || "Unknown School",
//           districtId: school.districtId || "N/A",
//           districtName: school.districtName || "N/A",
//           blockId: school.blockId || "N/A",
//           blockName: school.blockName || "N/A",
//           totalStudents: school.totalStudents,
//           totalUploads: uploadsInSchool,
//           pendingUploads: school.totalStudents - uploadsInSchool,
//           completionPercentage: ((uploadsInSchool / school.totalStudents) * 100).toFixed(2)
//         };
//       })
//     );

//     // -----------------------------
//     // PART 3: District-wise Summary
//     // -----------------------------
//     const districtWiseData = await Student.aggregate([
//       { $match: baseQuery },
//       {
//         $group: {
//           _id: {
//             districtId: "$districtId",
//             districtName: "$districtName"
//           },
//           totalStudents: { $sum: 1 },
//           schools: { $addToSet: "$schoolId" }
//         }
//       },
//       {
//         $project: {
//           districtId: "$_id.districtId",
//           districtName: "$_id.districtName",
//           totalStudents: 1,
//           totalSchools: { $size: "$schools" },
//           _id: 0
//         }
//       },
//       { $sort: { districtName: 1 } }
//     ]);

//     // Add upload counts to each district
//     const districtWiseWithUploads = await Promise.all(
//       districtWiseData.map(async (district) => {
//         const studentsInDistrict = await Student.find({
//           ...baseQuery,
//           districtId: district.districtId
//         }).select('_id');
        
//         const studentIdsInDistrict = studentsInDistrict.map(s => s._id);
        
//         const uploadsInDistrict = await StudentUpload.countDocuments({
//           unqStudentObjectId: { $in: studentIdsInDistrict },
//           unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//         });
        
//         return {
//           districtId: district.districtId || "N/A",
//           districtName: district.districtName || "N/A",
//           totalStudents: district.totalStudents,
//           totalSchools: district.totalSchools,
//           totalUploads: uploadsInDistrict,
//           pendingUploads: district.totalStudents - uploadsInDistrict,
//           completionPercentage: ((uploadsInDistrict / district.totalStudents) * 100).toFixed(2)
//         };
//       })
//     );

//     // -----------------------------
//     // PART 4: Block-wise Summary (within districts)
//     // -----------------------------
//     const blockWiseData = await Student.aggregate([
//       { $match: baseQuery },
//       {
//         $group: {
//           _id: {
//             blockId: "$blockId",
//             blockName: "$blockName",
//             districtId: "$districtId",
//             districtName: "$districtName"
//           },
//           totalStudents: { $sum: 1 },
//           schools: { $addToSet: "$schoolId" }
//         }
//       },
//       {
//         $project: {
//           blockId: "$_id.blockId",
//           blockName: "$_id.blockName",
//           districtId: "$_id.districtId",
//           districtName: "$_id.districtName",
//           totalStudents: 1,
//           totalSchools: { $size: "$schools" },
//           _id: 0
//         }
//       },
//       { $sort: { districtName: 1, blockName: 1 } }
//     ]);

//     // Add upload counts to each block
//     const blockWiseWithUploads = await Promise.all(
//       blockWiseData.map(async (block) => {
//         const studentsInBlock = await Student.find({
//           ...baseQuery,
//           blockId: block.blockId
//         }).select('_id');
        
//         const studentIdsInBlock = studentsInBlock.map(s => s._id);
        
//         const uploadsInBlock = await StudentUpload.countDocuments({
//           unqStudentObjectId: { $in: studentIdsInBlock },
//           unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
//         });
        
//         return {
//           blockId: block.blockId || "N/A",
//           blockName: block.blockName || "N/A",
//           districtId: block.districtId || "N/A",
//           districtName: block.districtName || "N/A",
//           totalStudents: block.totalStudents,
//           totalSchools: block.totalSchools,
//           totalUploads: uploadsInBlock,
//           pendingUploads: block.totalStudents - uploadsInBlock,
//           completionPercentage: ((uploadsInBlock / block.totalStudents) * 100).toFixed(2)
//         };
//       })
//     );

//     // -----------------------------
//     // Response
//     // -----------------------------
//     return res.status(200).json({
//       success: true,
//       message: "Dashboard data fetched successfully",
//       data: {
//         objective: {
//           id: objective._id,
//           objective: objective.objective,
//           subject: objective.subject,
//           submissionDate: objective.submissionDate,
//           batch: objective.batch
//         },
//         objectiveWiseSummary: {
//           totalStudentsOverall: totalStudentsOverall,
//           totalUploadsOverall: totalUploadsOverall,
//           pendingUploadsOverall: totalStudentsOverall - totalUploadsOverall,
//           overallCompletionPercentage: totalStudentsOverall > 0 
//             ? ((totalUploadsOverall / totalStudentsOverall) * 100).toFixed(2) 
//             : "0.00",
//           batchWiseBreakdown: batchWiseData
//         },
//         districtWiseSummary: districtWiseWithUploads,
//         blockWiseSummary: blockWiseWithUploads,
//         schoolWiseSummary: schoolWiseData
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching Student Upload Dashboard:", error);
    
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching dashboard data",
//       error: error.message,
//     });
//   }
// };











export const StudentUploadObjectivesDashboard = async (req, res) => {
  try {
    // Define batches to track
    const targetBatches = ["2026-28", "2025-27"];
    
    // Step 1: Get all StudentUploadObjectives for the target batches
    const objectives = await StudentUploadObjective.find({
      batch: { $in: targetBatches }
    }).lean();
    
    if (!objectives.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No objectives found for the specified batches"
      });
    }
    
    // Step 2: Get all students with isSlcTaken: false for target batches
    const students = await Student.find({
      batch: { $in: targetBatches },
      isSlcTaken: false
    }).lean();
    
    // Step 3: Group students by batch
    const studentsByBatch = {};
    students.forEach(student => {
      if (!studentsByBatch[student.batch]) {
        studentsByBatch[student.batch] = [];
      }
      studentsByBatch[student.batch].push(student);
    });
    
    // Step 4: Get all uploads for these objectives and students
    const objectiveIds = objectives.map(obj => obj._id);
    const studentIds = students.map(student => student._id);
    
    const uploads = await StudentUpload.find({
      unqObjectIdOfStudentUploads: { $in: objectiveIds },
      unqStudentObjectId: { $in: studentIds },
      batch: { $in: targetBatches }
    }).lean();
    
    // Step 5: Group uploads by objective ID and batch
    const uploadsByObjectiveAndBatch = {};
    uploads.forEach(upload => {
      const key = `${upload.unqObjectIdOfStudentUploads}_${upload.batch}`;
      if (!uploadsByObjectiveAndBatch[key]) {
        uploadsByObjectiveAndBatch[key] = new Set();
      }
      uploadsByObjectiveAndBatch[key].add(upload.unqStudentObjectId.toString());
    });
    
    // Step 6: Prepare the dashboard data
    const dashboardData = objectives.map(objective => {
      const batchData = {};
      
      targetBatches.forEach(batch => {
        const studentsInBatch = studentsByBatch[batch] || [];
        const totalStudents = studentsInBatch.length;
        
        const uploadKey = `${objective._id}_${batch}`;
        const uploadedCount = uploadsByObjectiveAndBatch[uploadKey] 
          ? uploadsByObjectiveAndBatch[uploadKey].size 
          : 0;
        
        const pendingUploads = totalStudents - uploadedCount;
        
        batchData[batch] = {
          totalStudents: totalStudents,
          uploadedCount: uploadedCount,
          pendingUploads: pendingUploads,
          completionPercentage: totalStudents > 0 
            ? ((uploadedCount / totalStudents) * 100).toFixed(2) 
            : 0
        };
      });
      
      return {
        objectiveId: objective._id,
        objective: objective.objective,
        subject: objective.subject,
        descriptionOfObject: objective.descriptionOfObject,
        dateOfObjective: objective.dateOfObjective,
        submissionDate: objective.submissionDate,
        batchWiseStats: batchData,
        overallStats: {
          totalStudentsAcrossBatches: targetBatches.reduce((sum, batch) => 
            sum + (batchData[batch]?.totalStudents || 0), 0),
          totalUploadedAcrossBatches: targetBatches.reduce((sum, batch) => 
            sum + (batchData[batch]?.uploadedCount || 0), 0),
          totalPendingAcrossBatches: targetBatches.reduce((sum, batch) => 
            sum + (batchData[batch]?.pendingUploads || 0), 0)
        }
      };
    });
    
    // Step 7: Calculate batch-wise overall statistics
    const batchWiseSummary = {};
    targetBatches.forEach(batch => {
      const studentsInBatch = studentsByBatch[batch] || [];
      const totalStudents = studentsInBatch.length;
      
      let totalUploaded = 0;
      dashboardData.forEach(objective => {
        totalUploaded += objective.batchWiseStats[batch]?.uploadedCount || 0;
      });
      
      batchWiseSummary[batch] = {
        totalStudents: totalStudents,
        totalUploadsCompleted: totalUploaded,
        totalObjectivesCount: objectives.filter(obj => obj.batch === batch).length,
        averageCompletion: totalStudents > 0 && objectives.filter(obj => obj.batch === batch).length > 0
          ? ((totalUploaded / (totalStudents * objectives.filter(obj => obj.batch === batch).length)) * 100).toFixed(2)
          : 0
      };
    });
    
    return res.status(200).json({
      success: true,
      data: dashboardData,
      batchWiseSummary: batchWiseSummary,
      targetBatches: targetBatches,
      summary: {
        totalObjectives: objectives.length,
        totalStudentsConsidered: students.length,
        totalUploadsMade: uploads.length
      }
    });
    
  } catch (error) {
    console.error("Error in StudentUploadObjectivesDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};















// StudentUploadDashboard controller
export const StudentUploadDashboard = async (req, res) => {
  console.log("I am in StudentUpload.controller.js, api: StudentUploadDashboard");
  
  const { _id, batch } = req.body;

  try {
    // Validate required fields
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Objective ID is required"
      });
    }

    // Step 1: Get the objective details
    const objective = await StudentUploadObjective.findById(_id);
    
    if (!objective) {
      return res.status(404).json({
        success: false,
        message: "Objective not found"
      });
    }

    // Use batch from request or from objective
    const targetBatch = batch || objective.batch;

    // Step 2: Get ALL schools that are not closed
    const allSchools = await District_Block_School.find({
      isCenterClosed: false
    }).lean();

    if (!allSchools.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No active schools found",
        objectiveDetails: objective
      });
    }

    // Step 3: Get all students for the batch with isSlcTaken: false
    const students = await Student.find({
      batch: targetBatch,
      isSlcTaken: false
    }).lean();

    // Step 4: Group students by school
    const studentsBySchool = {};
    students.forEach(student => {
      const schoolId = student.schoolId;
      if (!studentsBySchool[schoolId]) {
        studentsBySchool[schoolId] = [];
      }
      studentsBySchool[schoolId].push(student);
    });

    // Step 5: Get all uploads for this objective
    const uploads = await StudentUpload.find({
      unqObjectIdOfStudentUploads: _id,
      batch: targetBatch,
      subject: objective.subject
    }).lean();

    // Step 6: Group uploads by school and student
    const uploadsBySchool = {};
    uploads.forEach(upload => {
      // Find which school this student belongs to
      const student = students.find(s => s._id.toString() === upload.unqStudentObjectId.toString());
      if (student) {
        const schoolId = student.schoolId;
        if (!uploadsBySchool[schoolId]) {
          uploadsBySchool[schoolId] = new Set();
        }
        uploadsBySchool[schoolId].add(upload.unqStudentObjectId.toString());
      }
    });

    // Step 7: Prepare school-wise dashboard data for ALL schools
    const schoolWiseData = [];
    let totalStudentsOverall = 0;
    let totalUploadsOverall = 0;
    let totalPendingOverall = 0;
    let totalSchoolsWithStudents = 0;

    for (const school of allSchools) {
      const schoolId = school.schoolId;
      const schoolStudents = studentsBySchool[schoolId] || [];
      const totalStudents = schoolStudents.length;
      
      // Only count schools that have students for the summary
      if (totalStudents > 0) {
        totalSchoolsWithStudents++;
      }
      
      const uploadedCount = uploadsBySchool[schoolId] ? uploadsBySchool[schoolId].size : 0;
      const pendingUploads = totalStudents - uploadedCount;
      const completionPercentage = totalStudents > 0 
        ? ((uploadedCount / totalStudents) * 100).toFixed(2)
        : "0.00";

      totalStudentsOverall += totalStudents;
      totalUploadsOverall += uploadedCount;
      totalPendingOverall += pendingUploads;

      schoolWiseData.push({
        schoolId: school.schoolId,
        schoolName: school.schoolName,
        districtId: school.districtId,
        districtName: school.districtName,
        blockId: school.blockId,
        blockName: school.blockName,
        totalStudents: totalStudents,
        uploadedCount: uploadedCount,
        pendingUploads: pendingUploads,
        completionPercentage: completionPercentage,
        hasStudents: totalStudents > 0,
        // Student details for drill-down (only if there are students)
        students: totalStudents > 0 ? schoolStudents.map(student => ({
          studentId: student._id,
          studentName: `${student.firstName} ${student.fatherName}`,
          rollNumber: student.rollNumber,
          studentSrn: student.studentSrn,
          hasUploaded: uploadsBySchool[schoolId]?.has(student._id.toString()) || false
        })) : []
      });
    }

    // Sort by school name
    schoolWiseData.sort((a, b) => a.schoolName.localeCompare(b.schoolName));

    // Step 8: Prepare summary statistics
    const summary = {
      totalSchools: allSchools.length,
      totalSchoolsWithStudents: totalSchoolsWithStudents,
      totalSchoolsWithoutStudents: allSchools.length - totalSchoolsWithStudents,
      totalStudents: totalStudentsOverall,
      totalUploads: totalUploadsOverall,
      totalPending: totalPendingOverall,
      overallCompletionPercentage: totalStudentsOverall > 0 
        ? ((totalUploadsOverall / totalStudentsOverall) * 100).toFixed(2)
        : "0.00",
      objectiveDetails: {
        id: objective._id,
        objective: objective.objective,
        subject: objective.subject,
        descriptionOfObject: objective.descriptionOfObject,
        dateOfObjective: objective.dateOfObjective,
        submissionDate: objective.submissionDate,
        batch: targetBatch
      }
    };

    // Step 9: Get top performing and bottom performing schools (only schools with students)
    const schoolsWithStudents = schoolWiseData.filter(school => school.hasStudents);
    const sortedByCompletion = [...schoolsWithStudents].sort((a, b) => 
      parseFloat(b.completionPercentage) - parseFloat(a.completionPercentage)
    );
    
    const topSchools = sortedByCompletion.slice(0, 5);
    const bottomSchools = [...sortedByCompletion].reverse().slice(0, 5);

    // Step 10: Group by district for additional insights
    const districtWiseData = {};
    schoolWiseData.forEach(school => {
      if (school.totalStudents > 0) {
        if (!districtWiseData[school.districtName]) {
          districtWiseData[school.districtName] = {
            districtName: school.districtName,
            totalSchools: 0,
            totalStudents: 0,
            totalUploads: 0,
            totalPending: 0,
            schools: []
          };
        }
        districtWiseData[school.districtName].totalSchools++;
        districtWiseData[school.districtName].totalStudents += school.totalStudents;
        districtWiseData[school.districtName].totalUploads += school.uploadedCount;
        districtWiseData[school.districtName].totalPending += school.pendingUploads;
        districtWiseData[school.districtName].schools.push(school.schoolName);
      }
    });

    // Calculate district completion percentages
    Object.values(districtWiseData).forEach(district => {
      district.completionPercentage = district.totalStudents > 0 
        ? ((district.totalUploads / district.totalStudents) * 100).toFixed(2)
        : "0.00";
    });

    return res.status(200).json({
      success: true,
      data: schoolWiseData,
      summary: summary,
      insights: {
        topPerformingSchools: topSchools,
        bottomPerformingSchools: bottomSchools,
        averageCompletionRate: summary.overallCompletionPercentage,
        districtWiseSummary: Object.values(districtWiseData)
      },
      filters: {
        objectiveId: _id,
        batch: targetBatch,
        isCenterClosed: false
      }
    });

  } catch (error) {
    console.error("Error in StudentUploadDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};