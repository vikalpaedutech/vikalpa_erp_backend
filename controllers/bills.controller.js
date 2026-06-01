import { Query, set } from "mongoose";
import { Expense } from "../models/bills.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import multer from "multer";
import { response } from "express";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

import { uploadToDOStorage } from "../utils/digitalOceanSpaces.utils.js";

import { District_Block_School } from "../models/district_block_school.model.js";

import { UserAccess } from "../models/user.model.js";





// Multer memory storage
const storage = multer.memoryStorage();
export const uploadFile = multer({ storage }).single('file');

// Create Expense with DigitalOcean upload
export const createPost = async (req, res) => {
  console.log("i am inside bills.controller.js, api: CreatePost");

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





//version 2 api


// Version 2 API - View Bills by Logged In User ID and Date Range
export const ViewBillSByLoggedInUserIdandDateRange = async (req, res) => {

  console.log("I am inside bills.controller.js, api: ViewBillSByLoggedInUserIdandDateRange")
  const { _id, startDate, endDate } = req.body;

  console.log(req.body)

  // Validation
  if (!_id) {
    return res.status(400).json({
      status: "Error",
      message: "User ID (_id) is required"
    });
  }

  try {
    // Convert string to ObjectId if needed
    const userObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;
    
    // Date range filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        expenseDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else if (startDate) {
      dateFilter = {
        expenseDate: {
          $gte: new Date(startDate)
        }
      };
    } else if (endDate) {
      dateFilter = {
        expenseDate: {
          $lte: new Date(endDate)
        }
      };
    }

    // Aggregation pipeline
    const result = await Expense.aggregate([
      // Match expenses for the given user
      {
        $match: {
          unqUserObjectId: userObjectId,
          ...dateFilter
        }
      },
      
      // Sort by expense date (newest first)
      {
        $sort: { expenseDate: -1, createdAt: -1 }
      },
      
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "unqUserObjectId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      
      // Unwind user details
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Lookup user access details
      {
        $lookup: {
          from: "useraccesses",
          localField: "unqUserObjectId",
          foreignField: "unqObjectId",
          as: "userAccessDetails"
        }
      },
      
      // Unwind user access details
      {
        $unwind: {
          path: "$userAccessDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Unwind region array to get individual regions
      {
        $unwind: {
          path: "$userAccessDetails.region",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Unwind blockIds array
      {
        $unwind: {
          path: "$userAccessDetails.region.blockIds",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Unwind schoolIds array
      {
        $unwind: {
          path: "$userAccessDetails.region.blockIds.schoolIds",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Lookup district, block, school details from District_Block_School
      {
        $lookup: {
          from: "district_block_schools",
          let: { 
            schoolId: "$userAccessDetails.region.blockIds.schoolIds.schoolId",
            blockId: "$userAccessDetails.region.blockIds.blockId",
            districtId: "$userAccessDetails.region.districtId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$schoolId", "$$schoolId"] },
                    { $eq: ["$blockId", "$$blockId"] },
                    { $eq: ["$districtId", "$$districtId"] }
                  ]
                }
              }
            }
          ],
          as: "schoolDetails"
        }
      },
      
      // Unwind school details
      {
        $unwind: {
          path: "$schoolDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Group back to collect all schools for each expense
      {
        $group: {
          _id: "$_id",
          expense: { $first: "$$ROOT" },
          schools: {
            $push: {
              districtId: "$userAccessDetails.region.districtId",
              districtName: "$schoolDetails.districtName",
              blockId: "$userAccessDetails.region.blockIds.blockId",
              blockName: "$schoolDetails.blockName",
              schoolId: "$userAccessDetails.region.blockIds.schoolIds.schoolId",
              schoolName: "$schoolDetails.schoolName"
            }
          }
        }
      },
      
      // Remove duplicate schools
      {
        $addFields: {
          schools: {
            $reduce: {
              input: "$schools",
              initialValue: [],
              in: {
                $cond: {
                  if: { $in: ["$$this.schoolId", "$$value.schoolId"] },
                  then: "$$value",
                  else: { $concatArrays: ["$$value", ["$$this"]] }
                }
              }
            }
          }
        }
      },
      
      // Project the final structure
      {
        $project: {
          _id: "$expense._id",
          unqUserObjectId: "$expense.unqUserObjectId",
          userId: "$expense.userId",
          role: "$expense.role",
          purposeOfExpense: "$expense.purposeOfExpense",
          descriptionExpense: "$expense.descriptionExpense",
          expenseDate: "$expense.expenseDate",
          expenseType: "$expense.expenseType",
          travelFrom: "$expense.travelFrom",
          travelTo: "$expense.travelTo",
          travelledDistance: "$expense.travelledDistance",
          foodType: "$expense.foodType",
          accomodationDate: "$expense.accomodationDate",
          stayedForDays: "$expense.stayedForDays",
          otherItemName: "$expense.otherItemName",
          otherItemPurchasingPurpose: "$expense.otherItemPurchasingPurpose",
          otherItemDescription: "$expense.otherItemDescription",
          expenseAmount: "$expense.expenseAmount",
          fileName: "$expense.fileName",
          fileUrl: "$expense.fileUrl",
          fileMetadata: "$expense.fileMetadata",
          status: "$expense.status",
          verification: "$expense.verification",
          approval: "$expense.approval",
          createdAt: "$expense.createdAt",
          updatedAt: "$expense.updatedAt",
          userDetails: {
            _id: "$expense.userDetails._id",
            userId: "$expense.userDetails.userId",
            name: "$expense.userDetails.name",
            email: "$expense.userDetails.email",
            role: "$expense.userDetails.role",
            department: "$expense.userDetails.department",
            contact1: "$expense.userDetails.contact1",
            contact2: "$expense.userDetails.contact2"
          },
          userAccess: {
            batches: "$expense.userAccessDetails.batch",
            modules: "$expense.userAccessDetails.modules"
          },
          schools: {
            $filter: {
              input: "$schools",
              as: "school",
              cond: { $ne: ["$$school.schoolId", null] }
            }
          }
        }
      }
    ]);

    // If no expenses found
    if (!result || result.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No bills found for the given user",
        data: [],
        total: 0
      });
    }

    // Calculate total amount
    const totalAmount = result.reduce((sum, bill) => sum + (bill.expenseAmount || 0), 0);

    // Return success response
    return res.status(200).json({
      status: "Success",
      message: "Bills fetched successfully",
      data: result,
      total: result.length,
      totalAmount: totalAmount,
      summary: {
        totalBills: result.length,
        totalExpense: totalAmount,
        statusBreakdown: {
          Submitted: result.filter(b => b.status === "Submitted").length,
          Pending: result.filter(b => b.status === "Pending").length,
          Verified: result.filter(b => b.status === "Verified").length,
          Approved: result.filter(b => b.status === "Approved").length,
          Rejected: result.filter(b => b.status === "Rejected").length,
          Paid: result.filter(b => b.status === "Paid").length
        }
      }
    });

  } catch (error) {
    console.error("Error in ViewBillSByLoggedInUserIdandDateRange:", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message
    });
  }
};



//Bills Verification

export const BillsVerification = async (req, res) => {
  console.log("I am inside bills.controller.js, API: BillsVerification");
  
  const { _id, status, verification, approval } = req.body;

  // Validation - Check if bill ID is provided
  if (!_id) {
    return res.status(400).json({
      status: "Error",
      message: "Bill ID (_id) is required"
    });
  }

  // Validation - Check if status is valid
  const validStatuses = ["Submitted", "Pending", "Verified", "Approved", "Rejected", "Paid"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      status: "Error",
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    });
  }

  try {
    // Convert string to ObjectId if needed
    const billObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;
    
    // Find the bill first to check if it exists
    const existingBill = await Expense.findById(billObjectId);
    
    if (!existingBill) {
      return res.status(404).json({
        status: "Error",
        message: "Bill not found"
      });
    }

    // Prepare update object
    const updateData = {};
    
    // Update status if provided
    if (status) {
      updateData.status = status;
    }
    
    // Update verification details if provided
    if (verification) {
      // If verification object is provided, update verification fields
      updateData["verification.verifiedBy"] = verification.verifiedBy || null;
      updateData["verification.verifiedAt"] = verification.verifiedAt || new Date();
      updateData["verification.comments"] = verification.comments || "";
    }
    
    // If no updates to make
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "Error",
        message: "No updates provided. Please provide status or verification details."
      });
    }

    // Update the bill
    const updatedBill = await Expense.findByIdAndUpdate(
      billObjectId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('unqUserObjectId', 'name userId email role')
     .populate('verification.verifiedBy', 'name userId email role');

    // Return success response
    return res.status(200).json({
      status: "Success",
      message: "Bill verification updated successfully",
      data: {
        _id: updatedBill._id,
        userId: updatedBill.userId,
        role: updatedBill.role,
        purposeOfExpense: updatedBill.purposeOfExpense,
        expenseAmount: updatedBill.expenseAmount,
        expenseDate: updatedBill.expenseDate,
        expenseType: updatedBill.expenseType,
        status: updatedBill.status,
        verification: updatedBill.verification,
        updatedAt: updatedBill.updatedAt
      }
    });

  } catch (error) {
    console.error("Error in BillsVerification:", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message
    });
  }
};


//Bills Approval
export const BillsApproval = async (req, res) => {
  console.log("I am inside bills.controller.js, API: BillsApproval");
  
  const { _id, status, approval } = req.body;

  // Validation - Check if bill ID is provided
  if (!_id) {
    return res.status(400).json({
      status: "Error",
      message: "Bill ID (_id) is required"
    });
  }

  // Validation - Check if status is valid
  const validStatuses = ["Submitted", "Pending", "Verified", "Approved", "Rejected", "Paid"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      status: "Error",
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    });
  }

  try {
    // Convert string to ObjectId if needed
    const billObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;
    
    // Find the bill first to check if it exists
    const existingBill = await Expense.findById(billObjectId);
    
    if (!existingBill) {
      return res.status(404).json({
        status: "Error",
        message: "Bill not found"
      });
    }

    // Check if bill is already approved
    if (existingBill.status === "Approved" && !status) {
      return res.status(400).json({
        status: "Error",
        message: "Bill is already approved. Cannot approve again."
      });
    }

    // Prepare update object
    const updateData = {};
    
    // Update status if provided
    if (status) {
      updateData.status = status;
    }
    
    // Update approval details if provided
    if (approval) {
      // If approval object is provided, update approval fields
      updateData["approval.approvedBy"] = approval.approvedBy || null;
      updateData["approval.approvedAt"] = approval.approvedAt || new Date();
      updateData["approval.comments"] = approval.comments || "";
    }
    
    // If no updates to make
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "Error",
        message: "No updates provided. Please provide status or approval details."
      });
    }

    // Update the bill
    const updatedBill = await Expense.findByIdAndUpdate(
      billObjectId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('unqUserObjectId', 'name userId email role contact1 contact2')
     .populate('verification.verifiedBy', 'name userId email role')
     .populate('approval.approvedBy', 'name userId email role');

    // Return success response
    return res.status(200).json({
      status: "Success",
      message: status === "Approved" ? "Bill approved successfully" : "Bill approval updated successfully",
      data: {
        _id: updatedBill._id,
        userId: updatedBill.userId,
        role: updatedBill.role,
        purposeOfExpense: updatedBill.purposeOfExpense,
        expenseAmount: updatedBill.expenseAmount,
        expenseDate: updatedBill.expenseDate,
        expenseType: updatedBill.expenseType,
        status: updatedBill.status,
        verification: updatedBill.verification,
        approval: updatedBill.approval,
        updatedAt: updatedBill.updatedAt
      }
    });

  } catch (error) {
    console.error("Error in BillsApproval:", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message
    });
  }
};



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




//Get data for bills verification

// // API to fetch bills for verification based on user's accessible schools
// export const GetBillsForVerification = async (req, res) => {
//   console.log("I am inside bills.controller.js, API: GetBillsForVerification");
  
//   const { _id, startDate, endDate, status = "Pending", limit = 50, page = 1 } = req.body;

//   // Validation
//   if (!_id) {
//     return res.status(400).json({
//       status: "Error",
//       message: "User ID (_id) is required"
//     });
//   }

//   try {
//     // Convert string to ObjectId if needed
//     const userObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;

//     // First, get the user's accessible schools from useraccesses
//     const userAccess = await UserAccess.findOne({ unqObjectId: userObjectId });
    
//     if (!userAccess) {
//       return res.status(404).json({
//         status: "Error",
//         message: "User access not found"
//       });
//     }

//     // Extract all schoolIds that the user has access to
//     const accessibleSchoolIds = [];
//     if (userAccess.region) {
//       userAccess.region.forEach(region => {
//         region.blockIds?.forEach(block => {
//           block.schoolIds?.forEach(school => {
//             if (school.schoolId) {
//               accessibleSchoolIds.push(school.schoolId);
//             }
//           });
//         });
//       });
//     }

//     // Remove duplicate schoolIds
//     const uniqueSchoolIds = [...new Set(accessibleSchoolIds)];

//     if (uniqueSchoolIds.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No schools accessible for this user",
//         data: [],
//         total: 0,
//         summary: {
//           totalBills: 0,
//           totalAmount: 0,
//           accessibleSchoolsCount: 0
//         }
//       });
//     }

//     // Get all school details from district_block_schools
//     const schoolDetails = await District_Block_School.find({
//       schoolId: { $in: uniqueSchoolIds }
//     });

//     // Create a map for quick school lookup
//     const schoolMap = new Map();
//     schoolDetails.forEach(school => {
//       schoolMap.set(school.schoolId, {
//         districtId: school.districtId,
//         districtName: school.districtName,
//         blockId: school.blockId,
//         blockName: school.blockName,
//         schoolId: school.schoolId,
//         schoolName: school.schoolName
//       });
//     });

//     // Get all users who have these schools in their access (the bill submitters)
//     // Find all users whose useraccesses contain any of these schoolIds
//     const usersWithAccess = await UserAccess.find({
//       "region.blockIds.schoolIds.schoolId": { $in: uniqueSchoolIds }
//     });

//     const submitterUserIds = usersWithAccess.map(ua => ua.unqObjectId);

//     if (submitterUserIds.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No users found with accessible schools",
//         data: [],
//         total: 0,
//         summary: {
//           totalBills: 0,
//           totalAmount: 0,
//           accessibleSchoolsCount: uniqueSchoolIds.length
//         }
//       });
//     }

//     // Date range filter
//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter = {
//         expenseDate: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         }
//       };
//     } else if (startDate) {
//       dateFilter = {
//         expenseDate: {
//           $gte: new Date(startDate)
//         }
//       };
//     } else if (endDate) {
//       dateFilter = {
//         expenseDate: {
//           $lte: new Date(endDate)
//         }
//       };
//     }

//     // Calculate skip for pagination
//     const skip = (page - 1) * limit;

//     // Build status filter
//     let statusFilter = {};
//     if (status !== "All") {
//       statusFilter = { status: status };
//     }

//     // Aggregation pipeline to get bills from submitters
//     const result = await Expense.aggregate([
//       // Match expenses from users who have accessible schools
//       {
//         $match: {
//           unqUserObjectId: { $in: submitterUserIds },
//           ...dateFilter,
//           ...statusFilter
//         }
//       },
      
//       // Sort by expense date (newest first)
//       {
//         $sort: { expenseDate: -1, createdAt: -1 }
//       },
      
//       // Lookup user details of the bill submitter
//       {
//         $lookup: {
//           from: "users",
//           localField: "unqUserObjectId",
//           foreignField: "_id",
//           as: "submitterDetails"
//         }
//       },
      
//       // Unwind submitter details
//       {
//         $unwind: {
//           path: "$submitterDetails",
//           preserveNullAndEmptyArrays: true
//         }
//       },
      
//       // Lookup user access of the bill submitter to get their schools
//       {
//         $lookup: {
//           from: "useraccesses",
//           localField: "unqUserObjectId",
//           foreignField: "unqObjectId",
//           as: "submitterAccess"
//         }
//       },
      
//       // Unwind submitter access
//       {
//         $unwind: {
//           path: "$submitterAccess",
//           preserveNullAndEmptyArrays: true
//         }
//       },
      
//       // Unwind region array
//       {
//         $unwind: {
//           path: "$submitterAccess.region",
//           preserveNullAndEmptyArrays: true
//         }
//       },
      
//       // Unwind blockIds array
//       {
//         $unwind: {
//           path: "$submitterAccess.region.blockIds",
//           preserveNullAndEmptyArrays: true
//         }
//       },
      
//       // Unwind schoolIds array
//       {
//         $unwind: {
//           path: "$submitterAccess.region.blockIds.schoolIds",
//           preserveNullAndEmptyArrays: true
//         }
//       },
      
//       // Lookup school details for each school
//       {
//         $lookup: {
//           from: "district_block_schools",
//           let: { 
//             schoolId: "$submitterAccess.region.blockIds.schoolIds.schoolId",
//             blockId: "$submitterAccess.region.blockIds.blockId",
//             districtId: "$submitterAccess.region.districtId"
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$schoolId", "$$schoolId"] },
//                     { $eq: ["$blockId", "$$blockId"] },
//                     { $eq: ["$districtId", "$$districtId"] }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: "schoolDetails"
//         }
//       },
      
//       // Unwind school details
//       {
//         $unwind: {
//           path: "$schoolDetails",
//           preserveNullAndEmptyArrays: true
//         }
//       },
      
//       // Group back to collect all schools for each expense
//       {
//         $group: {
//           _id: "$_id",
//           expense: { $first: "$$ROOT" },
//           schools: {
//             $push: {
//               districtId: "$submitterAccess.region.districtId",
//               districtName: "$schoolDetails.districtName",
//               blockId: "$submitterAccess.region.blockIds.blockId",
//               blockName: "$schoolDetails.blockName",
//               schoolId: "$submitterAccess.region.blockIds.schoolIds.schoolId",
//               schoolName: "$schoolDetails.schoolName"
//             }
//           }
//         }
//       },
      
//       // Remove duplicate schools
//       {
//         $addFields: {
//           schools: {
//             $reduce: {
//               input: "$schools",
//               initialValue: [],
//               in: {
//                 $cond: {
//                   if: { $in: ["$$this.schoolId", "$$value.schoolId"] },
//                   then: "$$value",
//                   else: { $concatArrays: ["$$value", ["$$this"]] }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       // Project the final structure
//       {
//         $project: {
//           _id: "$expense._id",
//           unqUserObjectId: "$expense.unqUserObjectId",
//           userId: "$expense.userId",
//           role: "$expense.role",
//           purposeOfExpense: "$expense.purposeOfExpense",
//           descriptionExpense: "$expense.descriptionExpense",
//           expenseDate: "$expense.expenseDate",
//           expenseType: "$expense.expenseType",
//           travelFrom: "$expense.travelFrom",
//           travelTo: "$expense.travelTo",
//           travelledDistance: "$expense.travelledDistance",
//           foodType: "$expense.foodType",
//           accomodationDate: "$expense.accomodationDate",
//           stayedForDays: "$expense.stayedForDays",
//           otherItemName: "$expense.otherItemName",
//           otherItemPurchasingPurpose: "$expense.otherItemPurchasingPurpose",
//           otherItemDescription: "$expense.otherItemDescription",
//           expenseAmount: "$expense.expenseAmount",
//           fileName: "$expense.fileName",
//           fileUrl: "$expense.fileUrl",
//           fileMetadata: "$expense.fileMetadata",
//           status: "$expense.status",
//           verification: "$expense.verification",
//           approval: "$expense.approval",
//           createdAt: "$expense.createdAt",
//           updatedAt: "$expense.updatedAt",
//           submitterDetails: {
//             _id: "$expense.submitterDetails._id",
//             userId: "$expense.submitterDetails.userId",
//             name: "$expense.submitterDetails.name",
//             email: "$expense.submitterDetails.email",
//             role: "$expense.submitterDetails.role",
//             department: "$expense.submitterDetails.department",
//             contact1: "$expense.submitterDetails.contact1",
//             contact2: "$expense.submitterDetails.contact2"
//           },
//           schools: {
//             $filter: {
//               input: "$schools",
//               as: "school",
//               cond: { $ne: ["$$school.schoolId", null] }
//             }
//           }
//         }
//       },
      
//       // Pagination
//       { $skip: skip },
//       { $limit: limit }
//     ]);

//     // Get total count for pagination
//     const totalCount = await Expense.countDocuments({
//       unqUserObjectId: { $in: submitterUserIds },
//       ...dateFilter,
//       ...statusFilter
//     });

//     // Calculate total amount
//     const totalAmount = result.reduce((sum, bill) => sum + (bill.expenseAmount || 0), 0);

//     // Calculate summary statistics
//     const statusBreakdown = {
//       Submitted: result.filter(b => b.status === "Submitted").length,
//       Pending: result.filter(b => b.status === "Pending").length,
//       Verified: result.filter(b => b.status === "Verified").length,
//       Approved: result.filter(b => b.status === "Approved").length,
//       Rejected: result.filter(b => b.status === "Rejected").length,
//       Paid: result.filter(b => b.status === "Paid").length
//     };

//     const expenseTypeBreakdown = {};
//     result.forEach(bill => {
//       expenseTypeBreakdown[bill.expenseType] = (expenseTypeBreakdown[bill.expenseType] || 0) + 1;
//     });

//     return res.status(200).json({
//       status: "Success",
//       message: "Bills fetched successfully for verification",
//       data: result,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / limit),
//         totalItems: totalCount,
//         itemsPerPage: limit
//       },
//       summary: {
//         totalBills: result.length,
//         totalAmount: totalAmount,
//         accessibleSchoolsCount: uniqueSchoolIds.length,
//         statusBreakdown: statusBreakdown,
//         expenseTypeBreakdown: expenseTypeBreakdown
//       },
//       verifierInfo: {
//         _id: userObjectId,
//         accessibleSchools: uniqueSchoolIds.length,
//         schoolDetails: Array.from(schoolMap.values())
//       }
//     });

//   } catch (error) {
//     console.error("Error in GetBillsForVerification:", error);
//     return res.status(500).json({
//       status: "Error",
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// // Simplified version without aggregation (faster for large datasets)
// export const GetBillsForVerificationSimple = async (req, res) => {
//   console.log("I am inside bills.controller.js, API: GetBillsForVerificationSimple");
  
//   const { _id, startDate, endDate, status = "Pending", limit = 50, page = 1 } = req.body;

//   if (!_id) {
//     return res.status(400).json({
//       status: "Error",
//       message: "User ID (_id) is required"
//     });
//   }

//   try {
//     const userObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;

//     // Get user's accessible schools
//     const userAccess = await UserAccess.findOne({ unqObjectId: userObjectId });
    
//     if (!userAccess) {
//       return res.status(404).json({
//         status: "Error",
//         message: "User access not found"
//       });
//     }

//     // Extract schoolIds
//     const accessibleSchoolIds = [];
//     if (userAccess.region) {
//       userAccess.region.forEach(region => {
//         region.blockIds?.forEach(block => {
//           block.schoolIds?.forEach(school => {
//             if (school.schoolId) {
//               accessibleSchoolIds.push(school.schoolId);
//             }
//           });
//         });
//       });
//     }

//     const uniqueSchoolIds = [...new Set(accessibleSchoolIds)];

//     if (uniqueSchoolIds.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No schools accessible for this user",
//         data: [],
//         total: 0
//       });
//     }

//     // Get school details
//     const schoolDetails = await District_Block_School.find({
//       schoolId: { $in: uniqueSchoolIds }
//     });

//     // Get all users who have these schools
//     const usersWithAccess = await UserAccess.find({
//       "region.blockIds.schoolIds.schoolId": { $in: uniqueSchoolIds }
//     });

//     const submitterUserIds = usersWithAccess.map(ua => ua.unqObjectId);

//     if (submitterUserIds.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No submitters found",
//         data: [],
//         total: 0
//       });
//     }

//     // Build date filter
//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter = {
//         expenseDate: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         }
//       };
//     } else if (startDate) {
//       dateFilter = { expenseDate: { $gte: new Date(startDate) } };
//     } else if (endDate) {
//       dateFilter = { expenseDate: { $lte: new Date(endDate) } };
//     }

//     // Build status filter
//     let statusFilter = {};
//     if (status !== "All") {
//       statusFilter = { status: status };
//     }

//     // Get bills
//     const skip = (page - 1) * limit;
//     const totalCount = await Expense.countDocuments({
//       unqUserObjectId: { $in: submitterUserIds },
//       ...dateFilter,
//       ...statusFilter
//     });

//     const expenses = await Expense.find({
//       unqUserObjectId: { $in: submitterUserIds },
//       ...dateFilter,
//       ...statusFilter
//     })
//       .sort({ expenseDate: -1, createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate('unqUserObjectId', 'name userId email role contact1 contact2')
//       .populate('verification.verifiedBy', 'name userId email role')
//       .populate('approval.approvedBy', 'name userId email role');

//     // Get submitter details
//     const submitters = await User.find({ _id: { $in: submitterUserIds } });

//     const submitterMap = new Map();
//     submitters.forEach(submitter => {
//       submitterMap.set(submitter._id.toString(), submitter);
//     });

//     // Format response
//     const formattedExpenses = expenses.map(expense => ({
//       ...expense.toObject(),
//       submitterDetails: submitterMap.get(expense.unqUserObjectId?.toString()) || null
//     }));

//     const totalAmount = formattedExpenses.reduce((sum, bill) => sum + (bill.expenseAmount || 0), 0);

//     const statusBreakdown = {
//       Submitted: formattedExpenses.filter(b => b.status === "Submitted").length,
//       Pending: formattedExpenses.filter(b => b.status === "Pending").length,
//       Verified: formattedExpenses.filter(b => b.status === "Verified").length,
//       Approved: formattedExpenses.filter(b => b.status === "Approved").length,
//       Rejected: formattedExpenses.filter(b => b.status === "Rejected").length,
//       Paid: formattedExpenses.filter(b => b.status === "Paid").length
//     };

//     return res.status(200).json({
//       status: "Success",
//       message: "Bills fetched successfully for verification",
//       data: formattedExpenses,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / limit),
//         totalItems: totalCount,
//         itemsPerPage: limit
//       },
//       summary: {
//         totalBills: formattedExpenses.length,
//         totalAmount: totalAmount,
//         accessibleSchoolsCount: uniqueSchoolIds.length,
//         statusBreakdown: statusBreakdown
//       },
//       verifierInfo: {
//         _id: userObjectId,
//         accessibleSchools: uniqueSchoolIds,
//         schoolDetails: schoolDetails
//       }
//     });

//   } catch (error) {
//     console.error("Error in GetBillsForVerificationSimple:", error);
//     return res.status(500).json({
//       status: "Error",
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };







// export const GetBillsForVerification = async (req, res) => {
//   console.log("I am inside bills.controller.js, API: GetBillsForVerification");
  
//   const { _id, startDate, endDate, status = "Pending", role = null, limit = 50, page = 1 } = req.body;
// console.log(startDate, endDate)
// console.log(page)
//   // Validation
//   if (!_id) {
//     return res.status(400).json({
//       status: "Error",
//       message: "User ID (_id) is required"
//     });
//   }

//   try {
//     // Convert string to ObjectId if needed
//     const userObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;

//     // Get the verifier's details
//     const verifierUser = await User.findById(userObjectId);
    
//     if (!verifierUser) {
//       return res.status(404).json({
//         status: "Error",
//         message: "Verifier user not found"
//       });
//     }

//     // Determine which roles to filter (coming from frontend)
//     let allowedRolesToVerify = [];
    
//     if (role) {
//       // If role is an array, use it directly
//       if (Array.isArray(role)) {
//         allowedRolesToVerify = role;
//       } else {
//         allowedRolesToVerify = [role];
//       }
//     } else {
//       // If no role filter, only show same role bills
//       allowedRolesToVerify = [verifierUser.role];
//     }

//     console.log("Verifier Role:", verifierUser.role);
//     console.log("Allowed roles to verify (from frontend):", allowedRolesToVerify);

//     // If no roles to verify, return empty
//     if (allowedRolesToVerify.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No roles specified for verification",
//         data: [],
//         total: 0,
//         summary: {
//           totalBills: 0,
//           totalAmount: 0,
//           accessibleSchoolsCount: 0,
//           allowedRoles: allowedRolesToVerify
//         }
//       });
//     }

//     // First, get the user's accessible schools from useraccesses
//     const userAccess = await UserAccess.findOne({ unqObjectId: userObjectId });
    
//     if (!userAccess) {
//       return res.status(404).json({
//         status: "Error",
//         message: "User access not found"
//       });
//     }

//     // Extract all schoolIds that the user has access to
//     const accessibleSchoolIds = [];
//     if (userAccess.region) {
//       userAccess.region.forEach(region => {
//         region.blockIds?.forEach(block => {
//           block.schoolIds?.forEach(school => {
//             if (school.schoolId) {
//               accessibleSchoolIds.push(school.schoolId);
//             }
//           });
//         });
//       });
//     }

//     // Remove duplicate schoolIds
//     const uniqueSchoolIds = [...new Set(accessibleSchoolIds)];

//     if (uniqueSchoolIds.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No schools accessible for this user",
//         data: [],
//         total: 0,
//         summary: {
//           totalBills: 0,
//           totalAmount: 0,
//           accessibleSchoolsCount: 0,
//           allowedRoles: allowedRolesToVerify
//         }
//       });
//     }

//     // Get all school details from district_block_schools
//     const schoolDetails = await District_Block_School.find({
//       schoolId: { $in: uniqueSchoolIds }
//     });

//     // Create a map for quick school lookup
//     const schoolMap = new Map();
//     schoolDetails.forEach(school => {
//       schoolMap.set(school.schoolId, {
//         districtId: school.districtId,
//         districtName: school.districtName,
//         blockId: school.blockId,
//         blockName: school.blockName,
//         schoolId: school.schoolId,
//         schoolName: school.schoolName 
//       });
//     });

//     // Get all users who have these schools in their access
//     const usersWithAccess = await UserAccess.find({
//       "region.blockIds.schoolIds.schoolId": { $in: uniqueSchoolIds }
//     });

//     // Get the actual user details for these accesses to filter by allowed roles
//     const submitterUsers = await User.find({
//       _id: { $in: usersWithAccess.map(ua => ua.unqObjectId) },
//       role: { $in: allowedRolesToVerify }  // Using $in operator for array
//     });

//     const submitterUserIds = submitterUsers.map(user => user._id);

//     if (submitterUserIds.length === 0) {
//       return res.status(200).json({
//         status: "Success",
//         message: "No submitters found for the allowed roles",
//         data: [],
//         total: 0,
//         summary: {
//           totalBills: 0,
//           totalAmount: 0,
//           accessibleSchoolsCount: uniqueSchoolIds.length,
//           allowedRoles: allowedRolesToVerify
//         }
//       });
//     }

//     // Date range filter
//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter = {
//         expenseDate: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         }
//       };
//     } else if (startDate) {
//       dateFilter = {
//         expenseDate: {
//           $gte: new Date(startDate)
//         }
//       };
//     } else if (endDate) {
//       dateFilter = {
//         expenseDate: {
//           $lte: new Date(endDate)
//         }
//       };
//     }

//     // Calculate skip for pagination
//     const skip = (page - 1) * limit;

//     // Build status filter
//     let statusFilter = {};
//     if (status && status !== "All") {
//       statusFilter = { status: status };
//     }

//     // Get total count for pagination
//     const totalCount = await Expense.countDocuments({
//       unqUserObjectId: { $in: submitterUserIds },
//       ...dateFilter,
//       ...statusFilter
//     });

//     // Get expenses with pagination
//     const expenses = await Expense.find({
//       unqUserObjectId: { $in: submitterUserIds },
//       ...dateFilter,
//       ...statusFilter
//     })
//       .sort({ expenseDate: -1, createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate('unqUserObjectId', 'name userId email role contact1 contact2')
//       .populate('verification.verifiedBy', 'name userId email role')
//       .populate('approval.approvedBy', 'name userId email role');

//     // Get submitter details map
//     const submitterMap = new Map();
//     submitterUsers.forEach(submitter => {
//       submitterMap.set(submitter._id.toString(), submitter);
//     });

//     // Format response
//     const formattedExpenses = expenses.map(expense => ({
//       ...expense.toObject(),
//       submitterDetails: submitterMap.get(expense.unqUserObjectId?.toString()) || null
//     }));

//     // Calculate totals
//     const totalAmount = formattedExpenses.reduce((sum, bill) => sum + (bill.expenseAmount || 0), 0);

//     // Calculate status breakdown
//     const statusBreakdown = {
//       Submitted: formattedExpenses.filter(b => b.status === "Submitted").length,
//       Pending: formattedExpenses.filter(b => b.status === "Pending").length,
//       Verified: formattedExpenses.filter(b => b.status === "Verified").length,
//       Approved: formattedExpenses.filter(b => b.status === "Approved").length,
//       Rejected: formattedExpenses.filter(b => b.status === "Rejected").length,
//       Paid: formattedExpenses.filter(b => b.status === "Paid").length
//     };

//     // Calculate expense type breakdown
//     const expenseTypeBreakdown = {};
//     formattedExpenses.forEach(bill => {
//       expenseTypeBreakdown[bill.expenseType] = (expenseTypeBreakdown[bill.expenseType] || 0) + 1;
//     });

//     // Calculate role breakdown
//     const roleBreakdown = {};
//     formattedExpenses.forEach(bill => {
//       const submitterRole = bill.submitterDetails?.role || bill.role;
//       roleBreakdown[submitterRole] = (roleBreakdown[submitterRole] || 0) + 1;
//     });

//     return res.status(200).json({
//       status: "Success",
//       message: "Bills fetched successfully for verification",
//       data: formattedExpenses,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / limit),
//         totalItems: totalCount,
//         itemsPerPage: limit
//       },
//       summary: {
//         totalBills: formattedExpenses.length,
//         totalAmount: totalAmount,
//         accessibleSchoolsCount: uniqueSchoolIds.length,
//         statusBreakdown: statusBreakdown,
//         expenseTypeBreakdown: expenseTypeBreakdown,
//         roleBreakdown: roleBreakdown,
//         allowedRoles: allowedRolesToVerify
//       },
//       verifierInfo: {
//         _id: userObjectId,
//         name: verifierUser.name,
//         role: verifierUser.role,
//         accessibleSchools: uniqueSchoolIds.length,
//         schoolDetails: Array.from(schoolMap.values())
//       }
//     });

//   } catch (error) {
//     console.error("Error in GetBillsForVerification:", error);
//     return res.status(500).json({
//       status: "Error",
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };











export const GetBillsForVerification = async (req, res) => {
  console.log("I am inside bills.controller.js, API: GetBillsForVerification");
  
  const { _id, startDate, endDate, status = "Pending", role = null, limit = 50, page = 1 } = req.body;
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  console.log("Page:", page);

  // Validation
  if (!_id) {
    return res.status(400).json({
      status: "Error",
      message: "User ID (_id) is required"
    });
  }

  try {
    // Convert string to ObjectId if needed
    const userObjectId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;

    // Get the verifier's details
    const verifierUser = await User.findById(userObjectId);
    
    if (!verifierUser) {
      return res.status(404).json({
        status: "Error",
        message: "Verifier user not found"
      });
    }

    // Determine which roles to filter (coming from frontend)
    let allowedRolesToVerify = [];
    
    if (role) {
      // If role is an array, use it directly
      if (Array.isArray(role)) {
        allowedRolesToVerify = role;
      } else {
        allowedRolesToVerify = [role];
      }
    } else {
      // If no role filter, only show same role bills
      allowedRolesToVerify = [verifierUser.role];
    }

    console.log("Verifier Role:", verifierUser.role);
    console.log("Allowed roles to verify (from frontend):", allowedRolesToVerify);

    // If no roles to verify, return empty
    if (allowedRolesToVerify.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No roles specified for verification",
        data: [],
        total: 0,
        summary: {
          totalBills: 0,
          totalAmount: 0,
          accessibleSchoolsCount: 0,
          allowedRoles: allowedRolesToVerify
        }
      });
    }

    // First, get the user's accessible schools from useraccesses
    const userAccess = await UserAccess.findOne({ unqObjectId: userObjectId });
    
    if (!userAccess) {
      return res.status(404).json({
        status: "Error",
        message: "User access not found"
      });
    }

    // Extract all schoolIds that the user has access to
    const accessibleSchoolIds = [];
    if (userAccess.region) {
      userAccess.region.forEach(region => {
        region.blockIds?.forEach(block => {
          block.schoolIds?.forEach(school => {
            if (school.schoolId) {
              accessibleSchoolIds.push(school.schoolId);
            }
          });
        });
      });
    }

    // Remove duplicate schoolIds
    const uniqueSchoolIds = [...new Set(accessibleSchoolIds)];

    if (uniqueSchoolIds.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No schools accessible for this user",
        data: [],
        total: 0,
        summary: {
          totalBills: 0,
          totalAmount: 0,
          accessibleSchoolsCount: 0,
          allowedRoles: allowedRolesToVerify
        }
      });
    }

    // Get all school details from district_block_schools
    const schoolDetails = await District_Block_School.find({
      schoolId: { $in: uniqueSchoolIds }
    });

    // Create a map for quick school lookup
    const schoolMap = new Map();
    schoolDetails.forEach(school => {
      schoolMap.set(school.schoolId, {
        districtId: school.districtId,
        districtName: school.districtName,
        blockId: school.blockId,
        blockName: school.blockName,
        schoolId: school.schoolId,
        schoolName: school.schoolName 
      });
    });

    // Get all users who have these schools in their access
    const usersWithAccess = await UserAccess.find({
      "region.blockIds.schoolIds.schoolId": { $in: uniqueSchoolIds }
    });

    // Get the actual user details for these accesses to filter by allowed roles
    const submitterUsers = await User.find({
      _id: { $in: usersWithAccess.map(ua => ua.unqObjectId) },
      role: { $in: allowedRolesToVerify }
    });

    const submitterUserIds = submitterUsers.map(user => user._id);

    if (submitterUserIds.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No submitters found for the allowed roles",
        data: [],
        total: 0,
        summary: {
          totalBills: 0,
          totalAmount: 0,
          accessibleSchoolsCount: uniqueSchoolIds.length,
          allowedRoles: allowedRolesToVerify
        }
      });
    }

    // Date range filter based on createdAt field
    let dateFilter = {};
    if (startDate && endDate) {
      // Create start date (beginning of day)
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      // Create end date (end of day)
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          $gte: startDateTime,
          $lte: endDateTime
        }
      };
      console.log("Date filter (createdAt based):", {
        startDate: startDateTime,
        endDate: endDateTime
      });
    } else if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      dateFilter = {
        createdAt: {
          $gte: startDateTime
        }
      };
    } else if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      dateFilter = {
        createdAt: {
          $lte: endDateTime
        }
      };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build status filter
    let statusFilter = {};
    if (status && status !== "All") {
      statusFilter = { status: status };
    }

    // Build the complete query
    const query = {
      unqUserObjectId: { $in: submitterUserIds },
      ...dateFilter,
      ...statusFilter
    };

    console.log("Complete MongoDB Query:", JSON.stringify(query, null, 2));

    // Get total count for pagination
    const totalCount = await Expense.countDocuments(query);

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 }) // Sort by createdAt instead of expenseDate
      .skip(skip)
      .limit(limit)
      .populate('unqUserObjectId', 'name userId email role contact1 contact2')
      .populate('verification.verifiedBy', 'name userId email role')
      .populate('approval.approvedBy', 'name userId email role');

    // Get submitter details map
    const submitterMap = new Map();
    submitterUsers.forEach(submitter => {
      submitterMap.set(submitter._id.toString(), submitter);
    });

    // Format response
    const formattedExpenses = expenses.map(expense => ({
      ...expense.toObject(),
      submitterDetails: submitterMap.get(expense.unqUserObjectId?.toString()) || null,
      formattedCreatedAt: expense.createdAt ? new Date(expense.createdAt).toLocaleString() : null
    }));

    // Calculate totals
    const totalAmount = formattedExpenses.reduce((sum, bill) => sum + (bill.expenseAmount || 0), 0);

    // Calculate status breakdown
    const statusBreakdown = {
      Submitted: formattedExpenses.filter(b => b.status === "Submitted").length,
      Pending: formattedExpenses.filter(b => b.status === "Pending").length,
      Verified: formattedExpenses.filter(b => b.status === "Verified").length,
      Approved: formattedExpenses.filter(b => b.status === "Approved").length,
      Rejected: formattedExpenses.filter(b => b.status === "Rejected").length,
      Paid: formattedExpenses.filter(b => b.status === "Paid").length
    };

    // Calculate expense type breakdown
    const expenseTypeBreakdown = {};
    formattedExpenses.forEach(bill => {
      expenseTypeBreakdown[bill.expenseType] = (expenseTypeBreakdown[bill.expenseType] || 0) + 1;
    });

    // Calculate role breakdown
    const roleBreakdown = {};
    formattedExpenses.forEach(bill => {
      const submitterRole = bill.submitterDetails?.role || bill.role;
      roleBreakdown[submitterRole] = (roleBreakdown[submitterRole] || 0) + 1;
    });

    // Calculate date-wise breakdown (based on createdAt)
    const dateWiseBreakdown = {};
    formattedExpenses.forEach(bill => {
      if (bill.createdAt) {
        const dateKey = new Date(bill.createdAt).toISOString().split('T')[0];
        if (!dateWiseBreakdown[dateKey]) {
          dateWiseBreakdown[dateKey] = {
            count: 0,
            amount: 0
          };
        }
        dateWiseBreakdown[dateKey].count++;
        dateWiseBreakdown[dateKey].amount += (bill.expenseAmount || 0);
      }
    });

    return res.status(200).json({
      status: "Success",
      message: "Bills fetched successfully for verification",
      data: formattedExpenses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      summary: {
        totalBills: formattedExpenses.length,
        totalAmount: totalAmount,
        accessibleSchoolsCount: uniqueSchoolIds.length,
        statusBreakdown: statusBreakdown,
        expenseTypeBreakdown: expenseTypeBreakdown,
        roleBreakdown: roleBreakdown,
        dateWiseBreakdown: dateWiseBreakdown,
        allowedRoles: allowedRolesToVerify,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      },
      verifierInfo: {
        _id: userObjectId,
        name: verifierUser.name,
        role: verifierUser.role,
        accessibleSchools: uniqueSchoolIds.length,
        schoolDetails: Array.from(schoolMap.values())
      }
    });

  } catch (error) {
    console.error("Error in GetBillsForVerification:", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message
    });
  }
};