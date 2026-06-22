import mongoose from "mongoose";
import { District_Block_School } from "../models/district_block_school.model.js";
import { SchoolDisciplinary } from "../models/schoolDisciplinary.model.js";
import { GamificationPointLogic, GamificationUserPoint } from "../models/gamification.model.js";
import { callingAbsentee } from "./Gamification.controller.js";
import { User, UserAccess } from "../models/user.model.js";
import { ClaimGamificationPoint } from "./Gamification.controller.js";


//creating gamification in db

// export const createSchoolDisciplinaryRecord = async (req, res) => {

//   console.log("I am in schoolDisciplinary.controller.js, api: createSchoolDisciplinaryRecord")

//     const {district_block_schoolsObjectId, dateOfRecord,
//         subject, batch, status, remark, unqUserObjectId
//     } = req.body;

//       console.log(req.body)
//     try {
//         const response = await SchoolDisciplinary.create({
//             district_block_schoolsObjectId:district_block_schoolsObjectId,
//             subject:subject,
//             batch:batch,
//             status: status,
//             remark: remark,
//             unqUserObjectId: unqUserObjectId
//         })

//         res.status(200).json({status:"Ok", data:response})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({status:"failed", error:error})
//     }
// }



export const createSchoolDisciplinaryRecord = async (req, res) => {
  console.log("I am in schoolDisciplinary.controller.js, api: createSchoolDisciplinaryRecord");

  const {
    district_block_schoolsObjectId,
    dateOfRecord,
    subject,
    batch,
    status,
    remark,
    unqUserObjectId
  } = req.body;

  console.log("Request Body:", req.body);

  try {
    // ✅ Step 1: Create the school disciplinary record
    const response = await SchoolDisciplinary.create({
      district_block_schoolsObjectId: district_block_schoolsObjectId,
      subject: subject,
      batch: batch,
      status: status,
      remark: remark,
      unqUserObjectId: unqUserObjectId,
      dateOfRecord: dateOfRecord || new Date()
    });

    console.log("✅ School disciplinary record created:", response._id);

    // ✅ Step 2: Get school details and CC users in one aggregation
    const result = await District_Block_School.aggregate([
      // Match the specific school
      {
        $match: {
          _id: new mongoose.Types.ObjectId(district_block_schoolsObjectId)
        }
      },
      // Lookup CC users who have this school
      {
        $lookup: {
          from: "users",
          let: { schoolId: "$schoolId" },
          pipeline: [
            {
              $match: {
                role: "CC",
                isActive: true
              }
            },
            {
              $lookup: {
                from: "useraccesses",
                localField: "_id",
                foreignField: "unqObjectId",
                as: "userAccess"
              }
            },
            {
              $unwind: "$userAccess"
            },
            {
              $unwind: "$userAccess.region"
            },
            {
              $unwind: "$userAccess.region.blockIds"
            },
            {
              $unwind: "$userAccess.region.blockIds.schoolIds"
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$userAccess.region.blockIds.schoolIds.schoolId",
                    "$$schoolId"
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$_id",
                userId: { $first: "$userId" },
                name: { $first: "$name" },
                email: { $first: "$email" },
                role: { $first: "$role" },
                batches: { $first: "$userAccess.batch" }
              }
            }
          ],
          as: "ccUsers"
        }
      }
    ]);

    if (!result || result.length === 0) {
      throw new Error("School not found");
    }

    const schoolData = result[0];
    const schoolId = schoolData.schoolId;
    const ccUsers = schoolData.ccUsers || [];

    console.log(`📍 School ID: ${schoolId}`);
    console.log(`✅ Found ${ccUsers.length} CC users`);

    // ✅ Step 3: Trigger gamification for each CC user
    const gamificationResults = [];

    for (const ccUser of ccUsers) {
      try {
        const userBatches = ccUser.batches || [];
        const batchesToProcess = batch ? [batch] : userBatches;

        for (const userBatch of batchesToProcess) {
          if (!userBatch) continue;

          const gamificationPayload = {
            pointType: "disciplinary",
            date: new Date().toISOString().split("T")[0],
            batch: userBatch,
            schoolId: schoolId,
            district_block_schoolsObjectId: district_block_schoolsObjectId,
            unqObjectId: ccUser._id,

          };


          console.log(`🔄 Gamification for CC: ${ccUser.name}, Batch: ${userBatch}`);
          console.log(gamificationPayload)


          
          const gamificationResponse = await ClaimGamificationPoint(gamificationPayload);
          
          gamificationResults.push({
            userId: ccUser._id,
            name: ccUser.name,
            batch: userBatch,
            status: "success"
          });
        }
      } catch (error) {
        console.error(`❌ Gamification failed for ${ccUser.name}:`, error);
        gamificationResults.push({
          userId: ccUser._id,
          name: ccUser.name,
          batch: batch,
          status: "failed",
          error: error.message
        });
      }
    }

    // ✅ Step 4: Return response
    res.status(200).json({
      status: "Ok",
      data: response,
      schoolId: schoolId,
      ccUsersFound: ccUsers.length,
      gamificationResults: gamificationResults,
      gamificationTriggered: gamificationResults.some(r => r.status === "success"),
      message: `Record created. Gamification triggered for ${gamificationResults.filter(r => r.status === "success").length} CC users.`
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      status: "failed",
      error: error.message || error,
      message: "Failed to create school disciplinary record"
    });
  }
};


// export const GetSchoolDisciplinaryData = async (req, res) => {

// const {date, unqUserObjectId} = req.body;

// let pipeline;
    
// let startDate = new Date(date);

// startDate.setUTCHours(0, 0, 0, 0);

// let endDate = new Date(date);
// endDate.setUTCHours(23, 59, 59, 999);

// console.log(req.body)
// console.log(startDate, endDate)

//  pipeline = [
//   {
//     $match: {
//       isCenterClosed: false
//     }
//   },

//   {
//     $lookup: {
//       from: "schooldisciplinaries",

//       let: {
//         schoolObjectId: "$_id"
//       },

//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 {
//                   $eq: [
//                     "$district_block_schoolsObjectId",
//                     "$$schoolObjectId"
//                   ]
//                 },

//                 {
//                   $gte: [
//                     "$dateOfRecord",
//                     startDate
//                   ]
//                 },

//                 {
//                   $lte: [
//                     "$dateOfRecord",
//                     endDate
//                   ]
//                 }
//               ]
//             }
//           }
//         }
//       ],

//       as: "schoolDisciplinaryData"
//     }
//   }
// ];

//     try {

//         const response = await District_Block_School.aggregate(pipeline)

//         res.status(200).json({status:"Ok", data: response})
        
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({status:"Failed", error: error})
//     }
// }




export const GetSchoolDisciplinaryData = async (req, res) => {
  const { date, unqUserObjectId } = req.body;

  let startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0);

  let endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999);

  console.log(req.body);
  console.log(startDate, endDate);

  const disciplinaryMatchConditions = [
    {
      $eq: [
        "$district_block_schoolsObjectId",
        "$$schoolObjectId",
      ],
    },
    {
      $gte: [
        "$dateOfRecord",
        startDate,
      ],
    },
    {
      $lte: [
        "$dateOfRecord",
        endDate,
      ],
    },
  ];

  // Apply user filter only if value is provided
  if (unqUserObjectId) {
    disciplinaryMatchConditions.push({
      $eq: [
        "$unqUserObjectId",
        new mongoose.Types.ObjectId(unqUserObjectId),
      ],
    });
  }

  const pipeline = [
    {
      $match: {
        isCenterClosed: false,
      },
    },
    {
      $lookup: {
        from: "schooldisciplinaries",

        let: {
          schoolObjectId: "$_id",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: disciplinaryMatchConditions,
              },
            },
          },
        ],

        as: "schoolDisciplinaryData",
      },
    },
  ];

  try {
    const response = await District_Block_School.aggregate(pipeline);

    res.status(200).json({
      status: "Ok",
      data: response,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "Failed",
      error,
    });
  }
};