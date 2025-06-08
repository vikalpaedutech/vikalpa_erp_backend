// /BACKEND/controllers/Concerns.controller.js

import { Concern } from "../models/Concerns.model.js";


import { Query, set } from "mongoose";
import { Expense } from "../models/bills.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import multer from "multer";
import { response } from "express";

import { uploadToDOStorage } from "../utils/digitalOceanSpacesConcernsDocs.utils.js";

// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');


//Post API 

export const createConcern = async (req, res) => {
console.log('I am inside createConcern controller')

    try {
            const {
                concernId, userId, concernType, concern, classOfConcern, remark, concernStatusBySubmitter, dateOfSubmission, 
                concernStatusByResolver, dateOfResolution, totalDaysOfLeaveAppliedFor, leavePeriodFrom,
                leavePeriodTo, leaveApprovalHR, subjectOfLeave, leaveBody, comment
            } = req.body;

            const file = req.file
            if(!file){
                return res.status(400).json({status:"Error", message: "No file uploaded"})
            }

             const fileExt = file.originalname.split('.').pop(); // get extension like pdf, jpg
            const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
            const fileName = `${Date.now()}-${nameWithoutExt}.${fileExt}`;    
            const fileUrl = await uploadToDOStorage(file.buffer, fileName, file.mimetype);

            const concerns = await Concern.create(
                {
                    concernId, userId, concernType, concern, classOfConcern, remark, concernStatusBySubmitter, dateOfSubmission, 
                concernStatusByResolver, dateOfResolution, totalDaysOfLeaveAppliedFor, leavePeriodFrom,
                leavePeriodTo, leaveApprovalHR, subjectOfLeave, leaveBody, comment, fileName, fileUrl 
                }
                

            )

            res.status(201).json({ status: "Success", data: concerns });
    } catch (error) {
            console.error("Error creating expense:", error.message);
            res.status(500).json({ status: "Error", message: error.message });
    }

}

//Get API. Get Concerns by userId.

export const getConcernsByQueryParameters = async (req, res) => {
  try {
    // Extract only fields that belong to Concerns collection
    const {
      concernId,
      userId,
      concernType,
      concernStatusBySubmitter,
      concernStatusByResolver
    } = req.query;

    // Build match stage dynamically based on available query params
    const matchStage = {};
    if (concernId) matchStage.concernId = concernId;
    if (userId) matchStage.userId = userId;
    if (concernType) matchStage.concernType = concernType;
    if (concernStatusBySubmitter) matchStage.concernStatusBySubmitter = concernStatusBySubmitter;
    if (concernStatusByResolver) matchStage.concernStatusByResolver = concernStatusByResolver;

    const pipeline = [
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId", // Make sure this field exists in both collections
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      }
    ];

    const response = await Concern.aggregate(pipeline);
    res.status(200).json({ status: "Success", data: response });
  } catch (error) {
    console.log("Error occurred while fetching data:", error.message);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

//--------------------------------------------------------------
