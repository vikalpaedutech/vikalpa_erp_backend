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
// StudentUploadDashboard controller
export const StudentUploadDashboard = async (req, res) => {
  console.log("I am in StudentUpload.controller.js, api: StudentUploadDashboard");

  try {
    const {
      districtId,
      blockId,
      schoolId,
      batch,
      idofstudentuploadobjectives, // Optional now
    } = req.body;

    console.log("Dashboard Request Body:", req.body);

    // -----------------------------
    // Build base query for students
    // IMPORTANT: Only include students with isSlcTaken = false
    // -----------------------------
    let baseQuery = {
      isSlcTaken: false
    };

    if (districtId?.length > 0) {
      baseQuery.districtId = { $in: districtId };
    }

    if (blockId?.length > 0) {
      baseQuery.blockId = { $in: blockId };
    }

    if (schoolId?.length > 0) {
      baseQuery.schoolId = { $in: schoolId };
    }

    if (batch?.length > 0) {
      baseQuery.batch = { $in: batch };
    }

    console.log("Base Query (with isSlcTaken=false):", baseQuery);

    // -----------------------------
    // Scenario 1: Specific Objective Selected
    // -----------------------------
    if (idofstudentuploadobjectives) {
      // Validate objective id
      const objective = await StudentUploadObjective.findById(idofstudentuploadobjectives);

      if (!objective) {
        return res.status(404).json({
          success: false,
          message: "Student Upload Objective not found",
        });
      }

      // Get total students count for this objective across ALL batches in DB
      const objectiveSummaryQuery = { ...baseQuery };
      delete objectiveSummaryQuery.batch;
      
      const totalStudentsOverall = await Student.countDocuments(objectiveSummaryQuery);
      
      // Get total uploaded files count for this objective across ALL batches
      const allStudentsForObjective = await Student.find(objectiveSummaryQuery).select('_id');
      const allStudentIds = allStudentsForObjective.map(s => s._id);
      
      const totalUploadsOverall = await StudentUpload.countDocuments({
        unqStudentObjectId: { $in: allStudentIds },
        unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
      });
      
      // Get batch-wise breakdown for the objective
      const batchWiseBreakdown = await Student.aggregate([
        { $match: objectiveSummaryQuery },
        {
          $group: {
            _id: "$batch",
            totalStudents: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Add upload counts to each batch
      const batchWiseData = await Promise.all(
        batchWiseBreakdown.map(async (batchData) => {
          const studentsInBatch = await Student.find({ 
            ...objectiveSummaryQuery, 
            batch: batchData._id 
          }).select('_id');
          
          const studentIdsInBatch = studentsInBatch.map(s => s._id);
          
          const uploadsInBatch = await StudentUpload.countDocuments({
            unqStudentObjectId: { $in: studentIdsInBatch },
            unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
          });
          
          return {
            batch: batchData._id || "Unknown Batch",
            totalStudents: batchData.totalStudents,
            totalUploads: uploadsInBatch,
            pendingUploads: batchData.totalStudents - uploadsInBatch,
            completionPercentage: ((uploadsInBatch / batchData.totalStudents) * 100).toFixed(2)
          };
        })
      );

      // -----------------------------
      // ONLY fetch school-wise data if batch filter is provided
      // -----------------------------
      let schoolWiseData = [];
      
      if (batch?.length > 0) {
        console.log("Batch filter provided, fetching school-wise data for batch:", batch);
        
        // First, get all schools that are not closed (isCenterClosed: false)
        // Assuming you have a School collection or a field in Student collection
        // If you have a separate School collection, you can filter there
        // Otherwise, add isCenterClosed filter to baseQuery
        
        const schoolQuery = {
          ...baseQuery,
          // If isCenterClosed field exists in Student collection
          // 'isCenterClosed': false
        };
        
        // Get school-wise data with district and block info for the specific batch
        const schools = await Student.aggregate([
          { $match: schoolQuery },
          {
            $group: {
              _id: {
                schoolId: "$schoolId",
                schoolName: "$schoolName",
                districtId: "$districtId",
                districtName: "$districtName",
                blockId: "$blockId",
                blockName: "$blockName"
              },
              totalStudents: { $sum: 1 }
            }
          },
          {
            $project: {
              schoolId: "$_id.schoolId",
              schoolName: "$_id.schoolName",
              districtId: "$_id.districtId",
              districtName: "$_id.districtName",
              blockId: "$_id.blockId",
              blockName: "$_id.blockName",
              totalStudents: 1,
              _id: 0
            }
          },
          { $sort: { schoolName: 1 } }
        ]);
        
        schoolWiseData = await Promise.all(
          schools.map(async (school) => {
            const studentsInSchool = await Student.find({
              ...schoolQuery,
              schoolId: school.schoolId
            }).select('_id');
            
            const studentIdsInSchool = studentsInSchool.map(s => s._id);
            
            const uploadsInSchool = await StudentUpload.countDocuments({
              unqStudentObjectId: { $in: studentIdsInSchool },
              unqObjectIdOfStudentUploads: new mongoose.Types.ObjectId(idofstudentuploadobjectives),
            });
            
            const completionPercentage = school.totalStudents > 0 
              ? ((uploadsInSchool / school.totalStudents) * 100).toFixed(2)
              : "0.00";
            
            return {
              schoolId: school.schoolId,
              schoolName: school.schoolName || "Unknown School",
              districtId: school.districtId || "N/A",
              districtName: school.districtName || "N/A",
              blockId: school.blockId || "N/A",
              blockName: school.blockName || "N/A",
              totalStudents: school.totalStudents,
              totalUploads: uploadsInSchool,
              pendingUploads: school.totalStudents - uploadsInSchool,
              completionPercentage: completionPercentage
            };
          })
        );
      } else {
        console.log("No batch filter provided, skipping school-wise data");
      }

      // Return response for specific objective
      const responseData = {
        success: true,
        mode: "specific_objective",
        message: "Dashboard data fetched successfully for specific objective",
        data: {
          objective: {
            id: objective._id,
            objective: objective.objective,
            subject: objective.subject,
            submissionDate: objective.submissionDate,
            batch: objective.batch
          },
          objectiveWiseSummary: {
            totalStudentsOverall: totalStudentsOverall,
            totalUploadsOverall: totalUploadsOverall,
            pendingUploadsOverall: totalStudentsOverall - totalUploadsOverall,
            overallCompletionPercentage: totalStudentsOverall > 0 
              ? ((totalUploadsOverall / totalStudentsOverall) * 100).toFixed(2) 
              : "0.00",
            batchWiseBreakdown: batchWiseData
          }
        }
      };

      // Only add schoolWiseSummary if batch filter was provided
      if (batch?.length > 0) {
        responseData.data.schoolWiseSummary = schoolWiseData;
      }

      return res.status(200).json(responseData);
    }

    // -----------------------------
    // Scenario 2: No Objective Selected - Master Dashboard
    // -----------------------------
    
    // Get all objectives
    const allObjectives = await StudentUploadObjective.find({});
    
    if (allObjectives.length === 0) {
      return res.status(200).json({
        success: true,
        mode: "master_dashboard",
        message: "No objectives found",
        data: {
          totalObjectives: 0,
          objectivesSummary: []
        }
      });
    }

    // Get all students matching the base query (with batch filters and isSlcTaken=false)
    const allStudents = await Student.find(baseQuery).select('_id');
    const allStudentIds = allStudents.map(s => s._id);

    // Calculate summary for each objective
    const objectivesSummary = await Promise.all(
      allObjectives.map(async (objective) => {
        // Count total uploads for this objective
        const totalUploads = await StudentUpload.countDocuments({
          unqStudentObjectId: { $in: allStudentIds },
          unqObjectIdOfStudentUploads: objective._id,
        });

        // Get batch-wise breakdown for this objective
        const batchWiseForObjective = await Student.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: "$batch",
              totalStudents: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        const batchWiseData = await Promise.all(
          batchWiseForObjective.map(async (batchData) => {
            const studentsInBatch = await Student.find({ 
              ...baseQuery, 
              batch: batchData._id 
            }).select('_id');
            
            const studentIdsInBatch = studentsInBatch.map(s => s._id);
            
            const uploadsInBatch = await StudentUpload.countDocuments({
              unqStudentObjectId: { $in: studentIdsInBatch },
              unqObjectIdOfStudentUploads: objective._id,
            });
            
            const completionPercentage = batchData.totalStudents > 0 
              ? ((uploadsInBatch / batchData.totalStudents) * 100).toFixed(2)
              : "0.00";
            
            return {
              batch: batchData._id || "Unknown Batch",
              totalStudents: batchData.totalStudents,
              totalUploads: uploadsInBatch,
              pendingUploads: batchData.totalStudents - uploadsInBatch,
              completionPercentage: completionPercentage
            };
          })
        );

        const completionPercentage = allStudents.length > 0 
          ? ((totalUploads / allStudents.length) * 100).toFixed(2)
          : "0.00";

        return {
          objectiveId: objective._id,
          objectiveName: objective.objective,
          subject: objective.subject,
          submissionDate: objective.submissionDate,
          totalStudents: allStudents.length,
          totalUploads: totalUploads,
          pendingUploads: allStudents.length - totalUploads,
          completionPercentage: completionPercentage,
          batchWiseBreakdown: batchWiseData
        };
      })
    );

    // Calculate total across all objectives
    const totalStudentsAllObjectives = allStudents.length;
    const totalUploadsAllObjectives = objectivesSummary.reduce((sum, obj) => sum + obj.totalUploads, 0);
    
    const overallCompletionPercentage = totalStudentsAllObjectives > 0 
      ? ((totalUploadsAllObjectives / (totalStudentsAllObjectives * allObjectives.length)) * 100).toFixed(2)
      : "0.00";
    
    // Return response for master dashboard
    return res.status(200).json({
      success: true,
      mode: "master_dashboard",
      message: "Master dashboard data fetched successfully",
      data: {
        filters: {
          districtId: districtId || [],
          blockId: blockId || [],
          schoolId: schoolId || [],
          batch: batch || []
        },
        overallSummary: {
          totalObjectives: allObjectives.length,
          totalStudents: totalStudentsAllObjectives,
          totalUploads: totalUploadsAllObjectives,
          pendingUploads: (totalStudentsAllObjectives * allObjectives.length) - totalUploadsAllObjectives,
          overallCompletionPercentage: overallCompletionPercentage
        },
        objectivesSummary: objectivesSummary
      }
    });

  } catch (error) {
    console.error("Error fetching Student Upload Dashboard:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};