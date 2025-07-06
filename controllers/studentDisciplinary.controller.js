//All the business logic, APIs and Rest APIs are in this script.

import mongoose from "mongoose";
import { StudentDisciplinary } from "../models/studentDisciplinary.model.js";


export const createDisciplinaryOrInteraction = async (req, res) => {

    console.log('I am inside the createDisciplinaryOrInteraction interaction')

    const { studentSrn,
    firstName,
    fatherName,
    classofStudent,
    districtId,
    blockId,
    schoolId,
    subject,
    status, // this holds the values like Disciplinary issue, Interaction
    remark,
    classWorkChecking,
    homeWorkChecking,

    comment,
    userId


} = req.body

console.log(req.body)
try {
    
    const studentDisciplinaryOrInteraction = await StudentDisciplinary.create(req.body)

    res.status(200).json({status: "success", data: studentDisciplinaryOrInteraction})


} catch (error) {
    console.log("Error Occured While Creating StudentDisciplinaryOrInteraction", error.message);
}




}



//API TO GET COPY AND HOMEWORK CHECKIG, DISCIPLINARY DATA.

// export const GetDisciplinaryDataByQueryParams = async (req, res) =>{

//    const {userId, createdAt, status, classWorkChecking, homeWorkChecking} = req.query
    
    
//     try {
        
//         const response = await StudentDisciplinary.find()

//     } catch (error) {
        
//     }
// }








// export const GetDisciplinaryDataByQueryParams = async (req, res) => {

//     console.log('i am inside GetDisciplinaryDataByQueryParams api')
//   const {
//     userId,
//     createdAt,
//     status,
//     classWorkChecking,
//     homeWorkChecking
//   } = req.query;

//   console.log(req.query)

//   try {
//     const query = {};

//     if (userId) query.userId = userId;
//     if (status) query.status = status;
//     if (classWorkChecking) query.classWorkChecking = classWorkChecking;
//     if (homeWorkChecking) query.homeWorkChecking = homeWorkChecking;

//     // Handle createdAt as full day filter (00:00:00 to 23:59:59)
//     if (createdAt) {
//       const startOfDay = new Date(createdAt);
//       const endOfDay = new Date(createdAt);
//       endOfDay.setHours(23, 59, 59, 999);

//       query.createdAt = {
//         $gte: startOfDay,
//         $lte: endOfDay
//       };
//     }

//     const records = await StudentDisciplinary.find(query).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       data: records,
//       message: "Filtered disciplinary records fetched successfully"
//     });
//   } catch (error) {
//     console.error("Error fetching disciplinary data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching disciplinary records",
//       error: error.message
//     });
//   }
// };

export const GetDisciplinaryDataByQueryParams = async (req, res) => {


  const { userId, createdAt } = req.query;


   console.log('i am inside GetDisciplinaryDataByQueryParams api')


console.log(req.query)

  if (!userId || !createdAt) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userId or createdAt",
    });
  }

  try {
    const records = await StudentDisciplinary.find({
      userId,
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          createdAt,
        ],
      },
    });

    console.log("Fetched records:", records.length);

    return res.status(200).json({
      success: true,
      data: records,
      message: "Filtered disciplinary records fetched successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
