//All the business logic, APIs and Rest APIs are in this script.

import mongoose from "mongoose";
import { StudentDisciplinary } from "../models/studentDisciplinary.model.js";
import {Student}  from "../models/Student.model.js";
import { District_Block_School } from "../models/district_block_buniyaadCenters.model.js";

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





// export const GetDisciplinaryDataByQueryParams = async (req, res) => {


//   const { userId, districtId, schoolId, status, createdAt } = req.query;


//    console.log('i am inside GetDisciplinaryDataByQueryParams api')


// console.log(req.query)

//   if ( !createdAt) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required fields: userId or createdAt",
//     });
//   }

//   try {
//     const records = await StudentDisciplinary.find({
//       schoolId,
//       status: status || "Copy Checking",
//       $expr: {
//         $eq: [
//           { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           createdAt,
//         ],
//       },
//     });

//     console.log("Fetched records:", records.length);

//     return res.status(200).json({
//       success: true,
//       data: records,
//       message: "Filtered disciplinary records fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };


















// //
// export const GetDisciplinaryDataByQueryParams = async (req, res) => {

//   const { userId, districtId, schoolId, status, createdAt } = req.query;

//   console.log('i am inside GetDisciplinaryDataByQueryParams api');

//   console.log(req.query);

//   if (!createdAt) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required fields: userId or createdAt",
//     });
//   }

//   try {
//     // Ensure districtId and schoolId are treated as arrays
//     const districtFilter = districtId
//       ? Array.isArray(districtId)
//         ? districtId
//         : [districtId]
//       : [];

//     const schoolFilter = schoolId
//       ? Array.isArray(schoolId)
//         ? schoolId
//         : [schoolId]
//       : [];

//     const filterQuery = {
//       ...(schoolFilter.length && { schoolId: { $in: schoolFilter } }),
//       ...(districtFilter.length && { districtId: { $in: districtFilter } }),
//       status: status || "Copy Checking",
//       $expr: {
//         $eq: [
//           { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           createdAt,
//         ],
//       },
//     };

//     const records = await StudentDisciplinary.find(filterQuery);

//     console.log("Fetched records:", records.length);

//     return res.status(200).json({
//       success: true,
//       data: records,
//       message: "Filtered disciplinary records fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };




























// export const GetDisciplinaryDataByQueryParams = async (req, res) => {

//   const { userId, districtId, schoolId, status, createdAt } = req.query;

//   console.log('i am inside GetDisciplinaryDataByQueryParams api');

//   console.log(req.query);

//   if (!createdAt) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required fields: userId or createdAt",
//     });
//   }

//   try {
//     // Ensure districtId and schoolId are treated as arrays
//     const districtFilter = districtId
//       ? Array.isArray(districtId)
//         ? districtId
//         : [districtId]
//       : [];

//     const schoolFilter = schoolId
//       ? Array.isArray(schoolId)
//         ? schoolId
//         : [schoolId]
//       : [];

//     const matchQuery = {
//       ...(schoolFilter.length && { schoolId: { $in: schoolFilter } }),
//       ...(districtFilter.length && { districtId: { $in: districtFilter } }),
//       status: status || "Copy Checking",
//       $expr: {
//         $eq: [
//           { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           createdAt,
//         ],
//       },
//     };

//     const records = await StudentDisciplinary.aggregate([
//       { $match: matchQuery },
//       {
//         $group: {
//           _id: "$studentSrn",
//           studentSrn: { $first: "$studentSrn" },
//           firstName: { $first: "$firstName" },
//           fatherName: { $first: "$fatherName" },
//           classofStudent: { $first: "$classofStudent" },
//           districtId: { $first: "$districtId" },
//           blockId: { $first: "$blockId" },
//           schoolId: { $first: "$schoolId" },
//           userId: { $first: "$userId" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           subjects:
//             status === "Disciplinary"
//               ? { $push: "$remark" }
//               : {
//                   $push: {
//                     subject: "$subject",
//                     classWorkChecking: "$classWorkChecking",
//                     homeWorkChecking: "$homeWorkChecking",
//                   },
//                 },
//         },
//       },
//     ]);

//     console.log("Fetched records:", records.length);

//     return res.status(200).json({
//       success: true,
//       data: records,
//       message: "Filtered disciplinary records fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };









//It fetches the data student wise.

export const GetDisciplinaryDataByQueryParams = async (req, res) => {

  const { userId, districtId, schoolId, status, createdAt } = req.query;

  console.log('i am inside GetDisciplinaryDataByQueryParams api');

  console.log(req.query);

  if (!createdAt) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userId or createdAt",
    });
  }

  try {
    // Ensure districtId and schoolId are treated as arrays
    const districtFilter = districtId
      ? Array.isArray(districtId)
        ? districtId
        : [districtId]
      : [];

    const schoolFilter = schoolId
      ? Array.isArray(schoolId)
        ? schoolId
        : schoolId.split(",")
      : [];

      console.log(schoolFilter)

    const matchQuery = {
      ...(schoolFilter.length && { schoolId: { $in: schoolFilter } }),
      ...(districtFilter.length && { districtId: { $in: districtFilter } }),
      status: status || "Copy Checking",
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          createdAt,
        ],
      },
    };

    let records;

    if (status === "Disciplinary") {
      records = await StudentDisciplinary.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$studentSrn",
            studentSrn: { $first: "$studentSrn" },
            firstName: { $first: "$firstName" },
            fatherName: { $first: "$fatherName" },
            classofStudent: { $first: "$classofStudent" },
            districtId: { $first: "$districtId" },
            blockId: { $first: "$blockId" },
            schoolId: { $first: "$schoolId" },
            userId: { $first: "$userId" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            remarks: { $push: "$remark" },
          },
        },
      ]);
    } else {
      // Step 1: Group by student + subject to merge class/home work
      const groupedSubjects = await StudentDisciplinary.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              studentSrn: "$studentSrn",
              subject: "$subject",
            },
            subject: { $first: "$subject" },
            studentSrn: { $first: "$studentSrn" },
            firstName: { $first: "$firstName" },
            fatherName: { $first: "$fatherName" },
            classofStudent: { $first: "$classofStudent" },
            districtId: { $first: "$districtId" },
            blockId: { $first: "$blockId" },
            schoolId: { $first: "$schoolId" },
            userId: { $first: "$userId" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            classWorkChecking: {
              $max: {
                $cond: [
                  { $ne: ["$classWorkChecking", "NA"] },
                  "$classWorkChecking",
                  null,
                ],
              },
            },
            homeWorkChecking: {
              $max: {
                $cond: [
                  { $ne: ["$homeWorkChecking", "NA"] },
                  "$homeWorkChecking",
                  null,
                ],
              },
            },
          },
        },
        // Step 2: Group by studentSrn and push all subjects
        {
          $group: {
            _id: "$studentSrn",
            studentSrn: { $first: "$studentSrn" },
            firstName: { $first: "$firstName" },
            fatherName: { $first: "$fatherName" },
            classofStudent: { $first: "$classofStudent" },
            districtId: { $first: "$districtId" },
            blockId: { $first: "$blockId" },
            schoolId: { $first: "$schoolId" },
            userId: { $first: "$userId" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            subjects: {
              $push: {
                subject: "$subject",
                classWorkChecking: "$classWorkChecking",
                homeWorkChecking: "$homeWorkChecking",
              },
            },
          },
        },
      ]);

      records = groupedSubjects;
    }

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
//-------------------------------------------------------------------------












// export const GetStudentCopyCheckingDashboard = async (req, res) => {
//   try {
//     const { date } = req.query;

//     if (!date) {
//       return res.status(400).json({ error: 'Date is required in query (YYYY-MM-DD)' });
//     }

//     const matchDate = new Date(date);
//     matchDate.setHours(0, 0, 0, 0);

//     const endDate = new Date(matchDate);
//     endDate.setDate(endDate.getDate() + 1);

//     // STEP 1: Aggregate total students per district, center, and class
//     const studentAggregation = await Student.aggregate([
//       {
//         $match: {
//           classofStudent: { $in: ['9', '10'] },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             districtId: '$districtId',
//             schoolId: '$schoolId',
//             classofStudent: '$classofStudent',
//           },
//           totalStudents: { $sum: 1 },
//         },
//       },
//     ]);

//     // STEP 2: Aggregate copy checking counts from disciplinary collection
//     const copyCheckingAggregation = await StudentDisciplinary.aggregate([
//       {
//         $match: {
//           classofStudent: { $in: ['9', '10'] },
//           status: 'Copy Checking',
//           createdAt: {
//             $gte: matchDate,
//             $lt: endDate,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             districtId: '$districtId',
//             schoolId: '$schoolId',
//             classofStudent: '$classofStudent',
//           },
//           copyCheckingCount: { $sum: 1 },
//         },
//       },
//     ]);

//     // STEP 3: Combine both aggregations into a single map
//     const combinedMap = new Map();

//     studentAggregation.forEach(item => {
//       const key = `${item._id.districtId}_${item._id.schoolId}_${item._id.classofStudent}`;
//       combinedMap.set(key, {
//         districtId: item._id.districtId,
//         schoolId: item._id.schoolId,
//         classofStudent: item._id.classofStudent,
//         totalStudents: item.totalStudents,
//         copyCheckingCount: 0,
//       });
//     });

//     copyCheckingAggregation.forEach(item => {
//       const key = `${item._id.districtId}_${item._id.schoolId}_${item._id.classofStudent}`;
//       if (combinedMap.has(key)) {
//         combinedMap.get(key).copyCheckingCount = item.copyCheckingCount;
//       } else {
//         combinedMap.set(key, {
//           districtId: item._id.districtId,
//           schoolId: item._id.schoolId,
//           classofStudent: item._id.classofStudent,
//           totalStudents: 0,
//           copyCheckingCount: item.copyCheckingCount,
//         });
//       }
//     });

//     // STEP 4: Populate names from District_Block_School
//     const finalData = await Promise.all(
//       Array.from(combinedMap.values()).map(async item => {
//         const schoolDoc = await District_Block_School.findOne({
//           districtId: item.districtId,
//           centerId: item.schoolId,
//         });

//         return {
//           districtName: schoolDoc?.districtName || 'Unknown District',
//           centerName: schoolDoc?.centerName || 'Unknown Center',
//           classofStudent: item.classofStudent,
//           totalStudents: item.totalStudents,
//           copyCheckingCount: item.copyCheckingCount,
//         };
//       })
//     );

//     res.status(200).json(finalData);
//   } catch (error) {
//     console.error('Dashboard Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


















// export const GetStudentCopyCheckingDashboard = async (req, res) => {
//   console.log('I am inside get student copy checking dashboard')
//   try {
//     const { createdAt } = req.query;
//     console.log(req.query)

//     if (!createdAt) {
//       return res.status(400).json({ error: 'Date is required in query (YYYY-MM-DD)' });
//     }
//     console.log('I am ahead')

//     const matchDate = new Date(createdAt);
//     matchDate.setHours(0, 0, 0, 0);

//     const endDate = new Date(matchDate);
//     endDate.setDate(endDate.getDate() + 1);

//     // STEP 1: Aggregate total students per center and class
//     const studentAggregation = await Student.aggregate([
//       {
//         $match: {
//           classofStudent: { $in: ['9', '10'] },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             schoolId: '$schoolId',
//             classofStudent: '$classofStudent',
//           },
//           totalStudents: { $sum: 1 },
//         },
//       },
//     ]);

//     // STEP 2: Aggregate copy checking counts from disciplinary collection
//     const copyCheckingAggregation = await StudentDisciplinary.aggregate([
//       {
//         $match: {
//           classofStudent: { $in: ['9', '10'] },
//           status: 'Copy Checking',
//           createdAt: {
//             $gte: matchDate,
//             $lt: endDate,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             schoolId: '$schoolId',
//             classofStudent: '$classofStudent',
//           },
//           copyCheckingCount: { $sum: 1 },
//         },
//       },
//     ]);

//     // STEP 3: Combine both aggregations into a single map
//     const combinedMap = new Map();

//     studentAggregation.forEach(item => {
//       const key = `${item._id.schoolId}_${item._id.classofStudent}`;
//       combinedMap.set(key, {
//         schoolId: item._id.schoolId,
//         classofStudent: item._id.classofStudent,
//         totalStudents: item.totalStudents,
//         copyCheckingCount: 0,
//       });
//     });

//     copyCheckingAggregation.forEach(item => {
//       const key = `${item._id.schoolId}_${item._id.classofStudent}`;
//       if (combinedMap.has(key)) {
//         combinedMap.get(key).copyCheckingCount = item.copyCheckingCount;
//       } else {
//         combinedMap.set(key, {
//           schoolId: item._id.schoolId,
//           classofStudent: item._id.classofStudent,
//           totalStudents: 0,
//           copyCheckingCount: item.copyCheckingCount,
//         });
//       }
//     });

//     // STEP 4: Populate names from District_Block_School using centerId only
//     const finalData = await Promise.all(
//       Array.from(combinedMap.values()).map(async item => {
//         const schoolDoc = await District_Block_School.findOne({
//           centerId: item.schoolId,
//         });

//         if (!schoolDoc) {
//           console.log('❌ Not Matched:', {
//             centerId: item.schoolId,
//             classofStudent: item.classofStudent,
//           });
//         }

//         return {
//           districtName: schoolDoc?.districtName || 'Unknown District',
//           centerName: schoolDoc?.centerName || 'Unknown Center',
//           classofStudent: item.classofStudent,
//           totalStudents: item.totalStudents,
//           copyCheckingCount: item.copyCheckingCount,
//         };
//       })
//     );

//     console.log(finalData)
//     res.status(200).json({status:"Oka", data: finalData});
//   } catch (error) {
//     console.error('Dashboard Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };








export const GetStudentCopyCheckingDashboard = async (req, res) => {
  console.log('I am inside get student copy checking dashboard')
  try {
    const { createdAt } = req.query;
    console.log(req.query)

    if (!createdAt) {
      return res.status(400).json({ error: 'Date is required in query (YYYY-MM-DD)' });
    }
    console.log('I am ahead')

    const matchDate = new Date(createdAt);
    matchDate.setHours(0, 0, 0, 0);

    const endDate = new Date(matchDate);
    endDate.setDate(endDate.getDate() + 1);

    // STEP 1: Aggregate total students per center and class
    const studentAggregation = await Student.aggregate([
      {
        $match: {
          classofStudent: { $in: ['9', '10'] },
        },
      },
      {
        $group: {
          _id: {
            schoolId: '$schoolId',
            classofStudent: '$classofStudent',
          },
          totalStudents: { $sum: 1 },
        },
      },
    ]);

    // STEP 2: Aggregate copy checking counts from disciplinary collection
    const copyCheckingAggregation = await StudentDisciplinary.aggregate([
      {
        $match: {
          classofStudent: { $in: ['9', '10'] },
          status: 'Copy Checking',
          createdAt: {
            $gte: matchDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            schoolId: '$schoolId',
            classofStudent: '$classofStudent',
            studentSrn: '$studentSrn',
          },
        },
      },
      {
        $group: {
          _id: {
            schoolId: '$_id.schoolId',
            classofStudent: '$_id.classofStudent',
          },
          copyCheckingCount: { $sum: 1 },
        },
      },
    ]);

    // STEP 3: Combine both aggregations into a single map
    const combinedMap = new Map();

    studentAggregation.forEach(item => {
      const key = `${item._id.schoolId}_${item._id.classofStudent}`;
      combinedMap.set(key, {
        schoolId: item._id.schoolId,
        classofStudent: item._id.classofStudent,
        totalStudents: item.totalStudents,
        copyCheckingCount: 0,
      });
    });

    copyCheckingAggregation.forEach(item => {
      const key = `${item._id.schoolId}_${item._id.classofStudent}`;
      if (combinedMap.has(key)) {
        combinedMap.get(key).copyCheckingCount = item.copyCheckingCount;
      } else {
        combinedMap.set(key, {
          schoolId: item._id.schoolId,
          classofStudent: item._id.classofStudent,
          totalStudents: 0,
          copyCheckingCount: item.copyCheckingCount,
        });
      }
    });

    // STEP 4: Populate names from District_Block_School using centerId only
    const finalData = await Promise.all(
      Array.from(combinedMap.values()).map(async item => {
        const schoolDoc = await District_Block_School.findOne({
          centerId: item.schoolId,
        });

        if (!schoolDoc) {
          console.log('❌ Not Matched:', {
            centerId: item.schoolId,
            classofStudent: item.classofStudent,
          });
        }

        return {
          districtName: schoolDoc?.districtName || 'Unknown District',
          centerName: schoolDoc?.centerName || 'Unknown Center',
          classofStudent: item.classofStudent,
          totalStudents: item.totalStudents,
          copyCheckingCount: item.copyCheckingCount,
        };
      })
    );

    console.log(finalData)
    res.status(200).json({status:"Oka", data: finalData});
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
