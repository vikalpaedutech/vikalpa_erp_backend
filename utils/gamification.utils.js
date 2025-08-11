// import { Gamification } from "../models/gamification.model.js";

// // Helper to calculate points based on your logic
// export const awardPoints = async ({
//   userId,
//   pointType,
//   classofStudent = null,
//   timeStamp = new Date(),
//   extraData = {}, // For loginTime, studentCount, etc.
// }) => {
//   try {
//     let points = 0;

//     switch (pointType) {
//       case "self-attendance": {
//         const loginHour = new Date(extraData.loginTime).getHours();
//         const loginMinutes = new Date(extraData.loginTime).getMinutes();
//         const totalMinutes = loginHour * 60 + loginMinutes;

//         if (totalMinutes <= 450) points = 10; // <= 7:30
//         else if (totalMinutes <= 465) points = 5; // 7:31 - 7:45
//         else if (totalMinutes <= 480) points = 2; // 7:46 - 8:00
//         else if (totalMinutes <= 495) points = -5; // 8:01 - 8:15
//         else points = -10;
//         break;
//       }

//       case "student-attendance": {
//         const studentCount = extraData.studentCount;
//         const markedTime = new Date(extraData.markedTime);
//         const cutoff = new Date(markedTime);
//         cutoff.setHours(14, 40, 0, 0);

//         if (markedTime > cutoff) {
//           points = -15;
//         } else if (studentCount <= 9) points = 3;
//         else if (studentCount <= 14) points = 5;
//         else if (studentCount <= 29) points = 7;
//         else if (studentCount <= 39) points = 8;
//         else if (studentCount <= 49) points = 10;
//         else if (studentCount <= 79) points = 12;
//         else points = 15;
//         break;
//       }

//       case "pdf-upload": {
//         const uploadedTime = new Date(extraData.uploadedTime);
//         const cutoff = new Date(uploadedTime);
//         cutoff.setHours(14, 40, 0, 0);
//         points = uploadedTime <= cutoff ? 5 : -5;
//         break;
//       }

//       case "absentee-calling":
//       case "marks-upload": {
//         const studentCount = extraData.studentCount;
//         if (studentCount <= 9) points = 3;
//         else if (studentCount <= 14) points = 5;
//         else if (studentCount <= 29) points = 7;
//         else if (studentCount <= 39) points = 8;
//         else if (studentCount <= 49) points = 10;
//         else if (studentCount <= 79) points = 12;
//         else points = 15;
//         break;
//       }

//       default:
//         break;
//     }

//     const gamificationRecord = new Gamification({
//       userId,
//       pointType,
//       classofStudent,
//       point: points,
//       dateOfPoint: timeStamp,
//     });

//     await gamificationRecord.save();
//     console.log(`✅ Awarded ${points} points to ${userId} for ${pointType}`);
//   } catch (error) {
//     console.error("❌ Error awarding points:", error.message);
//   }
// };


import { Gamification } from "../models/gamification.model.js";

import { Student } from "../models/student.model.js";

import { StudentAttendance } from "../models/studentAttendance.model.js";

import { District_Block_School } from "../models/district_block_buniyaadCenters.model.js";

import { Marks } from "../models/marks.model.js";  // Import the Marks model


import { AttendancePdf } from "../models/UploadAttendancePdf.model.js";


export const awardPoints = async ({
  keyValue, loginTime, userId, attendance //here keyVlue are the values like: ‘self-attendance’, ‘student-attendance’, ‘makrs-upload’, ‘pdf-upload’, ‘disciplinary’, ‘student-slc-release’
  , studentAttendanceGamificationDate, schoolId, classofStudent, examId,

  dateOfUpload //for pdf upload
})=>{

console.log('i am inside awardpoints')

console.log(keyValue)

console.log(userId)

console.log(typeof(loginTime))



  try {
    
    //Below block will be handling points giving for 'self-attendance'

  
    
    if (keyValue === "self-attendance"){


// const formattedDate = new Date(Number(loginTime)).toISOString();
 
// const formattedDateLocalTime = new Date(Number(loginTime)).toLocaleString();



// const formattedLocaleTime = new Date(Number(loginTime)).toLocaleTimeString();

// // const formattedLocaleTime = "7:31:00 am"

// console.log("Formatted ISO Date:", formattedDate);
// console.log("Formatted std Date:", formattedDateLocalTime);
// console.log("Formatted locale tinme", formattedLocaleTime);


//      let point;

//      if (formattedLocaleTime > "8:15:00 am") {
//         point = -10;
//       } else if (formattedLocaleTime >= "8:01:00 am") {
//         point = -5;
//       } else if (formattedLocaleTime >= "7:46:00 am") {
//         point = 2;
//       } else if (formattedLocaleTime >= "7:31:00 am") {
//         point = 5;
//       } else if (formattedLocaleTime >= "7:30:00 am") {
//         point = 10;
//       } else {
//         point = -10
//       }

//       console.log('Hello award points')



//       const payload = {

//         userId: userId,
//         pointType: keyValue,
//         id: userId,
//         classofStudent: 'NA',
//         point: point,
//         dateOfPoint:formattedDate

//       }

//       console.log(payload)

     


//   const gamification = new Gamification(payload);
  
//   const savedGamification = await gamification.save();


//   // res.status(200).json({ status: "Success", data: Gamification });













const formattedDate = new Date(Number(loginTime)).toISOString();
 
const formattedDateLocalTime = new Date(Number(loginTime)).toLocaleString();



const formattedLocaleTime = new Date(Number(loginTime)).toLocaleTimeString();

// const formattedLocaleTime = "7:31:00 am"

console.log("Formatted ISO Date:", formattedDate);
console.log("Formatted std Date:", formattedDateLocalTime);
console.log("Formatted locale tinme", formattedLocaleTime);


     let point;

     // ✅ safer numeric time comparison
     const attendanceTotalSeconds = new Date(Number(loginTime)).getHours() * 3600 + 
                                    new Date(Number(loginTime)).getMinutes() * 60 + 
                                    new Date(Number(loginTime)).getSeconds();
     const cutoff815 = 8 * 3600 + 15 * 60;
     const cutoff801 = 8 * 3600 + 1 * 60;
     const cutoff746 = 7 * 3600 + 46 * 60;
     const cutoff731 = 7 * 3600 + 31 * 60;
     const cutoff730 = 7 * 3600 + 30 * 60;

     if (attendanceTotalSeconds > cutoff815) {
        point = -10;
      } else if (attendanceTotalSeconds >= cutoff801) {
        point = -5;
      } else if (attendanceTotalSeconds >= cutoff746) {
        point = 2;
      } else if (attendanceTotalSeconds >= cutoff731) {
        point = 5;
      } else if (attendanceTotalSeconds >= cutoff730) {
        point = 10;
      } else {
        point = -10
      }

      console.log('Hello award points')



      const payload = {

        userId: userId,
        pointType: keyValue,
        id: userId,
        classofStudent: 'NA',
        point: point,
        dateOfPoint:formattedDate

      }

      console.log(payload)

     


  const gamification = new Gamification(payload);
  
  const savedGamification = await gamification.save();


  // res.status(200).json({ status: "Success", data: Gamification });




  }
  
  //Handling keyVavlue === "student-attendance"
  else if (keyValue === "student-attendance"){

    console.log("Hellow student-attendance");
    console.log(userId);
    console.log(studentAttendanceGamificationDate);
    console.log(schoolId);
    console.log(classofStudent);
    console.log("Hellow student-attendance");

   const formattedLocaleTime = new Date(studentAttendanceGamificationDate).toLocaleTimeString();

  // const formattedLocaleTime = "07:51:02 am"

  console.log(formattedLocaleTime);

    //using schoolId and classOfStudent, finding the total present student count.
    //If count is in some certain range, then updating award pionts.
    //First time award point collection will be created, then each time on same date for same class,
    //... patching the same document until the date changes.

    //Logic and aggregation.
    const dateOnly = new Date(studentAttendanceGamificationDate);
     dateOnly.setUTCHours(0, 0, 0, 0); // normalize date

     const nextDate = new Date(dateOnly);

     nextDate.setUTCDate(dateOnly.getUTCDate() + 1);

     const attendanceData = await StudentAttendance.aggregate([
      {
        $match: {
          date: {$gte: dateOnly, $lt: nextDate}
        }
      },

      {
        $lookup: {
            from: "students",
            localField: "studentSrn",
            foreignField: "studentSrn",
            as: "student",
        }
      },
      {
        $unwind: "$student"
      },
      {
        $match:{
          "student.schoolId": schoolId,
          "student.classofStudent": classofStudent
        }
      },
      {
        $group: {
          _id:{
            schoolId: "$student.schoolId",
            classofStudent: "$student.classofStudent",
            districtId: "$student.districtId",
            // blockId: "$student.blockId",
          },
          presentCount: {
            $sum: {$cond: [{$eq: ["$status", "Present"]}, 1,0]}
          },
          absentCount: {
            $sum: {$cond: [{$eq: ["$status", "Absent"]},1, 0]}
          }
        }
      },
      {
        $lookup: {
          from: "district_block_schools",
          let: {
            districtId: {$toString: "$_id.districtId"},
            // blockId: {$toString: "$_id.blockId"},
            centerId: {$toString: "$_id.schoolId"}
          },
          pipeline: [
            {
              $match:{
                $expr:{
                  $and: [
                    {$eq: ["$districtId", "$$districtId"]},
                    // {$eq: ["$blockId", "$$blockId"]},
                    {$eq: ["$centerId", "$$centerId"]}
                  ]
                }
              }
            }
          ],
          as: "locationInfo"
        }
      },
      {
        $unwind: {
          path: "$locationInfo",
          preserveNullAndEmptyArrays:true
        }
      },
      {
        $project:{
          _id: 0,
          schoolId: "$_id.schoolId",
          classofStudent: "$_id.classofStudent",
          districtId: "$_id.districtId",
          // blockId: "$_id.blockId",
          presentCount: 1,
          absentCount: 1,
          districtName: "$locationInfo.districtName",
          blockName: "$locationInfo.blockName",
          schoolName: "$locationInfo.centerName"
        }
      }
     ])

     console.log("Attendance Data Summary:");
      console.log(attendanceData);

      // Now you can decide how to award points based on present/absent counts
      // Example: Assign points if attendance is above a threshold
      

      //For finding existing gamification document

      const present = attendanceData[0]?.presentCount || 0;
      const absent = attendanceData[0]?.absentCount || 0;

      let point = 0;

      // ✅ safer numeric time comparison
      const timeObj = new Date(studentAttendanceGamificationDate);
      const totalSeconds = timeObj.getHours() * 3600 + timeObj.getMinutes() * 60 + timeObj.getSeconds();
      const cutoffSeconds = 14 * 3600 + 40 * 60; // 2:40 PM

      if(totalSeconds <= cutoffSeconds){

        if (present >= 80) {
          point = 15;
        } else if (present >= 50) {
          point = 12;
        } else if (present >= 40) {
          point = 10;
        } else if (present >= 30) {
          point = 8;
        } else if (present >= 15) {
          point = 7;
        } else if (present >= 10) {
          point = 5;
        } else if (present >= 9) {
          point = 3;
        }

      } else{
        point = -15
      }
      
//-------------------------------------------------------------------------------
      // Step 1: Normalize the date (remove time part)
const inputDate = new Date(studentAttendanceGamificationDate); // assuming this is passed to your function
const startOfDay = new Date(inputDate); 
startOfDay.setUTCHours(0, 0, 0, 0);
const endOfDay = new Date(inputDate);
endOfDay.setUTCHours(24, 0, 0, 0);

// Step 2: Search for existing document
const existingGamification = await Gamification.findOne({
  pointType: 'student-attendance',
  userId: userId,
  id: schoolId,
  classofStudent: classofStudent,
  dateOfPoint: { $gte: startOfDay, $lt: endOfDay }
});

// Step 3: If exists, update it, else create new
if (existingGamification) {
  // PATCH: Update existing document
  existingGamification.point = point; // new point value from your logic
  existingGamification.updatedAt = new Date();
  await existingGamification.save();
  console.log("Updated existing gamification entry.");
} else {
  // CREATE new
  const gamificationPayload = {
    userId: userId,
    pointType: 'student-attendance',
    id: schoolId,
    classofStudent: classofStudent,
    point: point,
    dateOfPoint: new Date(studentAttendanceGamificationDate)
  };

  const newGamification = new Gamification(gamificationPayload);
  await newGamification.save();
  console.log("Created new gamification entry.");
}

//--------------------------------------------------------------------------------------------
      //  const gamificationPayload = {
      //   userId: userId,
      //   pointType: keyValue,
      //   classofStudent: classofStudent,
      //   point: point,
      //   dateOfPoint: new Date(studentAttendanceGamificationDate)
      // };

      // const gamification = new Gamification(gamificationPayload);
      // await gamification.save();

  }

   else if (keyValue === "makrs-upload"){

  //   console.log("hellow award points")

  //   console.log(keyValue, 
  //     userId, 
  //     examId,
  //      schoolId, 
  //      classofStudent)

  //   console.log("hellow award points")











  // console.log("hellow award points");

  // console.log(keyValue, userId, examId, schoolId, classofStudent);
  // console.log("hellow award points");

  // const now = new Date();
  // const formattedLocaleTime = now.toLocaleTimeString();
  // console.log("Upload Time:", formattedLocaleTime);

  // // Step 1: Count students with marks uploaded
  // const marksUploadedCount = await Marks.countDocuments({
  //   examId: examId,
  //   schoolId: schoolId,
  //   classofStudent: classofStudent,
  //   marksObtained: { $ne: "" }
  // });

  // console.log("Total Marks Uploaded:", marksUploadedCount);

  // // Step 2: Calculate points
  // let point = 0;

  // if (formattedLocaleTime <= "2:40:00 pm") {
  //   if (marksUploadedCount >= 80) point = 15;
  //   else if (marksUploadedCount >= 50) point = 12;
  //   else if (marksUploadedCount >= 40) point = 10;
  //   else if (marksUploadedCount >= 30) point = 8;
  //   else if (marksUploadedCount >= 15) point = 7;
  //   else if (marksUploadedCount >= 10) point = 5;
  //   else if (marksUploadedCount >= 9) point = 3;
  // } else {
  //   point = -15;
  // }

  // // Step 3: Check if gamification already exists (NO DATE check here)
  // const existingGamification = await Gamification.findOne({
  //   pointType: "makrs-upload",
  //   userId: userId,
  //   id: schoolId,
  //   classofStudent: classofStudent,
  //   examId: examId
  // });

  // // Step 4: Create or Update
  // if (existingGamification) {
  //   existingGamification.point = point;
  //   existingGamification.updatedAt = now;
  //   await existingGamification.save();
  //   console.log("Updated existing gamification entry for marks-upload.");
  // } else {
  //   const gamificationPayload = {
  //     userId: userId,
  //     pointType: "makrs-upload",
  //     id: schoolId,
  //     classofStudent: classofStudent,
  //     examId: examId,
  //     point: point,
  //     dateOfPoint: now,
     
  //   };

  //   const newGamification = new Gamification(gamificationPayload);
  //   await newGamification.save();
  //   console.log("Created new gamification entry for marks-upload.");
  // }






















console.log("hellow award points")

    console.log(keyValue, 
      userId, 
      examId,
       schoolId, 
       classofStudent)

    console.log("hellow award points")












  console.log("hellow award points");

  console.log(keyValue, userId, examId, schoolId, classofStudent);
  console.log("hellow award points");

  const now = new Date();
  const formattedLocaleTime = now.toLocaleTimeString();
  console.log("Upload Time:", formattedLocaleTime);

  // Step 1: Count students with marks uploaded
  const marksUploadedCount = await Marks.countDocuments({
    examId: examId,
    schoolId: schoolId,
    classofStudent: classofStudent,
    marksObtained: { $ne: "" }
  });

  console.log("Total Marks Uploaded:", marksUploadedCount);

  // Step 2: Calculate points
  let point = 0;

  // ✅ safer numeric time comparison
  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const cutoffSeconds = 14 * 3600 + 40 * 60; // 2:40 PM

  if (totalSeconds <= cutoffSeconds) {
    if (marksUploadedCount >= 80) point = 15;
    else if (marksUploadedCount >= 50) point = 12;
    else if (marksUploadedCount >= 40) point = 10;
    else if (marksUploadedCount >= 30) point = 8;
    else if (marksUploadedCount >= 15) point = 7;
    else if (marksUploadedCount >= 10) point = 5;
    else if (marksUploadedCount >= 9) point = 3;
  } else {
    point = -15;
  }

  // Step 3: Check if gamification already exists (NO DATE check here)
  const existingGamification = await Gamification.findOne({
    pointType: "makrs-upload",
    userId: userId,
    id: schoolId,
    classofStudent: classofStudent,
    examId: examId
  });

  // Step 4: Create or Update
  if (existingGamification) {
    existingGamification.point = point;
    existingGamification.updatedAt = now;
    await existingGamification.save();
    console.log("Updated existing gamification entry for marks-upload.");
  } else {
    const gamificationPayload = {
      userId: userId,
      pointType: "makrs-upload",
      id: schoolId,
      classofStudent: classofStudent,
      examId: examId,
      point: point,
      dateOfPoint: now,
     
    };

    const newGamification = new Gamification(gamificationPayload);
    await newGamification.save();
    console.log("Created new gamification entry for marks-upload.");
  }





   }


   //Absentee calling block

   else if (keyValue === 'absentee-calling') {

    

  // console.log("hellow absentee calling");
  // console.log(userId);
  // console.log(studentAttendanceGamificationDate);
  // console.log(schoolId);
  // console.log(classofStudent);

  // console.log("hellow absentee calling");
  // const formattedLocaleTime = new Date(studentAttendanceGamificationDate)
  //   .toLocaleTimeString();
  // console.log(formattedLocaleTime);

  // // Normalize date range
  // const dateOnly = new Date(studentAttendanceGamificationDate);
  // dateOnly.setUTCHours(0, 0, 0, 0);

  // const nextDate = new Date(dateOnly);
  // nextDate.setUTCDate(dateOnly.getUTCDate() + 1);

  // // Aggregation: Get only absenteeCallingStatus: "Connected" count
  // const attendanceData = await StudentAttendance.aggregate([
  //   {
  //     $match: {
  //       date: { $gte: dateOnly, $lt: nextDate },
  //       absenteeCallingStatus: "Connected" // ✅ filter here
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: "students",
  //       localField: "studentSrn",
  //       foreignField: "studentSrn",
  //       as: "student",
  //     }
  //   },
  //   { $unwind: "$student" },
  //   {
  //     $match: {
  //       "student.schoolId": schoolId,
  //       "student.classofStudent": classofStudent
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         schoolId: "$student.schoolId",
  //         classofStudent: "$student.classofStudent",
  //         districtId: "$student.districtId",
  //       },
  //       connectedCount: { $sum: 1 } // ✅ counts only Connected records
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: "district_block_schools",
  //       let: {
  //         districtId: { $toString: "$_id.districtId" },
  //         centerId: { $toString: "$_id.schoolId" }
  //       },
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $and: [
  //                 { $eq: ["$districtId", "$$districtId"] },
  //                 { $eq: ["$centerId", "$$centerId"] }
  //               ]
  //             }
  //           }
  //         }
  //       ],
  //       as: "locationInfo"
  //     }
  //   },
  //   {
  //     $unwind: {
  //       path: "$locationInfo",
  //       preserveNullAndEmptyArrays: true
  //     }
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       schoolId: "$_id.schoolId",
  //       classofStudent: "$_id.classofStudent",
  //       districtId: "$_id.districtId",
  //       connectedCount: 1,
  //       districtName: "$locationInfo.districtName",
  //       blockName: "$locationInfo.blockName",
  //       schoolName: "$locationInfo.centerName"
  //     }
  //   }
  // ]);

  // console.log("Absentee Calling Data Summary:");
  // console.log(attendanceData);

  // const connected = attendanceData[0]?.connectedCount || 0;

  // let point = 0;
  // if (formattedLocaleTime <= "2:40:00 pm") {
  //   if (connected >= 80) point = 15;
  //   else if (connected >= 50) point = 12;
  //   else if (connected >= 40) point = 10;
  //   else if (connected >= 30) point = 8;
  //   else if (connected >= 15) point = 7;
  //   else if (connected >= 10) point = 5;
  //   else if (connected >= 9) point = 3;
  // } else {
  //   point = -15;
  // }

  // // Step 1: Normalize date for gamification
  // const inputDate = new Date(studentAttendanceGamificationDate);
  // const startOfDay = new Date(inputDate.setUTCHours(0, 0, 0, 0));
  // const endOfDay = new Date(inputDate.setUTCHours(24, 0, 0, 0));

  // // Step 2: Search for existing document
  // const existingGamification = await Gamification.findOne({
  //   pointType: 'absentee-calling',
  //   userId: userId,
  //   id: schoolId,
  //   classofStudent: classofStudent,
  //   dateOfPoint: { $gte: startOfDay, $lt: endOfDay }
  // });

  // // Step 3: Update or create new
  // if (existingGamification) {
  //   existingGamification.point = point;
  //   existingGamification.updatedAt = new Date();
  //   await existingGamification.save();
  //   console.log("Updated existing absentee-calling gamification entry.");
  // } else {
  //   const gamificationPayload = {
  //     userId: userId,
  //     pointType: 'absentee-calling',
  //     id: schoolId,
  //     classofStudent: classofStudent,
  //     point: point,
  //     dateOfPoint: new Date(studentAttendanceGamificationDate)
  //   };

  //   const newGamification = new Gamification(gamificationPayload);
  //   await newGamification.save();
  //   console.log("Created new absentee-calling gamification entry.");
  // }











  console.log("hellow absentee calling");
  console.log(userId);
  console.log(studentAttendanceGamificationDate);
  console.log(schoolId);
  console.log(classofStudent);

  console.log("hellow absentee calling");
  const formattedLocaleTime = new Date(studentAttendanceGamificationDate)
    .toLocaleTimeString();
  console.log(formattedLocaleTime);

  // Normalize date range
  const dateOnly = new Date(studentAttendanceGamificationDate);
  dateOnly.setUTCHours(0, 0, 0, 0);

  const nextDate = new Date(dateOnly);
  nextDate.setUTCDate(dateOnly.getUTCDate() + 1);

  // Aggregation: Get only absenteeCallingStatus: "Connected" count
  const attendanceData = await StudentAttendance.aggregate([
    {
      $match: {
        date: { $gte: dateOnly, $lt: nextDate },
        absenteeCallingStatus: "Connected" // ✅ filter here
      }
    },
    {
      $lookup: {
        from: "students",
        localField: "studentSrn",
        foreignField: "studentSrn",
        as: "student",
      }
    },
    { $unwind: "$student" },
    {
      $match: {
        "student.schoolId": schoolId,
        "student.classofStudent": classofStudent
      }
    },
    {
      $group: {
        _id: {
          schoolId: "$student.schoolId",
          classofStudent: "$student.classofStudent",
          districtId: "$student.districtId",
        },
        connectedCount: { $sum: 1 } // ✅ counts only Connected records
      }
    },
    {
      $lookup: {
        from: "district_block_schools",
        let: {
          districtId: { $toString: "$_id.districtId" },
          centerId: { $toString: "$_id.schoolId" }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$districtId", "$$districtId"] },
                  { $eq: ["$centerId", "$$centerId"] }
                ]
              }
            }
          }
        ],
        as: "locationInfo"
      }
    },
    {
      $unwind: {
        path: "$locationInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        schoolId: "$_id.schoolId",
        classofStudent: "$_id.classofStudent",
        districtId: "$_id.districtId",
        connectedCount: 1,
        districtName: "$locationInfo.districtName",
        blockName: "$locationInfo.blockName",
        schoolName: "$locationInfo.centerName"
      }
    }
  ]);

  console.log("Absentee Calling Data Summary:");
  console.log(attendanceData);

  const connected = attendanceData[0]?.connectedCount || 0;

  let point = 0;
  // ✅ safer numeric time comparison
  const callTotalSeconds = new Date(studentAttendanceGamificationDate).getHours() * 3600 + 
                            new Date(studentAttendanceGamificationDate).getMinutes() * 60 + 
                            new Date(studentAttendanceGamificationDate).getSeconds();
  const callCutoffSeconds = 14 * 3600 + 40 * 60; // 2:40 PM

  if (callTotalSeconds <= callCutoffSeconds) {
    if (connected >= 80) point = 15;
    else if (connected >= 50) point = 12;
    else if (connected >= 40) point = 10;
    else if (connected >= 30) point = 8;
    else if (connected >= 15) point = 7;
    else if (connected >= 10) point = 5;
    else if (connected >= 9) point = 3;
  } else {
    point = -15;
  }

  // Step 1: Normalize date for gamification
  const inputDate = new Date(studentAttendanceGamificationDate);
  const startOfDay = new Date(inputDate.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(inputDate.setUTCHours(24, 0, 0, 0));

  // Step 2: Search for existing document
  const existingGamification = await Gamification.findOne({
    pointType: 'absentee-calling',
    userId: userId,
    id: schoolId,
    classofStudent: classofStudent,
    dateOfPoint: { $gte: startOfDay, $lt: endOfDay }
  });

  // Step 3: Update or create new
  if (existingGamification) {
    existingGamification.point = point;
    existingGamification.updatedAt = new Date();
    await existingGamification.save();
    console.log("Updated existing absentee-calling gamification entry.");
  } else {
    const gamificationPayload = {
      userId: userId,
      pointType: 'absentee-calling',
      id: schoolId,
      classofStudent: classofStudent,
      point: point,
      dateOfPoint: new Date(studentAttendanceGamificationDate)
    };

    const newGamification = new Gamification(gamificationPayload);
    await newGamification.save();
    console.log("Created new absentee-calling gamification entry.");
  }





   }


   //Attendance pdf upload

   else if (keyValue === "attendancePdf-upload"){

   console.log("Hello attendancePdf-upload");
  console.log(keyValue, userId, schoolId, classofStudent, dateOfUpload);
  console.log("Hello attendancePdf-upload");

  // Step 1: Find Attendance PDF record
  const attendancePdfDoc = await AttendancePdf.findOne({
    userId: userId,
    schoolId: schoolId,
    classofStudent: classofStudent,
    dateOfUpload: new Date(dateOfUpload),
    isPdfUploaded: true
  });

  if (!attendancePdfDoc) {
    console.log("No matching attendance PDF found or not uploaded.");
    return;
  }

  // Step 2: Get IST time of createdAt
  const createdAtIST = attendancePdfDoc.createdAt.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log("Upload Time (IST):", createdAtIST);

  // Step 3: Calculate points using numeric comparison
  const cutoffTimeIST = new Date(`1970-01-01T14:40:00+05:30`).getTime();
  const uploadTimeIST = new Date(
    `1970-01-01T${attendancePdfDoc.createdAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" })}+05:30`
  ).getTime();

  let point = 0;
  if (uploadTimeIST <= cutoffTimeIST) {
    point = 5;
  } else {
    point = -5;
  }

  // Step 4: Check Gamification entry for same date
  const startOfDay = new Date(dateOfUpload);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(dateOfUpload);
  endOfDay.setUTCHours(24, 0, 0, 0);

  const existingGamification = await Gamification.findOne({
    pointType: "attendancePdf-upload",
    userId: userId,
    id: schoolId,
    classofStudent: classofStudent,
    dateOfPoint: { $gte: startOfDay, $lt: endOfDay }
  });

  // Step 5: Update or Create Gamification record
  if (existingGamification) {
    existingGamification.point = point;
    existingGamification.updatedAt = new Date();
    await existingGamification.save();
    console.log("Updated existing gamification entry for attendancePdf-upload.");
  } else {
    const gamificationPayload = {
      userId: userId,
      pointType: "attendancePdf-upload",
      id: schoolId,
      classofStudent: classofStudent,
      point: point,
      dateOfPoint: new Date(dateOfUpload)
    };

    const newGamification = new Gamification(gamificationPayload);
    await newGamification.save();
    console.log("Created new gamification entry for attendancePdf-upload.");
  }




   }




  } catch (error) {
    console.log(error.message)
  }


}