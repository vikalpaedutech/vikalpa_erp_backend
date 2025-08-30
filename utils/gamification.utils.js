// import { Gamification } from "../models/gamification.model.js";

 // Helper to calculate points based on your logic

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
  ,disciplinaryValue
})=>{

console.log('i am inside awardpoints')

console.log(keyValue)

console.log(userId)

console.log(typeof(loginTime))



try {
      
//Below block will be handling points giving for 'self-attendance'
    
if (keyValue === "self-attendance"){

console.log('Hello self attendances')

const formattedDate = new Date(Number(loginTime)).toISOString();
 
const formattedDateLocalTime = new Date(Number(loginTime)).toLocaleString();

const formattedLocaleTime = new Date(Number(loginTime)).toLocaleTimeString();


// const formattedLocaleTime = "7:31:00 am"
// const day = String(formattedDate.getDate()).padStart(2, '0');
// const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
// const year = formattedDate.getFullYear();
// const formattedCurrentDate = `${day}-${month}-${year}`;
// console.log(formattedCurrentDate); 





// const tempDate = new Date("2025-08-26T06:31:17.136Z");

// console.log('Full date', tempDate)

console.log("Formatted ISO Date:", formattedDate);
// console.log(tempDate)
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


  }

   else if (keyValue === "makrs-upload"){

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

   //Disciplinary gamification block

   else if (keyValue === 'disciplinary'){



    //This Aggeregation fetches the student count...



const totalStudents = await Student.aggregate([
  {
    $match: {
      schoolId: schoolId,
      classofStudent: classofStudent
    }
  },
  {
    $group: {
      _id: {
        schoolId: "$schoolId",
        classofStudent: "$classofStudent",
        districtId: "$districtId"
      },
      totalCount: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "district_block_schools",
      localField: "_id.schoolId",
      foreignField: "schoolId",
      as: "locationInfo"
    }
  },
  { $unwind: { path: "$locationInfo", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0,
      schoolId: "$_id.schoolId",
      classofStudent: "$_id.classofStudent",
      districtId: "$_id.districtId",
      totalCount: 1,
      districtName: "$locationInfo.districtName",
      blockName: "$locationInfo.blockName",
      schoolName: "$locationInfo.schoolName"
    }
  }
]);


     console.log("Attendance Data Summary:");
    console.log(totalStudents[0].totalCount);

    //--------------------------------------------------


//points block--------------------------------------------------
let points;

if (totalStudents[0].totalCount >= 50) {
  if (disciplinaryValue === 'Poor') points = -30;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 15;
  else if (disciplinaryValue === 'Excellent') points = 30;

} else if (totalStudents[0].totalCount >= 40 && totalStudents[0].totalCount <= 49) {
  if (disciplinaryValue === 'Poor') points = -27.5;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 13.75;
  else if (disciplinaryValue === 'Excellent') points = 27.5;

} else if (totalStudents[0].totalCount >= 30 && totalStudents[0].totalCount <= 39) {
  if (disciplinaryValue === 'Poor') points = -27.5;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 13.75;
  else if (disciplinaryValue === 'Excellent') points = 27.5;

} else if (totalStudents[0].totalCount >= 25 && totalStudents[0].totalCount <= 29) {
  if (disciplinaryValue === 'Poor') points = -20;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 10;
  else if (disciplinaryValue === 'Excellent') points = 20;

} else if (totalStudents[0].totalCount >= 20 && totalStudents[0].totalCount <= 24) {
  if (disciplinaryValue === 'Poor') points = -17.5;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 8.75;
  else if (disciplinaryValue === 'Excellent') points = 17.5;

} else if (totalStudents[0].totalCount >= 15 && totalStudents[0].totalCount <= 19) {
  if (disciplinaryValue === 'Poor') points = -15;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 7.5;
  else if (disciplinaryValue === 'Excellent') points = 15;

} else if (totalStudents[0].totalCount >= 10 && totalStudents[0].totalCount <= 14) {
  if (disciplinaryValue === 'Poor') points = -12.5;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 6.25;
  else if (disciplinaryValue === 'Excellent') points = 12.5;

} else if (totalStudents[0].totalCount >= 0 && totalStudents[0].totalCount <= 9) {
  if (disciplinaryValue === 'Poor') points = -10;
  else if (disciplinaryValue === 'Average') points = 0;
  else if (disciplinaryValue === 'Good') points = 2.5;
  else if (disciplinaryValue === 'Excellent') points = 10;
}


//---------------------------------------------------------------
console.log(points)



    //Date management for querying

    const today = new Date ();

    
    const startOfDay = new Date (Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ))

    //Get start of next day in UTC

    const endOfDay = new Date (startOfDay);

    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);


    //------------------------------------

  console.log("Hello disciplinary")

  // let disciplinaryValue = 'Average'

    let id = schoolId
  // let dateOfDisciplinary = new Date()
    // let classofStudent = '9'


  const isDisciplinaryGamificationExist = await Gamification.findOne({
  id, classofStudent, dateOfPoint:{$gte: startOfDay, $lt: endOfDay} }) //classofStudent, dateOfPoint:{$gte: startOfDay, $lt: endOfDay}




  if (!isDisciplinaryGamificationExist){

      //Creating default structure ith disciplinary value

      const newDisciplinaryData = {

        userId: '123',
        pointType: 'disciplinary',
        id: id,
        classofStudent:classofStudent,
        point:points,
        disciplinaryRemark1: 'Poor',
      disciplinaryRemark1Count: 0,
      disciplinaryRemark2: 'Average',
      disciplinaryRemark2Count: 0,
      disciplinaryRemark3: 'Good',
      disciplinaryRemark3Count: 0,
      disciplinaryRemark4: 'Excellent',
      disciplinaryRemark4Count: 0,
      dateOfPoint: new Date (),

        
      }

      //Finds which remark matches the input and increment its count.

      for (let i = 1; i<=4; i++){

        if(newDisciplinaryData[`disciplinaryRemark${i}`] === disciplinaryValue ){
          newDisciplinaryData[`disciplinaryRemark${i}Count`] = 1;

          break;
        }
      }





      //Saving the newDisciplinaryData in db

      const createDisciplinaryData = await Gamification.create(newDisciplinaryData);

      

      // return res.status(201).json({message:'Disciplnary points updated successfully',
      //   data: createDisciplinaryData
      // })


    } else {

      let updatedField = null;

      for (let i=1; i<=4; i++){

        console.log('i am inside for loop')

        if (isDisciplinaryGamificationExist[`disciplinaryRemark${i}`] === disciplinaryValue){
          updatedField = `disciplinaryRemark${i}Count`;

          console.log(updatedField)
          break;
        }

        console.log('Existing document updated')
        
      }

      // ✅ Add new points into existing point field
      if (typeof points === "number") {
        isDisciplinaryGamificationExist.point =
          (isDisciplinaryGamificationExist.point || 0) + points;
      }



      if (!updatedField){
        console.log('No updated field found!')
      }

      //Increment The count

      isDisciplinaryGamificationExist[updatedField] += 1;

      //Saving the updated disciplinary gamification document

      const saveUpdatedDisciplnaryGamification = await isDisciplinaryGamificationExist.save();


    console.log('gamification exist')

    }


   }




  } catch (error) {
    console.log(error.message)
  }


}