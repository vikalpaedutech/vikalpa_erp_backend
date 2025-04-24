import { Query, set } from "mongoose";
import { Expense } from "../models/bills.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import multer from "multer";
import { response } from "express";

import { uploadToDOStorage } from "../utils/digitalOceanSpaces.utils.js";

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// export const createPost = async (req, res) => {
//   console.log("Inside expense controller, createPost API");
//   console.log(req.file)

//   try {
//     const {
//       expenseId,
//       userId,
//       role,
//       purposeOfExpense,
//       descriptionExpense,
//       expenseDate,
//       expenseType,
//       travelFrom,
//       travelTo,
//       travelledDistance,
//       foodType,
//       accomodationDate,
//       stayedForDays,
//       otherItemName,
//       otherItemPurchasingPurpose,
//       otherItemDescription,
//       expenseAmount,
//     } = req.body;

//     console.log(req.body);

//     const file = req.file;

//     if (file) {
//       // Strip file extension from original name
//       const originalName = file.originalname;
//       const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
//       const fileName = `${Date.now()}-${nameWithoutExt}`;

//       // Upload to Cloudinary
//       const uploadResult = await uploadToCloudinary(file.buffer, fileName);

//       // Use Cloudinary's secure URL directly
//       const fileUrl = uploadResult.secure_url;

//       // Save expense data
//       const expense = await Expense.create({
//         expenseId,
//         userId,
//         role,
//         purposeOfExpense,
//         descriptionExpense,
//         expenseDate,
//         expenseType,
//         travelFrom,
//         travelTo,
//         travelledDistance,
//         foodType,
//         accomodationDate,
//         stayedForDays,
//         otherItemName,
//         otherItemPurchasingPurpose,
//         otherItemDescription,
//         expenseAmount,
//         fileName: uploadResult.public_id,
//         fileUrl,
//       });

//       res.status(201).json({ status: "Success", data: expense });
//     } else {
//       res.status(400).json({ status: "Error", message: "No file uploaded" });
//     }
//   } catch (error) {
//     console.log("Error creating expense:", error.message);
//     res.status(500).json({ status: "Error", message: error.message });
//   }
// };










// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');

// Create Expense with DigitalOcean upload
export const createPost = async (req, res) => {
  console.log("Inside expense controller, createPost API");

  try {
    const {
      expenseId, userId, role, purposeOfExpense, descriptionExpense,
      expenseDate, expenseType, travelFrom, travelTo, travelledDistance,
      foodType, accomodationDate, stayedForDays, otherItemName,
      otherItemPurchasingPurpose, otherItemDescription, expenseAmount,
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ status: "Error", message: "No file uploaded" });
    }

    const fileExt = file.originalname.split('.').pop(); // get extension like pdf, jpg
const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
const fileName = `${Date.now()}-${nameWithoutExt}.${fileExt}`;

    const fileUrl = await uploadToDOStorage(file.buffer, fileName, file.mimetype);

    const expense = await Expense.create({
      expenseId,
      userId,
      role,
      purposeOfExpense,
      descriptionExpense,
      expenseDate,
      expenseType,
      travelFrom,
      travelTo,
      travelledDistance,
      foodType,
      accomodationDate,
      stayedForDays,
      otherItemName,
      otherItemPurchasingPurpose,
      otherItemDescription,
      expenseAmount,
      fileName,
      fileUrl,
    });

    res.status(201).json({ status: "Success", data: expense });

  } catch (error) {
    console.error("Error creating expense:", error.message);
    res.status(500).json({ status: "Error", message: error.message });
  }
};
























//Upload File api.

// export const uploadFile = upload.single('file');

//___________________________________________________________________________________

//Api to get bills data on the basis of status of the bill. All Bills

export const getAllBills = async (req, res) => {

  try {

    const response = await Expense.find();
    res.status(200).json({status: 'Success', data: response});

    
  } catch (error) {
    console.log("Error Fetching data", error.message)
    res.status(500).json({status: "Failed", message: error})
  }

}
//______________________________________________________________________________________


//Api to get bills data on the basis of status of the bill. Bill status === Pending.

// export const getPendingBills = async (req, res) => {
  
 

//   try {

//     const response = await Expense.find({status:"Pending"});
//     res.status(200).json({status: 'Success', data: response});

    
//   } catch (error) {
//     console.log("Error Fetching data", error.message)
//     res.status(500).json({status: "Failed", message: error})
//   }

// }




export const getPendingBills = async (req, res) => {
  try {
    const response = await Expense.aggregate([
      {
        $match: { status: "Pending" }
      },
      {
        $lookup: {
          from: "users",            // 👈 collection name (should be plural lowercase)
          localField: "userId",     // 👈 field in Expense
          foreignField: "userId",   // 👈 field in Users
          as: "userDetails"         // 👈 result field
        }
      },
      {
        $unwind: "$userDetails"     // 👈 flatten the array (each userId expected to match exactly one user)
      }
    ]);

    res.status(200).json({ status: "Success", data: response });
  } catch (error) {
    console.error("Error Fetching data", error.message);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};
//______________________________________________________________________________________






//Api to get bills data on the basis of status of the bill. Bill status === Approved.

export const getVerifiedBills = async (req, res) => {

  try {

    const response = await Expense.find({status:"Verified"});
    res.status(200).json({status: 'Success', data: response});

    
  } catch (error) {
    console.log("Error Fetching data", error.message)
    res.status(500).json({status: "Failed", message: error})
  }

}
//______________________________________________________________________________________


















//Api to get bills data on the basis of status of the bill. Bill status === Approved.

export const getApprovedBills = async (req, res) => {

  try {

    const response = await Expense.find({status:"Approved"});
    res.status(200).json({status: 'Success', data: response});

    
  } catch (error) {
    console.log("Error Fetching data", error.message)
    res.status(500).json({status: "Failed", message: error})
  }

}
//______________________________________________________________________________________



//Api to get bills data on the basis of status of the bill. Bill status === Rejected.

export const getRejectedBills = async (req, res) => {

  try {

    const response = await Expense.find({status:"Rejected"});
    res.status(200).json({status: 'Success', data: response});

    
  } catch (error) {
    console.log("Error Fetching data", error.message)
    res.status(500).json({status: "Failed", message: error})
  }

}
//______________________________________________________________________________________


//Getting bills data by query params.

export const getBillsDataByQueryParams = async (req, res) => {

  const {purposeOfExpense, expenseType, expenseId, userId, status} = req.query;
console.log(req.query)
  try {
    const response = await Expense.find(req.query);
    res.status(200).json({status:"Success", data: response});
  } catch (error) {
    console.log(error.message)
    res.status(500).json({status:"Failed", message: error});
  }

}
//_____________________________________________________________________________


//Patch the bills data, if verifier and approver approves the bills, then this apis comes in handy.

export const patchBillsDataVerification = async (req, res) => {

  const {expenseId, _id} = req.query;
  const {status, verification} = req.body;
 
  
  console.log(req.query)
  console.log(req.body)


  try {
    const expense = await Expense.findOneAndUpdate(req.query, {
      status: status,
      verification: {
        verifiedBy: verification?.verifiedBy,
          verifiedAt: verification?.verifiedAt,
          comments: verification?.comments,
      },
      // approval: {
      //   approvedBy: approval?.approvedBy,
      //   approvedAt: approval?.approvedAt,
      //   comments: approval?.comments,
      // },
      
    },
    { new: true })

    res.status(200).json({status: "Success", data: expense});

    console.log("Update success", expense);


  } catch (error) {
    console.log(error.message);
    res.status(500).json({status:"Failed", message: error.message})
  }

}

//______________________________________________________________________



//Patch the bills data, if verifier and approver approves the bills, then this apis comes in handy.

export const patchBillsDataApproval = async (req, res) => {

  const {expenseId, _id} = req.query;
  const {status, approval} = req.body;
 
  
  console.log(req.query)
  console.log(req.body)


  try {
    const expense = await Expense.findOneAndUpdate(req.query, {
      status: status,
    
      approval: {
        approvedBy: approval?.approvedBy,
        approvedAt: approval?.approvedAt,
        comments: approval?.comments,
      },
      
    },
    { new: true })

    res.status(200).json({status: "Success", data: expense});

    console.log("Update success", expense);


  } catch (error) {
    console.log(error.message);
    res.status(500).json({status:"Failed", message: error.message})
  }

}

//______________________________________________________________________