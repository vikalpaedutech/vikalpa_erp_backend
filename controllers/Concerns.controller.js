// /BACKEND/controllers/Concerns.controller.js

import { Concern } from "../models/Concerns.model.js";
import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { Query, set } from "mongoose";
import { Expense } from "../models/bills.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import multer from "multer";
import { response } from "express";
import { createNotificationForConcern } from "../utils/notificatino.utils.js";
import { uploadToDOStorage } from "../utils/digitalOceanSpacesConcernsDocs.utils.js";

// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single("file");

//Post API

export const createConcern = async (req, res) => {
  console.log("I am inside createConcern controller");

  try {
    const {
      concernId,
      userId,
      concernType,
      districtId,
      blockId,
      schoolId,
      concern,
      classOfConcern,
      remark,
      concernStatusBySubmitter,
      dateOfSubmission,
      concernStatusByResolver,
      dateOfResolution,
      totalDaysOfLeaveAppliedFor,
      leavePeriodFrom,
      leavePeriodTo,
      leaveApprovalHR,
      subjectOfLeave,
      leaveBody,
      comment,
      studentSrn,
      uri1, 
      uri2,
      uri3,
      conditionalRole,
      role,
      actionRecommended
    } = req.body;

    console.log(concernId);
    console.log(userId)
  
    console.log(req.body)

    // ✅ Check if concernId already exists

    const existingConcern = await Concern.findOne({
      concernId,
      classOfConcern,
    });
    if (existingConcern) {
      return res
        .status(409)
        .json({
          status: "Duplicate",
          message: "Concern with this concernId already exists.",
        });
    }

    // const isStudentExist = await Student.findOne({ studentSrn });
    // if (req.body.studentSrn) {
    //   if (!isStudentExist) {
    //     console.log("student not matched");
    //     return res
    //       .status(409)
    //       .json({
    //         status: "Student not found",
    //         message: "Student Srn not found.",
    //       });
    //   }
    // }

    let fileName = null;
    let fileUrl = null;

    const file = req.file;
    if (file) {
      const fileExt = file.originalname.split(".").pop();
      const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
      fileName = `${Date.now()}-${nameWithoutExt}.${fileExt}`;
      fileUrl = await uploadToDOStorage(file.buffer, fileName, file.mimetype);
    }

    const concerns = await Concern.create({
      concernId,
      userId,
      concernType,
      districtId,
      blockId,
      schoolId,
      concern,
      classOfConcern,
      remark,
      concernStatusBySubmitter,
      dateOfSubmission,
      concernStatusByResolver,
      dateOfResolution,
      totalDaysOfLeaveAppliedFor,
      leavePeriodFrom,
      leavePeriodTo,
      leaveApprovalHR,
      subjectOfLeave,
      leaveBody,
      comment,
      fileName,
      fileUrl,
      studentSrn,
      actionRecommended
    });

    const raisedByUserId = userId;
    console.log("I am raised by user id:", raisedByUserId)

    //Creating notification
    await createNotificationForConcern({
      concernType,
      concernId,
      role,
      raisedByUserId,
      isNotified: true,
      isSomeOneReverted: false,
      notificationDate: new Date(),
      uri1, 
      uri2,
      uri3,
      conditionalRole
    });

    res.status(201).json({ status: "Success", data: concerns });
  } catch (error) {
    console.error("Error creating school concern:", error.message);
    res.status(500).json({ status: "Error", message: error.message });
  }
};

//Get API. Get Concerns by userId.

export const getConcernsByQueryParameters = async (req, res) => {
  try {
    // Extract only fields that belong to Concerns collection
    const {
      concernId,
      userId,
      districtId,
      blockId,
      schoolId,
      concernType,
      concernStatusBySubmitter,
      concernStatusByResolver,
      classOfConcern,
    } = req.query;

    // console.log('I am inside getConcernByQueryParameters');
    // console.log(req.query);

    const districtIds = Array.isArray(districtId)
      ? districtId
      : districtId?.split(",") || [];
    const blockIds = Array.isArray(blockId)
      ? blockId
      : blockId?.split(",") || [];
    const schoolIds = Array.isArray(schoolId)
      ? schoolId
      : schoolId?.split(",") || [];
    const calssOfConcerns = Array.isArray(classOfConcern)
      ? classOfConcern
      : classOfConcern?.split(",") || [];
    const concernTypes = Array.isArray(concernType)
      ? concernType
      : concernType?.split(",") || [];
    const concernStatusByResolvers = Array.isArray(concernStatusByResolver)
      ? concernStatusByResolver
      : concernStatusByResolver?.split(",") || [];

    // Build match stage dynamically based on available query params
    const matchStage = {};
    if (concernId) matchStage.concernId = concernId;
    if (userId) matchStage.userId = userId;
    if (districtId) matchStage.districtId = { $in: districtIds };
    if (blockId) matchStage.blockId = { $in: blockIds };
    if (schoolId) matchStage.schoolId = { $in: schoolIds };
    if (concernType) matchStage.concernType = { $in: concernTypes };
    if (concernStatusBySubmitter)
      matchStage.concernStatusBySubmitter = concernStatusBySubmitter;
    if (concernStatusByResolver)
      matchStage.concernStatusByResolver = { $in: concernStatusByResolvers };
    if (classOfConcern) matchStage.classOfConcern = { $in: calssOfConcerns };

    console.log(matchStage);
    // console.log(req.query)
    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId", // Make sure this field exists in both collections
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
    ];

    // const response = await Concern.aggregate(pipeline);
    const response = await Concern.aggregate(pipeline);
    res.status(200).json({ status: "Success", data: response });
  } catch (error) {
    console.log("Error occurred while fetching data:", error.message);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

//--------------------------------------------------------------

//Get School and Tech COncerns  for ACI/Community/Incharge API. Dynamically fetches individual concers

// export const getConcernsPipeLineMethod = async (req, res) => {
//   console.log("I am insied get concerns by pipeline method");
//   try {
//     const {
//       userId,
//       concernType,
//       conditionalRole,
//       role,
//       conditionalDepartment,
//     } = req.query;

//     console.log(req.query);

//     if (!userId) {
//       return res.status(400).json({
//         status: "Failed",
//         message: "Missing userId (ACI)",
//       });
//     }

//     // Step 1: Find the ACI user and get their assigned districts
//     const aciUser = await User.findOne({ userId: userId, role: role });

//     if (!aciUser) {
//       return res.status(404).json({
//         status: "Failed",
//         message: "ACI user not found",
//       });
//     }

//     const { assignedDistricts = [] } = aciUser;

//     // Step 2: Aggregate bills only from CCs under those districts
//     const concerns = await Concern.aggregate([
//       {
//         $match: {
//           concernType: concernType,
//         },
//       },
//       {
//         $lookup: {
//           from: "users", // 👈 collection name (must be lowercase plural)
//           localField: "userId",
//           foreignField: "userId",
//           as: "userDetails",
//         },
//       },
//       {
//         $unwind: "$userDetails",
//       },

//       {
//         $match: {
//           "userDetails.role": {
//             $in: conditionalRole.split(",").map((role) => role.trim()),
//           },
//           "userDetails.department": {
//             $in: conditionalDepartment.split(",").map((role) => role.trim()),
//           },
//           "userDetails.assignedDistricts": {
//             $elemMatch: { $in: assignedDistricts },
//           },
//         },
//       },

//       //Joining distrcits
//       {
//           $lookup:{
//             from: "districts",
//             localField: "districtId",
//             foreignField:"districtId",
//             as: "districtDetails"
//           },
//       },
//       {$unwind: {path:"$districtDetails", preserveNullAndEmptyArrays:true}},

//       //joining blocks

//       {

//         $lookup:{
//           from:"blocks",
//           localField:"blockId",
//           foreignField:"blockId",
//           as:"blockDetails"
//         }
//       },
//       {$unwind:{path:"$blockDetails", preserveNullAndEmptyArrays:true}},

//       //joining schools

//       {
//         $lookup:{
//           from:"schools",
//           localField:"schoolId",
//           foreignField:"schoolId",
//           as:"schoolDetails"
//         }
//       },
//       {$unwind:{path:"$schoolDetails", preserveNullAndEmptyArrays:true}}

//     ]);

//     res.status(200).json({ status: "Success", data: concerns });
//     console.log(concerns);
//   } catch (error) {
//     console.error("Error fetching filtered bills for ACI:", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message,
//     });
//   }
// };












export const getConcernsPipeLineMethod = async (req, res) => {
  console.log("I am insied get concerns by pipeline method");
  try {
    const {
      userId,
      concernType,
      conditionalRole,
      role,
      conditionalDepartment,
      districtId,  
      blockId,     
      schoolId,
      classOfConcern    
    } = req.query;

    console.log(req.query);

    if (!userId) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing userId (ACI)",
      });
    }

    // Step 1: Find the ACI user and get their assigned districts
    const aciUser = await User.findOne({ userId: userId, role: role });

    if (!aciUser) {
      return res.status(404).json({
        status: "Failed",
        message: "ACI user not found",
      });
    }

    const { assignedDistricts = [] } = aciUser;

    // Step 2: Aggregate concerns only from CCs under those districts
    const concerns = await Concern.aggregate([
      {
        $match: {
          concernType: concernType,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },

      {
        $match: {
          "userDetails.role": {
            $in: conditionalRole.split(",").map((role) => role.trim()),
          },
          "userDetails.department": {
            $in: conditionalDepartment.split(",").map((dep) => dep.trim()),
          },
          "userDetails.assignedDistricts": {
            $elemMatch: { $in: assignedDistricts },
          },
          // "userDetails.classOfConcern": {
          //   $elemMatch: { $in: classOfConcern },
          // },
          ...(districtId && { districtId: districtId }),     
          ...(blockId && { blockId: blockId }),               
          ...(schoolId && { schoolId: schoolId }),   
          ...(classOfConcern && { classOfConcern: classOfConcern }),          
        },
      },

      // Join districts
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "districtId",
          as: "districtDetails"
        },
      },
      {
        $unwind: {
          path: "$districtDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // Join blocks
      {
        $lookup: {
          from: "blocks",
          localField: "blockId",
          foreignField: "blockId",
          as: "blockDetails"
        }
      },
      {
        $unwind: {
          path: "$blockDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // Join schools
      {
        $lookup: {
          from: "schools",
          localField: "schoolId",
          foreignField: "schoolId",
          as: "schoolDetails"
        }
      },
      {
        $unwind: {
          path: "$schoolDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    res.status(200).json({ status: "Success", data: concerns });
    // console.log(concerns);
  } catch (error) {
    console.error("Error fetching filtered concerns for ACI:", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};


//---------------------------------------------------------------------

//Get Individual Concerns API. Dynamically fetches individual concers

// export const getIndividualConcerns = async (req, res) => {
//   try {
//     const { userId, concernType } = req.query;

//     console.log(req.query);

//     if (!userId) {
//       return res.status(400).json({
//         status: "Failed",
//         message: "Missing userId (ACI)",
//       });
//     }

//     // Step 1: Find the ACI user and get their assigned districts
//     const aciUser = await User.findOne({ userId: userId, role: "ACI" });

//     if (!aciUser) {
//       return res.status(404).json({
//         status: "Failed",
//         message: "ACI user not found",
//       });
//     }

//     const { assignedDistricts = [] } = aciUser;

//     // Step 2: Aggregate bills only from CCs under those districts
//     const concerns = await Concern.aggregate([
//       {
//         $match: {
//           concernType: concernType,
//         },
//       },
//       {
//         $lookup: {
//           from: "users", // 👈 collection name (must be lowercase plural)
//           localField: "userId",
//           foreignField: "userId",
//           as: "userDetails",
//         },
//       },
//       {
//         $unwind: "$userDetails",
//       },
//       {
//         $match: {
//           "userDetails.role": "CC",
//           "userDetails.assignedDistricts": {
//             $elemMatch: { $in: assignedDistricts },
//           },
//         },
//       },
//     ]);

//     res.status(200).json({ status: "Success", data: concerns });
//   } catch (error) {
//     console.error("Error fetching filtered bills for ACI:", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message,
//     });
//   }
// };




















export const getIndividualConcerns = async (req, res) => {
  console.log("I am inside get individual CONCERN");

  try {
    const {
      userId,
      concernType,
      conditionalRole,
      role,
      conditionalDepartment,
    } = req.query;

    console.log(req.query);

    console.log(conditionalRole.split(","));

    if (!userId) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing userId (ACI)",
      });
    }

    // Step 1: Find the ACI user and get their assigned districts
    const aciUser = await User.findOne({ userId: userId, role: role });

    if (!aciUser) {
      return res.status(404).json({
        status: "Failed",
        message: "ACI user not found",
      });
    }

    const { assignedDistricts = [] } = aciUser;

    // Step 2: Aggregate bills only from CCs under those districts
    const concerns = await Concern.aggregate([
      {
        $match: {
          concernType: concernType,
        },
      },
      {
        $lookup: {
          from: "users", // 👈 collection name (must be lowercase plural)
          localField: "userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.role": {
            $in: conditionalRole.split(",").map((role) => role.trim()),
          },
          "userDetails.department": {
            $in: conditionalDepartment.split(",").map((role) => role.trim()),
          },
          "userDetails.assignedDistricts": {
            $elemMatch: { $in: assignedDistricts },
          },
        },
      },
    ]);

    res.status(200).json({ status: "Success", data: concerns });
  } catch (error) {
    console.error("Error fetching filtered bills for ACI:", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};


//---------------------------------------------------------------------

//Get Individual Concerns API. Dynamically fetches individual concers
//Updated on 26-06-2025

export const getIndividualLeave = async (req, res) => {
  console.log("I am inside get individual leave");

  try {
    const {
      userId,
      concernType,
      conditionalRole,
      role,
      conditionalDepartment,
    } = req.query;

    console.log(req.query);

    console.log(conditionalRole.split(","));

    if (!userId) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing userId (ACI)",
      });
    }

    // Step 1: Find the ACI user and get their assigned districts
    const aciUser = await User.findOne({ userId: userId, role: role });

    if (!aciUser) {
      return res.status(404).json({
        status: "Failed",
        message: "ACI user not found",
      });
    }

    const { assignedDistricts = [] } = aciUser;

    // Step 2: Aggregate bills only from CCs under those districts
    const concerns = await Concern.aggregate([
      {
        $match: {
          concernType: concernType,
        },
      },
      {
        $lookup: {
          from: "users", // 👈 collection name (must be lowercase plural)
          localField: "userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.role": {
            $in: conditionalRole.split(",").map((role) => role.trim()),
          },
          "userDetails.department": {
            $in: conditionalDepartment.split(",").map((role) => role.trim()),
          },
          "userDetails.assignedDistricts": {
            $elemMatch: { $in: assignedDistricts },
          },
        },
      },
    ]);

    res.status(200).json({ status: "Success", data: concerns });
  } catch (error) {
    console.error("Error fetching filtered bills for ACI:", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

//---------------------------------------------------------------------

//Patch Api. Patching status of concerns.

export const PatchConcernsByQueryParams = async (req, res) => {
  const { userId, concernId, _id } = req.query;

  
  console.log('Hey there!')
  console.log(req.query)

  const {
    concernStatusBySubmitter,

    concernStatusByResolver,

    leaveApprovalHR,

    l1ApprovalOnLeave,

    techVisitorRemark,
    actionRecommended,
    activityOfPersonWhoResolvesTechConcerns,
    comment,
    commentByResolver
  } = req.body;

  console.log(req.query);

  console.log(req.body);

  try {
    const response = await Concern.findOneAndUpdate(req.query, req.body);

    res.status(200).json({ status: "Ok", data: response });
    // console.log(response)
  } catch (error) {
    console.log("Error patching concern", error);
  }
};
