import mongoose from "mongoose";
import { District_Block_School } from "../models/district_block_school.model.js";
import { SchoolDisciplinary } from "../models/schoolDisciplinary.model.js";
import { GamificationPointLogic, GamificationUserPoint } from "../models/gamification.model.js";
import { callingAbsentee } from "./Gamification.controller.js";




//creating gamification in db

export const createSchoolDisciplinaryRecord = async (req, res) => {

  console.log("I am in schoolDisciplinary.controller.js, api: createSchoolDisciplinaryRecord")

    const {district_block_schoolsObjectId, dateOfRecord,
        subject, batch, status, remark, unqUserObjectId
    } = req.body;

      console.log(req.body)
    try {
        const response = await SchoolDisciplinary.create({
            district_block_schoolsObjectId:district_block_schoolsObjectId,
            subject:subject,
            batch:batch,
            status: status,
            remark: remark,
            unqUserObjectId: unqUserObjectId
        })

        res.status(200).json({status:"Ok", data:response})
    } catch (error) {
        console.log(error)
        res.status(500).json({status:"failed", error:error})
    }
}





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