import { Query, set } from "mongoose";
import { Expense } from "../models/bills.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import multer from "multer";
import { response } from "express";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

import { uploadToDOStorage } from "../utils/digitalOceanSpaces.utils.js";

import { District_Block_School } from "../models/district_block_buniyaadCenters.model.js";







// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');

// Create Expense with DigitalOcean upload
export const createPost = async (req, res) => {
  console.log("Inside expense controller, createPost API");

  try {
    const {
      unqUserObjectId, userId, role, purposeOfExpense, descriptionExpense,
      expenseDate, expenseType, travelFrom, travelTo, travelledDistance,
      foodType, accomodationDate, stayedForDays, otherItemName,
      otherItemPurchasingPurpose, otherItemDescription, expenseAmount, 
      verification, approval
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
      unqUserObjectId,
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



//Get Pending Bills. ACI>> CC
export const getPendingAndVerifiedBillsByAci = async (req, res) => {

  console.log('Hi there')

  try {
    const { userId, status, role, conditionalRole } = req.query;

    
    console.log(req.query)
    
    let conditionalRoleArray = req.query.conditionalRole.split(',');
    let statusArray = req.query.status.split(',');
    
    console.log(conditionalRoleArray); // ['CC', 'ACI']
    console.log(statusArray)

  

    if (!userId) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing userId (ACI)",
      });
    }

    // Step 1: Find the ACI user and get their assigned districts
    const aciUser = await User.findOne({ userId: userId, role: role });

    console.log(aciUser)


    if (!aciUser) {
      return res.status(404).json({
        status: "Failed",
        message: "ACI user not found",
      });
    }

    const { assignedDistricts = [] } = aciUser;

    // Step 2: Aggregate bills only from CCs under those districts
    const bills = await Expense.aggregate([
      {
        $match: {
          status: { $in: statusArray },
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
          "userDetails.role": { $in: conditionalRoleArray }, //"CC"
          "userDetails.assignedDistricts": { $elemMatch: { $in: assignedDistricts } },
        },
      },
    ]);


    console.log(bills)
    res.status(200).json({ status: "Success", data: bills });
  } catch (error) {
    console.error("Error fetching filtered bills for ACI:", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};



export const getAllTypesOfBillsStatusForApprovalAndRejection = async (req, res) =>{

console.log("Hello all types of bills")

const {conditionalRoleForWhoseBillsAreToBeFetched, status, _id} = req.body;

console.log(req.body)

// const status = "Pending"   //This status is for Bill status like Pending, Approved

// const conditionalRoleForWhoseBillsAreToBeFetched = 'CC' //Whose bills to be fetched

// const _id = '68ba9c13e0e79e7d9568470c' // this is the id of that person who is approving bills

try {

//This pipelines fetches the data of verifier user who verifies others' bills
  
const pipeline1 = [];

  pipeline1.push({
    $match:{
        _id: new mongoose.Types.ObjectId(_id)
    }
  })

  pipeline1.push({
    $lookup:{
      from:'useraccesses',
      localField:'_id',
      foreignField:'unqObjectId',
      as: 'verifier_details'
    }
  })


  const pipeline1Result = await User.aggregate(pipeline1)

  
 

// res.status(200).json({satus:'Success', data:pipeline1Result})
// console.log(pipeline1Result.verifier_details)
//-----------------------------------------------------------------

 //Piplene 2. Fetches CC detalls
 //Below pipline fetches the data of those conditionalRoleForWhoseBillsAreToBeFetched ...
 //...whose schoolIs matches with the verifier. This way...
 //...i can get the hold of desired ids... then collecting those ids...
 //...in an array i can query in expenses directly

const schoolIds = [];
  // pipeline1Result[0].verifier_details[0].region.map((eachDistrict, index)=>{
  //   eachDistrict.blockIds.map((eachBlocks, index)=>{
  //     eachBlocks.schoolIds.map((eachSchools, index)=>{
  //       schoolIds.push(eachSchools.schoolId)
  //     })
  //   })
  // })


  if (
  pipeline1Result.length > 0 &&
  pipeline1Result[0].verifier_details &&
  pipeline1Result[0].verifier_details.length > 0
) {
  pipeline1Result[0].verifier_details[0].region.forEach((eachDistrict) => {
    eachDistrict.blockIds.forEach((eachBlock) => {
      eachBlock.schoolIds.forEach((eachSchool) => {
        schoolIds.push(eachSchool.schoolId);
      });
    });
  });
} else {
  console.log("No verifier details found for given _id");
  return res.status(404).json({ message: "Verifier details not found" });
}





  // console.log('hello schoolIds')
  // console.log(pipeline1Result[0].verifier_details[0].region)
  // console.log(schoolIds)

const schoolIdsToMatch = schoolIds //["143", "356"];
 const pipeline2 =[];

 pipeline2.push({
  $match:{
    role: { $in: conditionalRoleForWhoseBillsAreToBeFetched }
  }
 })

//  pipeline2.push({
//   $lookup:{
//     from:'useraccesses',
//     localField:'_id',
//     foreignField:'unqObjectId',
//     as:'person_whose_bills_are_to_be_verified'
//   }
//  })

pipeline2.push({
  $lookup:{
    from:"useraccesses",
    let: {localId: "$_id"},
    pipeline: [
      {
        $match:{
          $expr:{$eq:["$unqObjectId", "$$localId"]}
        }
      },
      {
        $match:{
          "region.blockIds.schoolIds.schoolId":{$in: schoolIdsToMatch}
        }
      }
    ],
    as: "person_whose_bills_are_to_be_verified"
  }
})

// ✅ This removes users where lookup result is empty

pipeline2.push({
  $match: {
    person_whose_bills_are_to_be_verified: { $ne: [] }
  }
});


const pipeline2Result = await User.aggregate(pipeline2);

//This below holds all the user id whose bills to be verified

const arrayOfIds = []

pipeline2Result.map((eachId, index)=>{
  return arrayOfIds.push(eachId._id)
})

//Now the final pipeline which will return the bills data.
//We will use all the arrayOfIds to fetch the data and...
//...we will joni expenses collectin with users

console.log(arrayOfIds)

const pipeline3 = [];

pipeline3.push({
  $match:{
    _id: {$in: arrayOfIds},

  }
})

pipeline3.push({
  $lookup:{
    from: "useraccesses",
    localField:"_id",
    foreignField:"unqObjectId",
    as:"user_access"
  }
})

pipeline3.push({
  $lookup:{
    from:"expenses",
    let: {uid: "$_id"},
    pipeline: [
     { $match:{$expr:{$eq: ["$unqUserObjectId", "$$uid"]} }},
     {$match: {status: {$in: status}}}
    ],
   
    as: "expenses"
  }  
},
// ✅ filter out users with no pending expenses
  {
    $match: { expenses: { $ne: [] } }
  })

const pipeline3Result = await User.aggregate(pipeline3);

 res.status(200).json({status:'Success',  data:pipeline3Result});

//  console.log(pipeline3Result)

} catch (error) {
  console.error("Aggregation error:", error);
  res.status(500).json({ status: "Error", message: error.message });
}

}

//______________________________________________________________________________________


//Update Bills Status. 
export const updateBillVerificationAndApprovalStatus = async (req, res)=>{

console.log("Hello bills verification")

const {checkingStatus, billObjectId, status,  approvedOrVerifiedBy, 

  verification, approval
} = req.body;

console.log(req.body)
// const checkingStatus = 'Approval'
// const _id = "68ba9c65e0e79e7d95684713"
// const status = "Verified"
// const approvedOrVerifiedBy = "68ba9c13e0e79e7d9568470c"

// const verification = {
//   verifiedBy:approvedOrVerifiedBy,
//   verifiedAt:new Date(),
//   comments: "Okay"
// }


// const approval = {
//   approvedBy: approvedOrVerifiedBy,
//   approvedAt: new Date (),
//   comments: 'Okay'
// }

console.log(checkingStatus)
try {

  let findUserBill;
  if (checkingStatus === "Verification"){
       findUserBill = await Expense.findOneAndUpdate({_id:billObjectId},
{ $set: { verification, status } }, {new: true}
  )
  } else if (checkingStatus === "Approval") {

      findUserBill = await Expense.findOneAndUpdate({_id:billObjectId},
{$set: {approval, status}},  {new:true}
  )
  }



  res.status(200).json({status:"Success", data: findUserBill})

  
} catch (error) {

  console.log("Error finding bills", error)
  
}


}



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





//Delete bills by objectId

export const deleteBill = async (req, res) => {
  const { _id } = req.body;
  
  console.log('hello delete bill')
  console.log(req.body)

  try {
    const deletedBill = await Expense.findByIdAndDelete(_id);

    if (!deletedBill) {
      return res.status(404).json({ status: 'Failed', message: 'Bill not found!' });
    }

    res.status(200).json({ status: 'Success', message: 'Bill deleted successfully!' });
  } catch (error) {
    console.error('Error occurred while deleting bill:', error);
    res.status(500).json({ status: 'Failed', message: 'An error occurred while deleting bill' });
  }
};

//-----------------------------------------------------------------------------------------------------------

























// export const getAllBillsWithUserDetails = async (req, res) => {
//   console.log("Hello bills data by user details");

//   try {
//     const bills = await Expense.aggregate([
//       // Join with Users
//       {
//         $lookup: {
//           from: "users", // collection name in MongoDB
//           localField: "userId",
//           foreignField: "userId",
//           as: "userDetails",
//         },
//       },
//       { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

//       // Lookup district details
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: {
//             districtIds: {
//               $ifNull: ["$userDetails.assignedDistricts", []],
//             },
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ["$districtId", "$$districtIds"] },
//               },
//             },
//             { $project: { _id: 0, districtId: 1, districtName: 1 } },
//           ],
//           as: "districtDetails",
//         },
//       },

//       // Lookup school details
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: {
//             schoolIds: {
//               $ifNull: ["$userDetails.assignedSchools", []],
//             },
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ["$centerId", "$$schoolIds"] },
//               },
//             },
//             { $project: { _id: 0, centerId: 1, centerName: 1 } },
//           ],
//           as: "schoolDetails",
//         },
//       },

//       // Final projection
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           role: 1,
//           purposeOfExpense: 1,
//           expenseDate: 1,
//           expenseType: 1,
//           otherItemName: 1,
//           otherItemPurchasingPurpose: 1,
//           expenseAmount: 1,
//           fileName: 1,
//           fileUrl: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,

//           // Selected user fields
//           "userDetails.name": 1,
//           "userDetails.email": 1,
//           "userDetails.contact1": 1,
//           "userDetails.contact2": 1,
//           "userDetails.department": 1,
//           "userDetails.role": 1,

//           // Enriched data
//           districtDetails: 1,
//           schoolDetails: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       status: "Success",
//       data: bills,
//     });
//   } catch (error) {
//     console.error("Error fetching bills with user details:", error);
//     res.status(500).json({
//       status: "Failed",
//       message: "An error occurred while fetching bills",
//     });
//   }
// };
















// export const getAllBillsWithUserDetails = async (req, res) => {
//   try {
//     console.log("Fetching bills data with user details...");

//     let { startDate, endDate, status } = req.query;

//     // ✅ Default: current month’s start & end
//     const now = new Date();
//     const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

//     // ✅ If no date range passed, fallback to default current month
//     const start = startDate ? new Date(startDate) : firstDayOfMonth;
//     const end = endDate ? new Date(endDate) : lastDayOfMonth;

//     // ✅ Build filter
//     let matchStage = {
//       createdAt: { $gte: start, $lte: end },
//     };

//     if (status) {
//       matchStage.status = status;
//     }

//     // ✅ Aggregation pipeline
//     const expenses = await Expense.aggregate([
//       { $match: matchStage },

//       {
//         $lookup: {
//           from: "users", // name of your user collection
//           localField: "unqUserObjectId",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$userDetails",
//           preserveNullAndEmptyArrays: true, // in case user not found
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           role: 1,
//           purposeOfExpense: 1,
//           expenseDate: 1,
//           expenseType: 1,
//           travelFrom: 1,
//           travelTo: 1,
//           travelledDistance: 1,
//           expenseAmount: 1,
//           fileName: 1,
//           fileUrl: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           verification: 1,
//           approval: 1,

//           // Include user details
//           "userDetails._id": 1,
//           "userDetails.userId": 1,
//           "userDetails.name": 1,
//           "userDetails.email": 1,
//           "userDetails.contact1": 1,
//           "userDetails.contact2": 1,
//           "userDetails.department": 1,
//           "userDetails.role": 1,
//           "userDetails.isActive": 1,
//           "userDetails.profileImage": 1,
//           "userDetails.longitude": 1,
//           "userDetails.latitude": 1,
//         },
//       },
//       { $sort: { createdAt: -1 } }, // latest first
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error("Error fetching bills with user details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching expenses",
//       error: error.message,
//     });
//   }
// };


// export const getAllBillsWithUserDetails = async (req, res) => {
//   try {
//     console.log("Fetching bills data with user details...");

//     let { startDate, endDate, status } = req.body;

//     // ✅ Default: current month’s start & end
//     const now = new Date();
//     const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const lastDayOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59
//     );

//     // ✅ If no date range passed, fallback to default current month
//     const start = startDate ? new Date(startDate) : firstDayOfMonth;
//     const end = endDate ? new Date(endDate) : lastDayOfMonth;

//     // ✅ Build filter
//     let matchStage = {
//       createdAt: { $gte: start, $lte: end },
//     };

//     if (status) {
//       matchStage.status = status;
//     }

//     const expenses = await Expense.aggregate([
//       { $match: matchStage },

//       // 🔹 Join with Users
//       {
//         $lookup: {
//           from: "users",
//           localField: "unqUserObjectId",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//       { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

//       // 🔹 Join with UserAccess
//       {
//         $lookup: {
//           from: "useraccesses",
//           localField: "userDetails._id",
//           foreignField: "unqObjectId",
//           as: "userAccess",
//         },
//       },
//       { $unwind: { path: "$userAccess", preserveNullAndEmptyArrays: true } },

//       // 🔹 Extract districtIds + schoolIds from nested structure
//       {
//         $addFields: {
//           districtIds: {
//             $map: {
//               input: "$userAccess.region",
//               as: "reg",
//               in: "$$reg.districtId",
//             },
//           },
//           schoolIds: {
//             $reduce: {
//               input: "$userAccess.region",
//               initialValue: [],
//               in: {
//                 $concatArrays: [
//                   "$$value",
//                   {
//                     $reduce: {
//                       input: "$$this.blockIds",
//                       initialValue: [],
//                       in: {
//                         $concatArrays: [
//                           "$$value",
//                           {
//                             $map: {
//                               input: "$$this.schoolIds",
//                               as: "sc",
//                               in: "$$sc.schoolId",
//                             },
//                           },
//                         ],
//                       },
//                     },
//                   },
//                 ],
//               },
//             },
//           },
//         },
//       },

//       // 🔹 Lookup with proper filter on district + schoolIds
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: {
//             distIds: "$districtIds",
//             schoolIds: "$schoolIds",
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: ["$districtId", "$$distIds"] },
//                     { $in: ["$centerId", "$$schoolIds"] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "regionDetails",
//         },
//       },

//       // 🔹 Final Projection
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           role: 1,
//           purposeOfExpense: 1,
//           expenseDate: 1,
//           expenseType: 1,
//           travelFrom: 1,
//           travelTo: 1,
//           travelledDistance: 1,
//           expenseAmount: 1,
//           fileName: 1,
//           fileUrl: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           verification: 1,
//           approval: 1,

//           // user details
//           "userDetails._id": 1,
//           "userDetails.userId": 1,
//           "userDetails.name": 1,
//           "userDetails.email": 1,
//           "userDetails.contact1": 1,
//           "userDetails.contact2": 1,
//           "userDetails.department": 1,
//           "userDetails.role": 1,
//           "userDetails.isActive": 1,
//           "userDetails.profileImage": 1,
//           "userDetails.longitude": 1,
//           "userDetails.latitude": 1,

//           // user access + region details
//           userAccess: 1,
//           regionDetails: 1,
//         },
//       },

//       { $sort: { createdAt: -1 } },
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error("Error fetching bills with user details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching expenses",
//       error: error.message,
//     });
//   }
// };












export const getAllBillsWithUserDetails = async (req, res) => {
  try {
    console.log("Fetching bills data with user details...");

    let { startDate, endDate, status, roles } = req.body; // roles added

    console.log(req.body)

    // ✅ Default: current month’s start & end
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // ✅ If no date range passed, fallback to default current month
    const start = startDate ? new Date(startDate) : firstDayOfMonth;
    const end = endDate ? new Date(endDate) : lastDayOfMonth;

    // ✅ Build filter
    let matchStage = {
      createdAt: { $gte: start, $lte: end },
    };

    if (status) {
      matchStage.status = status;
    }

    if (roles && roles.length > 0) {
      matchStage.role = { $in: roles };
    }

    const expenses = await Expense.aggregate([
      { $match: matchStage },

      // 🔹 Join with Users
      {
        $lookup: {
          from: "users",
          localField: "unqUserObjectId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      // 🔹 Join with UserAccess
      {
        $lookup: {
          from: "useraccesses",
          localField: "userDetails._id",
          foreignField: "unqObjectId",
          as: "userAccess",
        },
      },
      { $unwind: { path: "$userAccess", preserveNullAndEmptyArrays: true } },

      // 🔹 Extract districtIds + schoolIds from nested structure
      {
        $addFields: {
          districtIds: {
            $map: {
              input: "$userAccess.region",
              as: "reg",
              in: "$$reg.districtId",
            },
          },
          schoolIds: {
            $reduce: {
              input: "$userAccess.region",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $reduce: {
                      input: "$$this.blockIds",
                      initialValue: [],
                      in: {
                        $concatArrays: [
                          "$$value",
                          {
                            $map: {
                              input: "$$this.schoolIds",
                              as: "sc",
                              in: "$$sc.schoolId",
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // 🔹 Lookup with proper filter on district + schoolIds
      {
        $lookup: {
          from: "district_block_schools",
          let: {
            distIds: "$districtIds",
            schoolIds: "$schoolIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$districtId", "$$distIds"] },
                    { $in: ["$centerId", "$$schoolIds"] },
                  ],
                },
              },
            },
          ],
          as: "regionDetails",
        },
      },

      // 🔹 Final Projection
      {
        $project: {
          _id: 1,
          userId: 1,
          role: 1,
          purposeOfExpense: 1,
          expenseDate: 1,
          expenseType: 1,
          travelFrom: 1,
          travelTo: 1,
          travelledDistance: 1,
          expenseAmount: 1,
          fileName: 1,
          fileUrl: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          verification: 1,
          approval: 1,

          // user details
          "userDetails._id": 1,
          "userDetails.userId": 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
          "userDetails.contact1": 1,
          "userDetails.contact2": 1,
          "userDetails.department": 1,
          "userDetails.role": 1,
          "userDetails.isActive": 1,
          "userDetails.profileImage": 1,
          "userDetails.longitude": 1,
          "userDetails.latitude": 1,

          // user access + region details
          userAccess: 1,
          regionDetails: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("Error fetching bills with user details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching expenses",
      error: error.message,
    });
  }
};












//-----------------------------------------------------------------------------------------