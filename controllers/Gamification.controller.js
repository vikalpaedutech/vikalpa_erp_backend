import mongoose from "mongoose";
import { GamificationPointLogic, GamificationUserPoint } from "../models/gamification.model.js";

import { UserAttendance } from "../models/userAttendnace.model.js";

import { Student } from "../models/student.model.js"
import { District_Block_School } from "../models/district_block_school.model.js";
import { SchoolDisciplinary } from "../models/schoolDisciplinary.model.js";
import { ReturnDocument } from "mongodb";
import { User } from "../models/user.model.js";

export const CreateGamificationPointLogic = async (req, res) => {
  const {
    selfAttendance,
    studentAttendance,
    pdfUpload,
    callingAbsentee,
    marks
  } = req.body;

  try {
    // Check if a document already exists (since this might be a singleton configuration)
    let existingConfig = await GamificationPointLogic.findOne();

    if (existingConfig) {
      // Update existing configuration
      existingConfig.selfAttendance = selfAttendance || existingConfig.selfAttendance;
      existingConfig.studentAttendance = studentAttendance || existingConfig.studentAttendance;
      existingConfig.pdfUpload = pdfUpload || existingConfig.pdfUpload;
      existingConfig.callingAbsentee = callingAbsentee || existingConfig.callingAbsentee;
      existingConfig.marks = marks || existingConfig.marks;

      const updatedConfig = await existingConfig.save();

      return res.status(200).json({
        success: true,
        message: "Gamification Point Logic updated successfully",
        data: updatedConfig
      });
    } else {
      // Create new configuration
      const newGamificationLogic = new GamificationPointLogic({
        selfAttendance: selfAttendance || [],
        studentAttendance: studentAttendance || [],
        pdfUpload: pdfUpload || [],
        callingAbsentee: callingAbsentee || [],
        marks: marks || []
      });

      const savedGamificationLogic = await newGamificationLogic.save();

      return res.status(201).json({
        success: true,
        message: "Gamification Point Logic created successfully",
        data: savedGamificationLogic
      });
    }
  } catch (error) {
    console.error("Error in CreateGamificationPointLogic:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};






export const GamificationPointAssigningToUsers = async (req, res) => {
  console.log("helloo")
  const { userObjectId } = req.body; //classValue

  //variable to store point value of user, pointType, classOfCenter.
  let pointValue;
  let pointType = 'SelfAttendance'
  let batch = '2025-27'
  let unqIdOfPointObject = null; // You can set this if needed

  console.log(req.body)

  try {
    const response = await GamificationPointLogic.find({})

    //Giving points to attendance on current date and gamification logic
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const userAttendanceResponse = await UserAttendance.find({
      unqUserObjectId: userObjectId,
      date: {
        $gte: start,
        $lte: end
      }
    });

    console.log(userAttendanceResponse[0].createdAt)

    //extracting time in hr:mm format, from utc to local time
    const userAttendanceTime = userAttendanceResponse[0].loginTime.toLocaleTimeString('en-In',
      {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    )

    //turning hh, mm into array and then joining them to make a number
    console.log(userAttendanceTime.split(':'))
    const userAttendanceTimeInNumber = userAttendanceTime.split(':').join('')
    console.log(Number(userAttendanceTimeInNumber))

    //Loop to check in which time interval user times lie...and assigning point
    for (let i = 0; i < 5; i++) {
      console.log(i)
      console.log(response[0].selfAttendance[i])

      //extracting time in hr:mm format, start time and end time
      const startTimeInNumber = response[0].selfAttendance[i].startTime.split(':').join('')
      const endTimeInNumber = response[0].selfAttendance[i].endTime.split(':').join('')

      //time validation conversion into number format
      const timeValidationInNumber = response[0].selfAttendance[i].timeValidation.split(':').join('')

      console.log(Number(startTimeInNumber))
      console.log(Number(endTimeInNumber))
      console.log(Number(userAttendanceTimeInNumber))
      console.log(Number(timeValidationInNumber))

      if (timeValidationInNumber <= userAttendanceTimeInNumber) {
        console.log('i am okay')
        pointValue = response[0].selfAttendance[i].negativeMarkingOnBreakingTimeValidation;
        console.log(pointValue)

        // UPDATE DATABASE HERE - Negative marking case
        const updateResult = await GamificationUserPoint.findOneAndUpdate(
          { unqObjectId: userObjectId },
          {
            $set: {
              pointType: pointType,
              pointValue: pointValue,
              classOfCenter: classOfCenter,
              unqIdOfPointObject: userObjectId,
              gamificationDate: new Date()
            }
          },
          { upsert: true, new: true } // Creates new document if doesn't exist, returns updated document
        )

        console.log('Database updated with negative marking:', updateResult)
        break;
      }

      if (startTimeInNumber < userAttendanceTimeInNumber && endTimeInNumber < userAttendanceTimeInNumber) {
        console.log("i am true")
      } else {
        console.log('i am in else block')
        console.log(i)
        pointValue = response[0].selfAttendance[i].point

        // UPDATE DATABASE HERE - Normal point assignment case
        const updateResult = await GamificationUserPoint.findOneAndUpdate(
          { unqObjectId: userObjectId },
          {
            $set: {
              pointType: pointType,
              pointValue: pointValue,
              classOfCenter: classOfCenter,
              unqIdOfPointObject: unqIdOfPointObject,
              gamificationDate: new Date()
            }
          },
          { upsert: true, new: true } // Creates new document if doesn't exist, returns updated document
        )

        console.log('Database updated with points:', updateResult)
        break;
      }
    }

    console.log('Final pointValue assigned:', pointValue)

    // Send success response
    res.status(200).json({
      status: 'Ok',
      message: 'Points assigned successfully',
      data: response[0].selfAttendance[0],
      assignedPoints: pointValue
    })

  } catch (error) {
    console.error('Error in GamificationPointAssigningToUsers:', error)
    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message
    })
  }
}












//New Controllers


// export const selfAttendancePoint = async (req, res) => {

//   console.log("i am inside Gamification.controller.js, api: selfAttendancePoint")

//   const { unqObjectId, batch, unqIdOfPointObject, date } = req.body;

//   console.log(req.body)

//   //logic building for point assigning

//   //fetching user attendance time for holding it in a const.
//   //then fetches "gamificationuserpoints", which contains logic to match with
//   //then we match the point types with different times ad ranges to asign pints.


//   //Fetching gamificaiton point logics

//   const responseGamificationPointLogic = await GamificationPointLogic.find({});

//   const GamificationPointLogicForAttendance = responseGamificationPointLogic[0].selfAttendance

//   let startDate;
//   let endDate;

//   const dateConversionFunction = (date) => {
//     startDate = new Date(date);
//     startDate.setUTCHours(0, 0, 0, 0);

//     endDate = new Date(date);
//     endDate.setUTCHours(23, 59, 59, 999);
//   }

//   dateConversionFunction(date)

//   console.log(startDate, endDate)
//   //Fetching student time

//   const responseAttendance = await UserAttendance.find({
//     unqUserObjectId: unqObjectId, date: {
//       $gte: startDate,
//       $lte: endDate
//     }
//   })

//   const userAttendanceTime = responseAttendance[0].date

//   //converting user time to hh:mm format

//   const istTime = new Date(userAttendanceTime)

//   const userHours = istTime.toLocaleDateString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,

//   })

//   const userTimeInNumbers = Number(userHours.split(",")[1].split(":").join(""))


//   console.log(GamificationPointLogicForAttendance)

//   console.log("i am user login attendance", userTimeInNumbers)

//   //Logic for point assignment by compring userTimeInNumbers to GamificationPointLogicForAttendance

//   let userPoint;
//   let unqIdOfPoint;
//   //Loop for assigning points

//   for (let i = 0; i < GamificationPointLogicForAttendance.length; i++) {

//     if (userTimeInNumbers >= (GamificationPointLogicForAttendance[i].startTime.split(":").join(""))
//       && userTimeInNumbers <= (GamificationPointLogicForAttendance[i].endTime.split(":").join(""))) {

//       console.log(GamificationPointLogicForAttendance[i].startTime.split(":").join(""))
//       console.log(GamificationPointLogicForAttendance[i].endTime.split(":").join(""))
//       userPoint = GamificationPointLogicForAttendance[i].point

//       unqIdOfPoint = GamificationPointLogicForAttendance[i]._id

//       break;
//     }

//   }
//   console.log("hulalal", userPoint)

//   //Creating GamificationUserPoint doc in same collection

//   try {

//     //checking if point already exist or not.
//     const pointExist = await GamificationUserPoint.find({
//       unqObjectId: unqObjectId, createdAt: {
//         $gte: startDate,
//         $lte: endDate
//       },
//       pointType: "SelfAttendance"
//     })

//     if (pointExist.length > 0) {
//       console.log(pointExist.length)

//       const response = await GamificationUserPoint.findOneAndUpdate(
//         {
//           unqObjectId: unqObjectId, createdAt: {
//             $gte: startDate,
//             $lte: endDate
//           }
//         },
//         {
//           $set: {
//             pointValue: userPoint
//           }
//         }

//       )
//     } else {
//       //Else creating new object to update in db
//       console.log("i am inside else")
//       const response222 = await GamificationUserPoint.create(
//         {
//           unqObjectId: unqObjectId,
//           batch: null, //batch
//           gamificationDate: new Date(),
//           pointType: "selfAttendance",
//           pointValue: userPoint,
//           unqIdOfPointObject: unqIdOfPoint,
//           isPointClaimed:true
//         }
//       )

//     }

//     res.status(200).json({ status: "Ok", dataAtt: responseAttendance, data: responseGamificationPointLogic[0].selfAttendance })


//   } catch (error) {
//     console.log('error occured', error)
//   }

// }





export const selfAttendancePoint = async (req, res) => {
  console.log("i am inside Gamification.controller.js, api: selfAttendancePoint");

  // Handle both scenarios: Express middleware or direct function call
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    // Called as Express middleware (req has body)
    payload = req.body;
  } else if (req && req.pointType) {
    // Called as direct function with payload
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to selfAttendancePoint function");
    if (res) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid request payload"
      });
    }
    throw new Error("Invalid request payload");
  }

  const { unqObjectId, batch, unqIdOfPointObject, date, schoolId } = payload;
  
  console.log("Self Attendance Payload:", payload);

  // Logic building for point assigning
  // Fetching user attendance time for holding it in a const.
  // then fetches "gamificationuserpoints", which contains logic to match with
  // then we match the point types with different times and ranges to assign points.

  // Fetching gamification point logics
  const responseGamificationPointLogic = await GamificationPointLogic.find({});
  const GamificationPointLogicForAttendance = responseGamificationPointLogic[0]?.selfAttendance || [];

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  };

  dateConversionFunction(date);
  console.log("Start Date:", startDate, "End Date:", endDate);

  try {
    // Fetching user attendance time
    const responseAttendance = await UserAttendance.find({
      unqUserObjectId: unqObjectId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (!responseAttendance || responseAttendance.length === 0) {
      console.log("⚠️ No attendance found for user on this date");
      const noDataResult = {
        status: "Skipped",
        message: "No attendance found for this user on the given date",
        pointValue: 0
      };

      if (isDirectCall) {
        return noDataResult;
      }
      return res.status(200).json({ status: "Ok", data: noDataResult });
    }

    const userAttendanceTime = responseAttendance[0].date;

    // Converting user time to hh:mm format
    const istTime = new Date(userAttendanceTime);
    const userHours = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const userTimeInNumbers = Number(userHours.split(",")[1].split(":").join(""));
    console.log("User login attendance time:", userTimeInNumbers);

    // Logic for point assignment by comparing userTimeInNumbers to GamificationPointLogicForAttendance
    let userPoint = 0;
    let unqIdOfPoint = null;
    let matchedRange = null;
    let isLate = false;

    // Loop for assigning points
    for (let i = 0; i < GamificationPointLogicForAttendance.length; i++) {
      const logic = GamificationPointLogicForAttendance[i];
      const startTime = Number(logic.startTime.split(":").join(""));
      const endTime = Number(logic.endTime.split(":").join(""));
      
      if (userTimeInNumbers >= startTime && userTimeInNumbers <= endTime) {
        console.log(`✅ Found matching range: ${logic.startTime} - ${logic.endTime}`);
        matchedRange = logic;
        
        // Check if user is late (beyond timeValidation)
        if (logic.timeValidation) {
          const validationTime = Number(logic.timeValidation.split(":").join(""));
          if (userTimeInNumbers > validationTime) {
            // Late - use negativeMarkingOnBreakingTimeValidation
            userPoint = logic.negativeMarkingOnBreakingTimeValidation || -10;
            isLate = true;
            console.log(`⚠️ Late attendance! Using penalty: ${userPoint}`);
          } else {
            // On time - use regular point
            userPoint = logic.point;
            isLate = false;
            console.log(`✅ On time attendance! Using points: ${userPoint}`);
          }
        } else {
          // No time validation, use regular point
          userPoint = logic.point;
          isLate = false;
        }
        
        unqIdOfPoint = logic._id;
        break;
      }
    }

    console.log(`📊 Final Points: ${userPoint}, Is Late: ${isLate}`);

    // Creating GamificationUserPoint doc in same collection
    // Checking if point already exists or not
    const pointExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId,
      gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "selfAttendance"
    });

    let response = null;

    if (pointExist.length > 0) {
      console.log("⚠️ Point already exists for this date. Updating...");
      
      response = await GamificationUserPoint.findOneAndUpdate(
        {
          unqObjectId: unqObjectId,
          gamificationDate: {
            $gte: startDate,
            $lte: endDate
          },
          pointType: "selfAttendance"
        },
        {
          $set: {
            pointValue: userPoint,
            unqIdOfPointObject: unqIdOfPoint,
            isPointClaimed: true,
            isLate: isLate,
            batch: batch || null,
            schoolId: schoolId || null,
            metadata: {
              attendanceTime: userAttendanceTime,
              userTimeInNumbers: userTimeInNumbers,
              matchedRange: matchedRange ? {
                startTime: matchedRange.startTime,
                endTime: matchedRange.endTime,
                timeValidation: matchedRange.timeValidation,
                regularPoint: matchedRange.point,
                penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
                usedPoint: userPoint
              } : null,
              isLate: isLate
            }
          }
        },
        { new: true }
      );
      
      console.log(`✅ Updated existing self-attendance record:`, response._id);
    } else {
      console.log("✅ Creating new self-attendance record...");
      
      const gamificationData = {
        unqObjectId: unqObjectId,
        batch: batch || null,
        gamificationDate: new Date(date || new Date()),
        pointType: "selfAttendance",
        pointValue: userPoint,
        unqIdOfPointObject: unqIdOfPoint,
        isPointClaimed: true,
        isLate: isLate,
        schoolId: schoolId || null,
        metadata: {
          attendanceTime: userAttendanceTime,
          userTimeInNumbers: userTimeInNumbers,
          matchedRange: matchedRange ? {
            startTime: matchedRange.startTime,
            endTime: matchedRange.endTime,
            timeValidation: matchedRange.timeValidation,
            regularPoint: matchedRange.point,
            penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
            usedPoint: userPoint
          } : null,
          isLate: isLate
        }
      };

      response = await GamificationUserPoint.create(gamificationData);
      console.log(`✅ New self-attendance record created:`, response._id);
    }

    // ──────────────────────────────────────────────────────────────
    // ✅ RESPONSE
    // ──────────────────────────────────────────────────────────────

    const result = {
      status: "Success",
      message: pointExist.length > 0 ? "Self-attendance gamification updated" : "Self-attendance gamification awarded",
      pointValue: userPoint,
      isLate: isLate,
      attendanceTime: userAttendanceTime,
      matchedRange: matchedRange ? {
        startTime: matchedRange.startTime,
        endTime: matchedRange.endTime,
        regularPoint: matchedRange.point,
        penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
        usedPoint: userPoint
      } : null,
      gamificationId: response?._id || null
    };

    if (isDirectCall) {
      return result;
    }

    res.status(200).json({ 
      status: "Ok", 
      data: result,
      attendanceData: responseAttendance,
      gamificationLogic: GamificationPointLogicForAttendance
    });

  } catch (error) {
    console.log("Error in selfAttendancePoint:", error);
    
    if (isDirectCall) {
      throw error;
    }
    
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
    });
  }
};





//This api gives point to user on the basis of studentAttendance of their classes


// export const studentAttendance = async (req, res) => {

//   const { batch, schoolId, unqObjectId, unqIdOfPointObject, date } = req.body;
//   console.log(req.body)
//   //Fetching gamificaiton point logics

//   const responseGamificationPointLogic = await GamificationPointLogic.find({});

//   const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].studentAttendance

//   // console.log(GamificationPointLogicForStudentAttendance)


//   let startDate;
//   let endDate;

//   const dateConversionFunction = (date) => {

//     startDate = new Date(date)
//     startDate.setUTCHours(0, 0, 0, 0)

//     endDate = new Date(date)
//     endDate.setUTCHours(23, 59, 59, 999)

//   }

//   dateConversionFunction(date)
//   console.log(startDate, endDate)


//   //Finding total present student in a school by batch & schoolId
//   //Aggeregating students data with req.body studentAttendances

//   let pipeLine;
//   // pipeLine = [
//   //   {
//   //     $match:{
//   //       batch:batch,
//   //       schoolId: schoolId
//   //     }
//   //   },
//   //  {
//   //   $lookup:{
//   //     form:"studentattendances",
//   //     localField: "_id",
//   //     foreignField: "unqStudentObjectId",
//   //     as:"studentAttendanceData"
//   //   }
//   //  }
//   // ]


//   const pipeline = [
//     {
//       $match: {
//         batch: batch,
//         schoolId: schoolId
//       }
//     },

//     {
//       $lookup: {
//         from: "studentattendances",

//         let: {
//           studentId: "$_id"
//         },

//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   {
//                     $eq: [
//                       "$unqStudentObjectId",
//                       "$$studentId"
//                     ]
//                   },

//                   {
//                     $gte: ["$date", startDate]
//                   },

//                   {
//                     $lte: ["$date", endDate]
//                   },

//                   {
//                     $eq: ["$status", "Present"]
//                   }
//                 ]
//               }
//             }
//           }
//         ],

//         as: "studentAttendanceData"
//       }
//     },
//     {
//       $match: {
//         "studentAttendanceData.0": { $exists: true }
//       }
//     },
//     {
//       $addFields: {
//         maxUpdatedAt: {
//           $max: "$studentAttendanceData.updatedAt"
//         }
//       }
//     }


//   ];

//   try {
//     const response = await Student.aggregate(pipeline)
//     const studentAttendanceCount = response.length
//     console.log(studentAttendanceCount)

//     console.log("i am max time", response[0].maxUpdatedAt)
//     let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt

//     console.log('i am for testing')
//     const istTime = new Date(maxAttendanceMarkDateAndTime)

//     const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,

//     })

//     console.log(maxAttendanceMarkingHours)

//     const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",")
//     const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("")
//     console.log(maxAttendanceTimeInNumber)

//     //now comparing this studentAttendanceCount with GamificationPointLogicForStudentAttendance to assing pointValue

//     let point;
//     let unqIdOfPointObject;

//     for (let i = 0; i <= studentAttendanceCount; i++) {
//       if (studentAttendanceCount >= GamificationPointLogicForStudentAttendance[i].startRange && studentAttendanceCount <= GamificationPointLogicForStudentAttendance[i].endRange) {

//         //Checking validation for negative marking
//         if (maxAttendanceTimeInNumber > Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join(""))) {
//           point = -15
//           console.log("i am herer")
//           break;
//         }

//         console.log(Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join("")))
//         point = GamificationPointLogicForStudentAttendance[i].point
//         unqIdOfPointObject = GamificationPointLogicForStudentAttendance[i]._id
//         console.log(point)

//         break;
//       }
//     }



//     //Now we have the point now we update the gamificationuserpoints collection

//     //first we check if the doc already exist for the unqObjectId, batch, gamificationDate, pointType

//     const studentAttendanceExist = await GamificationUserPoint.find({
//       unqObjectId: unqObjectId, batch: batch, gamificationDate: {
//         $gte: startDate,
//         $lte: endDate
//       },
//       pointType: "studentAttendance"
//     })

//     if (studentAttendanceExist.length > 0) {

//       // console.log(studentAttendanceExist[0].)

//       const response = await GamificationUserPoint.findOneAndUpdate({
//         unqObjectId: unqObjectId, batch: batch, gamificationDate: {
//           $gte: startDate,
//           $lte: endDate
//         },
//         pointType: "studentAttendance"
//       }, {
//         $set: {
//           pointValue: point
//         }
//       })
//     } else {
//       const response = await GamificationUserPoint.create({
//         unqObjectId: unqObjectId,
//         pointType: "studentAttendance",
//         pointValue: point,
//         batch: batch,
//         unqIdOfPointObject: unqIdOfPointObject,
//         gamificationDate: date,
//         isPointClaimed:true
        
//       })
//     }

//     res.status(200).json({ status: "Ok", data: response })
//   } catch (error) {
//     console.log(error)
//   }
// }










export const studentAttendance = async (req, res) => {
  console.log("I am inside Gamification.controller.js, api: studentAttendance");

  // Handle both scenarios: Express middleware or direct function call
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    // Called as Express middleware (req has body)
    payload = req.body;
  } else if (req && req.pointType) {
    // Called as direct function with payload
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to studentAttendance function");
    if (res) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid request payload"
      });
    }
    throw new Error("Invalid request payload");
  }

  const { batch, schoolId, unqObjectId, unqIdOfPointObject, date } = payload;
  console.log("Student Attendance Payload:", payload);

  // Fetching gamification point logics
  const responseGamificationPointLogic = await GamificationPointLogic.find({});
  const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0]?.studentAttendance || [];

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  };

  dateConversionFunction(date);
  console.log("Start Date:", startDate, "End Date:", endDate);

  // Finding total present student in a school by batch & schoolId
  // Aggregating students data with req.body studentAttendances

  const pipeline = [
    {
      $match: {
        batch: batch,
        schoolId: schoolId
      }
    },
    {
      $lookup: {
        from: "studentattendances",
        let: {
          studentId: "$_id"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$unqStudentObjectId",
                      "$$studentId"
                    ]
                  },
                  {
                    $gte: ["$date", startDate]
                  },
                  {
                    $lte: ["$date", endDate]
                  },
                  {
                    $eq: ["$status", "Present"]
                  }
                ]
              }
            }
          }
        ],
        as: "studentAttendanceData"
      }
    },
    {
      $match: {
        "studentAttendanceData.0": { $exists: true }
      }
    },
    {
      $addFields: {
        maxUpdatedAt: {
          $max: "$studentAttendanceData.updatedAt"
        }
      }
    }
  ];

  try {
    const response = await Student.aggregate(pipeline);
    
    if (!response || response.length === 0) {
      console.log("⚠️ No student attendance found for this batch and school");
      const noDataResult = {
        status: "Skipped",
        message: "No student attendance found for this batch and school on the given date",
        pointValue: 0
      };

      if (isDirectCall) {
        return noDataResult;
      }
      return res.status(200).json({ status: "Ok", data: noDataResult });
    }

    const studentAttendanceCount = response.length;
    console.log("Student Attendance Count:", studentAttendanceCount);

    const maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt;
    console.log("Max attendance update time:", maxAttendanceMarkDateAndTime);

    const istTime = new Date(maxAttendanceMarkDateAndTime);
    const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log("Max attendance marking hours:", maxAttendanceMarkingHours);

    const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",");
    const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("");
    console.log("Max attendance time in number:", maxAttendanceTimeInNumber);

    // Now comparing this studentAttendanceCount with GamificationPointLogicForStudentAttendance to assign pointValue
    let point = 0;
    let unqIdOfPointObjectFinal = null;
    let matchedRange = null;
    let isLate = false;

    for (let i = 0; i < GamificationPointLogicForStudentAttendance.length; i++) {
      const logic = GamificationPointLogicForStudentAttendance[i];
      if (studentAttendanceCount >= logic.startRange && studentAttendanceCount <= logic.endRange) {
        matchedRange = logic;
        console.log(`✅ Found matching range: ${logic.startRange}-${logic.endRange}`);

        // Checking validation for negative marking
        if (logic.timeValidation) {
          const validationTime = Number(logic.timeValidation.split(":").join(""));
          if (maxAttendanceTimeInNumber > validationTime) {
            // Late - use negativeMarkingOnBreakingTimeValidation
            point = logic.negativeMarkingOnBreakingTimeValidation || -15;
            isLate = true;
            console.log(`⚠️ Late attendance marking! Using penalty: ${point}`);
          } else {
            // On time - use regular point
            point = logic.point;
            isLate = false;
            console.log(`✅ On time attendance marking! Using points: ${point}`);
          }
        } else {
          // No time validation, use regular point
          point = logic.point;
          isLate = false;
        }

        unqIdOfPointObjectFinal = logic._id;
        break;
      }
    }

    console.log(`📊 Final Points: ${point}, Is Late: ${isLate}`);

    // Now we have the point now we update the gamificationuserpoints collection
    // First we check if the doc already exists for the unqObjectId, batch, gamificationDate, pointType

    const studentAttendanceExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId,
      batch: batch,
      gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "studentAttendance"
    });

    let responseData = null;

    if (studentAttendanceExist.length > 0) {
      console.log("⚠️ Student attendance gamification already exists. Updating...");
      
      responseData = await GamificationUserPoint.findOneAndUpdate(
        {
          unqObjectId: unqObjectId,
          batch: batch,
          gamificationDate: {
            $gte: startDate,
            $lte: endDate
          },
          pointType: "studentAttendance"
        },
        {
          $set: {
            pointValue: point,
            unqIdOfPointObject: unqIdOfPointObjectFinal,
            isPointClaimed: true,
            isLate: isLate,
            schoolId: schoolId || null,
            metadata: {
              studentAttendanceCount: studentAttendanceCount,
              maxAttendanceTime: maxAttendanceTimeInNumber,
              matchedRange: matchedRange ? {
                startRange: matchedRange.startRange,
                endRange: matchedRange.endRange,
                timeValidation: matchedRange.timeValidation,
                regularPoint: matchedRange.point,
                penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
                usedPoint: point
              } : null,
              isLate: isLate
            }
          }
        },
        { new: true }
      );
      
      console.log(`✅ Updated existing student-attendance record:`, responseData._id);
    } else {
      console.log("✅ Creating new student-attendance record...");
      
      const gamificationData = {
        unqObjectId: unqObjectId,
        pointType: "studentAttendance",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObjectFinal,
        gamificationDate: date,
        isPointClaimed: true,
        isLate: isLate,
        schoolId: schoolId || null,
        metadata: {
          studentAttendanceCount: studentAttendanceCount,
          maxAttendanceTime: maxAttendanceTimeInNumber,
          matchedRange: matchedRange ? {
            startRange: matchedRange.startRange,
            endRange: matchedRange.endRange,
            timeValidation: matchedRange.timeValidation,
            regularPoint: matchedRange.point,
            penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
            usedPoint: point
          } : null,
          isLate: isLate
        }
      };

      responseData = await GamificationUserPoint.create(gamificationData);
      console.log(`✅ New student-attendance record created:`, responseData._id);
    }

    // ──────────────────────────────────────────────────────────────
    // ✅ RESPONSE
    // ──────────────────────────────────────────────────────────────

    const result = {
      status: "Success",
      message: studentAttendanceExist.length > 0 ? "Student attendance gamification updated" : "Student attendance gamification awarded",
      pointValue: point,
      isLate: isLate,
      studentAttendanceCount: studentAttendanceCount,
      maxAttendanceTime: maxAttendanceTimeInNumber,
      matchedRange: matchedRange ? {
        startRange: matchedRange.startRange,
        endRange: matchedRange.endRange,
        regularPoint: matchedRange.point,
        penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
        usedPoint: point
      } : null,
      gamificationId: responseData?._id || null
    };

    if (isDirectCall) {
      return result;
    }

    res.status(200).json({
      status: "Ok",
      data: result,
      attendanceData: response
    });

  } catch (error) {
    console.log("Error in studentAttendance:", error);
    
    if (isDirectCall) {
      throw error;
    }
    
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
    });
  }
};










// export const pdfUpload = async (req, res) => {
//   console.log("i am in Gamification.controller.js, api: pdfUpload")

//   const { batch, unqObjectId, schoolId, date } = req.body;
//   console.log(req.body)
//   //fetching gamificationpointlogics

//   const fetchGamificationPointLogic = await GamificationPointLogic.find({})

//   console.log(fetchGamificationPointLogic[0].pdfUpload[0])

//   const pdfUploadTimeValidation = Number(fetchGamificationPointLogic[0].pdfUpload[0].timeValidation.split(":").join(""))
//   console.log(pdfUploadTimeValidation)

//   let unqIdOfPointObject;
//   unqIdOfPointObject = fetchGamificationPointLogic[0].pdfUpload[0]._id
//   //Date conversion

//   let startDate;
//   let endDate;

//   const dateConversionFunction = (date) => {

//     startDate = new Date(date)
//     startDate.setUTCHours(0, 0, 0, 0)

//     endDate = new Date(date)
//     endDate.setUTCHours(23, 59, 59, 999)
//   }

//   dateConversionFunction(date);

//   console.log(startDate, endDate)

//   //Creating pipeline that aggregates district_block_schools with attendancePdfs and fetches updatedAt and maxUpdatedat for point assignment
//   let pipeline;

//   pipeline = [
//     {
//       $match: {
//         isCenterClosed: false,
//         schoolId: schoolId
//       }
//     },

//     {
//       $lookup: {
//         from: "attendancepdfs",

//         let: {
//           schoolObjectId: "$_id"
//         },

//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [

//                   {
//                     $eq: [
//                       "$district_block_schoolsObjectId",
//                       "$$schoolObjectId"
//                     ]
//                   },

//                   {
//                     $gte: [
//                       "$dateOfUpload",
//                       startDate
//                     ]
//                   },

//                   {
//                     $lte: [
//                       "$dateOfUpload",
//                       endDate
//                     ]
//                   }

//                 ]
//               }
//             }
//           }
//         ],

//         as: "pdfDetails"
//       }
//     },

//     {
//       $match: {
//         "pdfDetails.0": { $exists: true }
//       }
//     }
//   ];





//   try {
//     const response = await District_Block_School.aggregate(pipeline)
    

// console.log(response)
//     //pdf time conversion in to number for comparison and poin assignment

//     const pdfTime = response[0].pdfDetails[0].createdAt





//     //Taking out just the time in hh:mm from pdfTime
//     const istTime = new Date(pdfTime)

//     const pdfUploadInHHmm = istTime.toLocaleDateString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,

//     })

//     let point;

//     const pdfUploadInHHmmInNumber = Number(pdfUploadInHHmm.split(",")[1].split(":").join(""))

//     console.log(pdfUploadInHHmmInNumber)


//     //Comparing times of upload with gamificationpointlogic time number values and updating or creating it in gamificatinuserpoints
//     if (pdfUploadInHHmmInNumber > pdfUploadTimeValidation) {
//       console.log("in tru")
//       point = -5
//     } else {
//       console.log("in else")
//       point = 5
//     }

//     //Now chcking if the object already exist in gamificationuserpoints by unqObjectId, pointType, batch, gamificationDate


//     const pdfUploadExist = await GamificationUserPoint.find({
//       unqObjectId: unqObjectId, gamificationDate: {
//         $gte: startDate,
//         $lte: endDate
//       },
//       pointType: "uploadPdf",
//       batch: batch
//     })

//     if (pdfUploadExist.length > 0) {
//       const updateResponse = await GamificationUserPoint.findOneAndUpdate({
//         unqObjectId: unqObjectId, gamificationDate: {
//           $gte: startDate,
//           $lte: endDate
//         },
//         pointType: "uploadPdf",
//         batch: batch
//       },
//         {
//           $set: {
//             pointValue: point
//           }
//         }
//       )
//     } else {
//       const createResponse = await GamificationUserPoint.create({
//         unqObjectId: unqObjectId,
//         pointType: "uploadPdf",
//         pointValue: point,
//         batch: batch,
//         unqIdOfPointObject: unqIdOfPointObject,
//         gamificationDate: new Date()


//       })
//     }


//     res.status(200).json({ status: "Ok", data: response })
//   } catch (error) {
//     console.log(error)
//   }
// }









export const pdfUpload = async (req, res) => {
  console.log("i am in Gamification.controller.js, api: pdfUpload");

  // Handle both scenarios: Express middleware or direct function call
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    // Called as Express middleware (req has body)
    payload = req.body;
  } else if (req && req.pointType) {
    // Called as direct function with payload
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to pdfUpload function");
    if (res) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid request payload"
      });
    }
    throw new Error("Invalid request payload");
  }

  const { batch, unqObjectId, schoolId, date } = payload;
  console.log("PDF Upload Payload:", payload);

  // Fetching gamification point logics
  const fetchGamificationPointLogic = await GamificationPointLogic.find({});
  
  if (!fetchGamificationPointLogic || !fetchGamificationPointLogic[0]?.pdfUpload || fetchGamificationPointLogic[0].pdfUpload.length === 0) {
    console.log("⚠️ No PDF upload gamification logic found");
    const noDataResult = {
      status: "Skipped",
      message: "No PDF upload gamification logic found",
      pointValue: 0
    };

    if (isDirectCall) {
      return noDataResult;
    }
    return res.status(200).json({ status: "Ok", data: noDataResult });
  }

  console.log("PDF Upload Logic:", fetchGamificationPointLogic[0].pdfUpload[0]);

  const pdfUploadTimeValidation = Number(fetchGamificationPointLogic[0].pdfUpload[0].timeValidation.split(":").join(""));
  console.log("PDF Upload Time Validation:", pdfUploadTimeValidation);

  let unqIdOfPointObject;
  unqIdOfPointObject = fetchGamificationPointLogic[0].pdfUpload[0]._id;

  // Date conversion
  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  };

  dateConversionFunction(date);
  console.log("Start Date:", startDate, "End Date:", endDate);

  // Creating pipeline that aggregates district_block_schools with attendancePdfs
  // and fetches updatedAt and maxUpdatedAt for point assignment
  let pipeline = [
    {
      $match: {
        isCenterClosed: false,
        schoolId: schoolId
      }
    },
    {
      $lookup: {
        from: "attendancepdfs",
        let: {
          schoolObjectId: "$_id"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$district_block_schoolsObjectId",
                      "$$schoolObjectId"
                    ]
                  },
                  {
                    $gte: [
                      "$dateOfUpload",
                      startDate
                    ]
                  },
                  {
                    $lte: [
                      "$dateOfUpload",
                      endDate
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: "pdfDetails"
      }
    },
    {
      $match: {
        "pdfDetails.0": { $exists: true }
      }
    }
  ];

  try {
    const response = await District_Block_School.aggregate(pipeline);
    console.log("PDF Upload Response:", response);

    if (!response || response.length === 0) {
      console.log("⚠️ No PDF upload found for this school and date");
      const noDataResult = {
        status: "Skipped",
        message: "No PDF upload found for this school on the given date",
        pointValue: 0
      };

      if (isDirectCall) {
        return noDataResult;
      }
      return res.status(200).json({ status: "Ok", data: noDataResult });
    }

    // PDF time conversion into number for comparison and point assignment
    const pdfTime = response[0].pdfDetails[0].createdAt;

    // Taking out just the time in hh:mm from pdfTime
    const istTime = new Date(pdfTime);
    const pdfUploadInHHmm = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log("PDF Upload Time (HH:MM):", pdfUploadInHHmm);

    const pdfUploadInHHmmInNumber = Number(pdfUploadInHHmm.split(",")[1].split(":").join(""));
    console.log("PDF Upload Time in Number:", pdfUploadInHHmmInNumber);

    // Get the logic object for reference
    const pdfLogic = fetchGamificationPointLogic[0].pdfUpload[0];
    let point = 0;
    let isLate = false;

    // Comparing times of upload with gamificationpointlogic time number values
    if (pdfUploadInHHmmInNumber > pdfUploadTimeValidation) {
      // Late upload - use negativeMarkingOnBreakingTimeValidation
      point = pdfLogic.negativeMarkingOnBreakingTimeValidation || -5;
      isLate = true;
      console.log(`⚠️ Late PDF upload! Using penalty: ${point}`);
    } else {
      // On time - use regular point
      point = pdfLogic.point || 5;
      isLate = false;
      console.log(`✅ On time PDF upload! Using points: ${point}`);
    }

    console.log(`📊 Final Points: ${point}, Is Late: ${isLate}`);

    // Now checking if the object already exists in gamificationuserpoints
    const pdfUploadExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId,
      gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "uploadPdf",
      batch: batch
    });

    let responseData = null;

    if (pdfUploadExist.length > 0) {
      console.log("⚠️ PDF upload gamification already exists. Updating...");
      
      responseData = await GamificationUserPoint.findOneAndUpdate(
        {
          unqObjectId: unqObjectId,
          gamificationDate: {
            $gte: startDate,
            $lte: endDate
          },
          pointType: "uploadPdf",
          batch: batch
        },
        {
          $set: {
            pointValue: point,
            unqIdOfPointObject: unqIdOfPointObject,
            isPointClaimed: true,
            isLate: isLate,
            schoolId: schoolId || null,
            metadata: {
              pdfUploadTime: pdfUploadInHHmm,
              pdfUploadTimeInNumber: pdfUploadInHHmmInNumber,
              timeValidation: pdfLogic.timeValidation,
              regularPoint: pdfLogic.point,
              penaltyPoint: pdfLogic.negativeMarkingOnBreakingTimeValidation,
              usedPoint: point,
              isLate: isLate
            }
          }
        },
        { new: true }
      );
      
      console.log(`✅ Updated existing PDF upload record:`, responseData._id);
    } else {
      console.log("✅ Creating new PDF upload record...");
      
      const gamificationData = {
        unqObjectId: unqObjectId,
        pointType: "uploadPdf",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObject,
        gamificationDate: new Date(),
        isPointClaimed: true,
        isLate: isLate,
        schoolId: schoolId || null,
        metadata: {
          pdfUploadTime: pdfUploadInHHmm,
          pdfUploadTimeInNumber: pdfUploadInHHmmInNumber,
          timeValidation: pdfLogic.timeValidation,
          regularPoint: pdfLogic.point,
          penaltyPoint: pdfLogic.negativeMarkingOnBreakingTimeValidation,
          usedPoint: point,
          isLate: isLate
        }
      };

      responseData = await GamificationUserPoint.create(gamificationData);
      console.log(`✅ New PDF upload record created:`, responseData._id);
    }

    // ──────────────────────────────────────────────────────────────
    // ✅ RESPONSE
    // ──────────────────────────────────────────────────────────────

    const result = {
      status: "Success",
      message: pdfUploadExist.length > 0 ? "PDF upload gamification updated" : "PDF upload gamification awarded",
      pointValue: point,
      isLate: isLate,
      pdfUploadTime: pdfUploadInHHmm,
      timeValidation: pdfLogic.timeValidation,
      regularPoint: pdfLogic.point,
      penaltyPoint: pdfLogic.negativeMarkingOnBreakingTimeValidation,
      usedPoint: point,
      gamificationId: responseData?._id || null
    };

    if (isDirectCall) {
      return result;
    }

    res.status(200).json({
      status: "Ok",
      data: result,
      pdfData: response
    });

  } catch (error) {
    console.log("Error in pdfUpload:", error);
    
    if (isDirectCall) {
      throw error;
    }
    
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
    });
  }
};






// export const callingAbsentee = async (req, res) => {

//   console.log("I am in Gamificaition.controler.js, api: callingAbsentee")

//   const { batch, schoolId, unqObjectId, unqIdOfPointObject, date } = req.body;
//   console.log(req.body)
//   //Fetching gamificaiton point logics

//   const responseGamificationPointLogic = await GamificationPointLogic.find({});

//   const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].callingAbsentee

//   // console.log(GamificationPointLogicForStudentAttendance)


//   let startDate;
//   let endDate;

//   const dateConversionFunction = (date) => {

//     startDate = new Date(date)
//     startDate.setUTCHours(0, 0, 0, 0)

//     endDate = new Date(date)
//     endDate.setUTCHours(23, 59, 59, 999)

//   }

//   dateConversionFunction(date)
//   console.log(startDate, endDate)



// const pipeline = [
//   {
//     $match: {
//       batch: batch,
//       schoolId: schoolId
//     }
//   },

//   {
//     $lookup: {
//       from: "studentattendances",

//       let: {
//         studentId: "$_id"
//       },

//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 {
//                   $eq: [
//                     "$unqStudentObjectId",
//                     "$$studentId"
//                   ]
//                 },

//                 {
//                   $gte: ["$date", startDate]
//                 },

//                 {
//                   $lte: ["$date", endDate]
//                 },

//                 {
//                   $eq: ["$status", "Absent"]
//                 },

//                 {
//                   $eq: ["$absenteeCallingStatus", "Connected"]
//                 }
//               ]
//             }
//           }
//         }
//       ],

//       as: "studentAttendanceData"
//     }
//   },

//   {
//     $match: {
//       "studentAttendanceData.0": { $exists: true }
//     }
//   },

//   {
//     $addFields: {
//       maxUpdatedAt: {
//         $max: "$studentAttendanceData.updatedAt"
//       }
//     }
//   }
// ];

//   try {
//     const response = await Student.aggregate(pipeline)
//     const studentAbsentConnectedCount = response.length
//     console.log(studentAbsentConnectedCount)

//     // console.log("i am max time", response[0].maxUpdatedAt)
//     // let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt
// if (response.length === 0) {
//   return res.status(404).json({
//     status: "Fail",
//     message: "No attendance data found for this date"
//   });
// }

// console.log("i am max time", response[0].maxUpdatedAt)

// //below fetches max absentee calling done time
// let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt
//     const istTime = new Date(maxAttendanceMarkDateAndTime)

//     const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,

//     })

//     console.log(maxAttendanceMarkingHours)

//     const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",")
//     const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("")
//     console.log(maxAttendanceTimeInNumber)

//     //now comparing this studentAttendanceCount with GamificationPointLogicForStudentAttendance to assing pointValue

//     let point;
//     let unqIdOfPointObject;

//     for (let i = 0; i <= studentAbsentConnectedCount; i++) {
//       if (studentAbsentConnectedCount >= GamificationPointLogicForStudentAttendance[i].startRange && studentAbsentConnectedCount <= GamificationPointLogicForStudentAttendance[i].endRange) {

//         //Checking validation for negative marking
//         if (maxAttendanceTimeInNumber > Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join(""))) {
//           point = -15
//           console.log("i am herer")
//           break;
//         }

//         console.log(Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join("")))
//         point = GamificationPointLogicForStudentAttendance[i].point
//         unqIdOfPointObject = GamificationPointLogicForStudentAttendance[i]._id
//         console.log(point)

//         break;
//       }
//     }



//     //Now we have the point now we update the gamificationuserpoints collection

//     //first we check if the doc already exist for the unqObjectId, batch, gamificationDate, pointType

//     const studentAttendanceExist = await GamificationUserPoint.find({
//       unqObjectId: unqObjectId, batch: batch, gamificationDate: {
//         $gte: startDate,
//         $lte: endDate
//       },
//       pointType: "callingAbsentee"
//     })

//     if (studentAttendanceExist.length > 0) {

//       // console.log(studentAttendanceExist[0].)

//       const response = await GamificationUserPoint.findOneAndUpdate({
//         unqObjectId: unqObjectId, batch: batch, gamificationDate: {
//           $gte: startDate,
//           $lte: endDate
//         },
//         pointType: "callingAbsentee"
//       }, {
//         $set: {
//           pointValue: point
//         }
//       })
//     } else {
//       const response = await GamificationUserPoint.create({
//         unqObjectId: unqObjectId,
//         pointType: "callingAbsentee",
//         pointValue: point,
//         batch: batch,
//         unqIdOfPointObject: unqIdOfPointObject,
//         gamificationDate: date
//       })
//     }

//     res.status(200).json({ status: "Ok", data: response })
//   } catch (error) {
//     console.log(error)
//   }
// }





export const callingAbsentee = async (req, res) => {
  console.log("I am in Gamificaition.controler.js, api: callingAbsentee");

  // Handle both scenarios: Express middleware or direct function call
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    // Called as Express middleware (req has body)
    payload = req.body;
  } else if (req && req.pointType) {
    // Called as direct function with payload
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to callingAbsentee function");
    if (res) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid request payload"
      });
    }
    throw new Error("Invalid request payload");
  }

  const { batch, schoolId, unqObjectId, unqIdOfPointObject, date } = payload;
  console.log("Calling Absentee Payload:", payload);

  // Fetching gamification point logics
  const responseGamificationPointLogic = await GamificationPointLogic.find({});
  const GamificationPointLogicForCallingAbsentee = responseGamificationPointLogic[0]?.callingAbsentee || [];

  if (!GamificationPointLogicForCallingAbsentee || GamificationPointLogicForCallingAbsentee.length === 0) {
    console.log("⚠️ No calling absentee gamification logic found");
    const noDataResult = {
      status: "Skipped",
      message: "No calling absentee gamification logic found",
      pointValue: 0
    };

    if (isDirectCall) {
      return noDataResult;
    }
    return res.status(200).json({ status: "Ok", data: noDataResult });
  }

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  };

  dateConversionFunction(date);
  console.log("Start Date:", startDate, "End Date:", endDate);

  const pipeline = [
    {
      $match: {
        batch: batch,
        schoolId: schoolId
      }
    },
    {
      $lookup: {
        from: "studentattendances",
        let: {
          studentId: "$_id"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$unqStudentObjectId",
                      "$$studentId"
                    ]
                  },
                  {
                    $gte: ["$date", startDate]
                  },
                  {
                    $lte: ["$date", endDate]
                  },
                  {
                    $eq: ["$status", "Absent"]
                  },
                  {
                    $eq: ["$absenteeCallingStatus", "Connected"]
                  }
                ]
              }
            }
          }
        ],
        as: "studentAttendanceData"
      }
    },
    {
      $match: {
        "studentAttendanceData.0": { $exists: true }
      }
    },
    {
      $addFields: {
        maxUpdatedAt: {
          $max: "$studentAttendanceData.updatedAt"
        }
      }
    }
  ];

  try {
    const response = await Student.aggregate(pipeline);
    
    if (!response || response.length === 0) {
      console.log("⚠️ No absentee calling data found for this batch and school");
      const noDataResult = {
        status: "Skipped",
        message: "No absentee calling data found for this batch and school on the given date",
        pointValue: 0
      };

      if (isDirectCall) {
        return noDataResult;
      }
      return res.status(200).json({ status: "Ok", data: noDataResult });
    }

    const studentAbsentConnectedCount = response.length;
    console.log("Student Absent Connected Count:", studentAbsentConnectedCount);

    // Below fetches max absentee calling done time
    let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt;
    console.log("Max attendance update time:", maxAttendanceMarkDateAndTime);

    const istTime = new Date(maxAttendanceMarkDateAndTime);
    const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log("Max attendance marking hours:", maxAttendanceMarkingHours);

    const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",");
    const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("");
    console.log("Max attendance time in number:", maxAttendanceTimeInNumber);

    // Now comparing this studentAbsentConnectedCount with GamificationPointLogicForCallingAbsentee to assign pointValue
    let point = 0;
    let unqIdOfPointObjectFinal = null;
    let matchedRange = null;
    let isLate = false;

    for (let i = 0; i < GamificationPointLogicForCallingAbsentee.length; i++) {
      const logic = GamificationPointLogicForCallingAbsentee[i];
      if (studentAbsentConnectedCount >= logic.startRange && studentAbsentConnectedCount <= logic.endRange) {
        matchedRange = logic;
        console.log(`✅ Found matching range: ${logic.startRange}-${logic.endRange}`);

        // Checking validation for negative marking
        if (logic.timeValidation) {
          const validationTime = Number(logic.timeValidation.split(":").join(""));
          if (maxAttendanceTimeInNumber > validationTime) {
            // Late - use negativeMarkingOnBreakingTimeValidation
            point = logic.negativeMarkingOnBreakingTimeValidation || -15;
            isLate = true;
            console.log(`⚠️ Late absentee calling! Using penalty: ${point}`);
          } else {
            // On time - use regular point
            point = logic.point;
            isLate = false;
            console.log(`✅ On time absentee calling! Using points: ${point}`);
          }
        } else {
          // No time validation, use regular point
          point = logic.point;
          isLate = false;
        }

        unqIdOfPointObjectFinal = logic._id;
        break;
      }
    }

    console.log(`📊 Final Points: ${point}, Is Late: ${isLate}`);

    // Now we have the point now we update the gamificationuserpoints collection
    // First we check if the doc already exists for the unqObjectId, batch, gamificationDate, pointType

    const studentAttendanceExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId,
      batch: batch,
      gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "callingAbsentee"
    });

    let responseData = null;

    if (studentAttendanceExist.length > 0) {
      console.log("⚠️ Calling absentee gamification already exists. Updating...");
      
      responseData = await GamificationUserPoint.findOneAndUpdate(
        {
          unqObjectId: unqObjectId,
          batch: batch,
          gamificationDate: {
            $gte: startDate,
            $lte: endDate
          },
          pointType: "callingAbsentee"
        },
        {
          $set: {
            pointValue: point,
            unqIdOfPointObject: unqIdOfPointObjectFinal,
            isPointClaimed: true,
            isLate: isLate,
            schoolId: schoolId || null,
            metadata: {
              studentAbsentConnectedCount: studentAbsentConnectedCount,
              maxAttendanceTime: maxAttendanceTimeInNumber,
              matchedRange: matchedRange ? {
                startRange: matchedRange.startRange,
                endRange: matchedRange.endRange,
                timeValidation: matchedRange.timeValidation,
                regularPoint: matchedRange.point,
                penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
                usedPoint: point
              } : null,
              isLate: isLate
            }
          }
        },
        { new: true }
      );
      
      console.log(`✅ Updated existing calling absentee record:`, responseData._id);
    } else {
      console.log("✅ Creating new calling absentee record...");
      
      const gamificationData = {
        unqObjectId: unqObjectId,
        pointType: "callingAbsentee",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObjectFinal,
        gamificationDate: date,
        isPointClaimed: true,
        isLate: isLate,
        schoolId: schoolId || null,
        metadata: {
          studentAbsentConnectedCount: studentAbsentConnectedCount,
          maxAttendanceTime: maxAttendanceTimeInNumber,
          matchedRange: matchedRange ? {
            startRange: matchedRange.startRange,
            endRange: matchedRange.endRange,
            timeValidation: matchedRange.timeValidation,
            regularPoint: matchedRange.point,
            penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
            usedPoint: point
          } : null,
          isLate: isLate
        }
      };

      responseData = await GamificationUserPoint.create(gamificationData);
      console.log(`✅ New calling absentee record created:`, responseData._id);
    }

    // ──────────────────────────────────────────────────────────────
    // ✅ RESPONSE
    // ──────────────────────────────────────────────────────────────

    const result = {
      status: "Success",
      message: studentAttendanceExist.length > 0 ? "Calling absentee gamification updated" : "Calling absentee gamification awarded",
      pointValue: point,
      isLate: isLate,
      studentAbsentConnectedCount: studentAbsentConnectedCount,
      maxAttendanceTime: maxAttendanceTimeInNumber,
      matchedRange: matchedRange ? {
        startRange: matchedRange.startRange,
        endRange: matchedRange.endRange,
        regularPoint: matchedRange.point,
        penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
        usedPoint: point
      } : null,
      gamificationId: responseData?._id || null
    };

    if (isDirectCall) {
      return result;
    }

    res.status(200).json({
      status: "Ok",
      data: result,
      attendanceData: response
    });

  } catch (error) {
    console.log("Error in callingAbsentee:", error);
    
    if (isDirectCall) {
      throw error;
    }
    
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
    });
  }
};




export const disciplinary = async (req, res) => {
  console.log("i am inside Gamification.controller.js, api: disciplinary");

  // Handle both scenarios: Express middleware or direct function call
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    // Called as Express middleware (req has body)
    payload = req.body;
  } else if (req && req.pointType) {
    // Called as direct function with payload
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to disciplinary function");
    if (res) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid request payload"
      });
    }
    throw new Error("Invalid request payload");
  }

  const { 
    batch, 
    district_block_schoolsObjectId, 
    unqObjectId, 
    unqIdOfPointObject, 
    date, 
    schoolId 
  } = payload;
  
  console.log("Payload:", payload);

  // Fetching gamification point logics
  const responseGamificationPointLogic = await GamificationPointLogic.find({});
  const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].disciplinary;

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  };

  dateConversionFunction(date);

  // ──────────────────────────────────────────────────────────────
  // ✅ HANDLE MULTIPLE BATCHES AND SCHOOL IDs
  // ──────────────────────────────────────────────────────────────

  // Convert batch to array if it's a string
  let batches = [];
  if (Array.isArray(batch)) {
    batches = batch;
  } else if (typeof batch === 'string') {
    batches = [batch];
  }

  // Convert district_block_schoolsObjectId to array if it's a string
  let schoolObjectIds = [];
  if (Array.isArray(district_block_schoolsObjectId)) {
    schoolObjectIds = district_block_schoolsObjectId;
  } else if (typeof district_block_schoolsObjectId === 'string') {
    schoolObjectIds = [district_block_schoolsObjectId];
  }

  // Convert schoolId to array if it's a string
  let schoolIds = [];
  if (Array.isArray(schoolId)) {
    schoolIds = schoolId;
  } else if (typeof schoolId === 'string') {
    schoolIds = schoolId.split(',').filter(id => id.trim());
  }

  console.log("Batches:", batches);
  console.log("School Object IDs:", schoolObjectIds);
  console.log("School IDs:", schoolIds);

  // ──────────────────────────────────────────────────────────────
  // ✅ BUILD PIPELINE FOR EACH SCHOOL
  // ──────────────────────────────────────────────────────────────

  try {
    let allResponses = [];
    let totalPoints = 0;
    let createdDocuments = [];

    // Loop through each school object ID
    for (let i = 0; i < schoolObjectIds.length; i++) {
      const schoolObjectId = schoolObjectIds[i];
      const currentSchoolId = schoolIds[i] || schoolIds[0]; // Fallback to first if not enough

      console.log(`\n📚 Processing School ${i + 1}:`, {
        schoolObjectId,
        currentSchoolId
      });

      // Check if objectId is valid
      if (!mongoose.Types.ObjectId.isValid(schoolObjectId)) {
        console.log(`⚠️ Invalid ObjectId: ${schoolObjectId}, skipping...`);
        continue;
      }

      // Loop through each batch for this school
      for (let j = 0; j < batches.length; j++) {
        const currentBatch = batches[j];

        console.log(`  📦 Processing Batch ${j + 1}: ${currentBatch}`);

        let pipelineRegion = [
          {
            $match: {
              _id: new mongoose.Types.ObjectId(schoolObjectId),
            },
          },
          {
            $lookup: {
              from: "students",
              let: { schoolId: "$schoolId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$schoolId", "$$schoolId"] },
                        { $eq: ["$batch", currentBatch] },
                        { $eq: ["$isSlcTaken", false] },
                      ],
                    },
                  },
                },
                { $count: "studentCount" },
              ],
              as: "studentData",
            },
          },
          {
            $lookup: {
              from: "schooldisciplinaries",
              let: { schoolObjectId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$district_block_schoolsObjectId", "$$schoolObjectId"] },
                        { $eq: ["$batch", currentBatch] },
                        { $gte: ["$dateOfRecord", startDate] },
                        { $lte: ["$dateOfRecord", endDate] },
                      ],
                    },
                  },
                },
                {
                  $addFields: {
                    istHour: {
                      $hour: { date: "$createdAt", timezone: "Asia/Kolkata" },
                    },
                  },
                },
                {
                  $facet: {
                    beforeNoon: [
                      { $match: { istHour: { $lt: 12 } } },
                      { $sort: { createdAt: -1 } },
                      { $limit: 1 },
                    ],
                    afterNoon: [
                      { $match: { istHour: { $gte: 12 } } },
                      { $sort: { createdAt: 1 } },
                      { $limit: 1 },
                    ],
                  },
                },
              ],
              as: "disciplinaryData",
            },
          },
          {
            $addFields: {
              studentCount: {
                $ifNull: [{ $arrayElemAt: ["$studentData.studentCount", 0] }, 0],
              },
              disciplinaryBeforeNoon: {
                $arrayElemAt: [{ $arrayElemAt: ["$disciplinaryData.beforeNoon", 0] }, 0],
              },
              disciplinaryAfterNoon: {
                $arrayElemAt: [{ $arrayElemAt: ["$disciplinaryData.afterNoon", 0] }, 0],
              },
            },
          },
          {
            $project: {
              studentData: 0,
              disciplinaryData: 0,
            },
          },
        ];

        const response = await District_Block_School.aggregate(pipelineRegion);

        if (response?.length > 0) {
          const schoolData = response[0];
          const studentCount = schoolData.studentCount || 0;

          // Find applicable point slab
          const applicableRange = GamificationPointLogicForStudentAttendance.find(
            (item) => studentCount >= item.startRange && studentCount <= item.endRange
          );

          const totalPointsForSlab = applicableRange?.point || 0;

          const calculateStatusPoint = (status, totalPoints) => {
            switch (status) {
              case "Poor":
                return -(totalPoints / 2);
              case "Average":
                return 0;
              case "Good":
                return totalPoints / 4;
              case "Excellent":
                return totalPoints / 2;
              default:
                return 0;
            }
          };

          const beforeNoonStatus = schoolData?.disciplinaryBeforeNoon?.status;
          const afterNoonStatus = schoolData?.disciplinaryAfterNoon?.status;

          const beforeNoonPoints = calculateStatusPoint(beforeNoonStatus, totalPointsForSlab);
          const afterNoonPoints = calculateStatusPoint(afterNoonStatus, totalPointsForSlab);

          const point = beforeNoonPoints + afterNoonPoints;

          console.log(`    📊 Student Count: ${studentCount}`);
          console.log(`    📊 Applicable Slab:`, applicableRange);
          console.log(`    📊 Total Slab Points: ${totalPointsForSlab}`);
          console.log(`    📊 Before Noon Status: ${beforeNoonStatus}, Points: ${beforeNoonPoints}`);
          console.log(`    📊 After Noon Status: ${afterNoonStatus}, Points: ${afterNoonPoints}`);
          console.log(`    📊 Final Point: ${point}`);

          allResponses.push(response);
          totalPoints += point;

          // ──────────────────────────────────────────────────────────
          // ✅ CHECK FOR EXISTING DOCUMENTS BEFORE CREATING
          // ──────────────────────────────────────────────────────────

          const gamificationDateObj = new Date(startDate);
          gamificationDateObj.setUTCHours(0, 0, 0, 0);

          // Check if a document already exists for this date, user, batch, and school
          const existingDoc = await GamificationUserPoint.findOne({
            unqObjectId: unqObjectId,
            pointType: "disciplinary",
            batch: currentBatch,
            // "district_block_schoolsObjectId": schoolObjectId,
            gamificationDate: {
              $gte: gamificationDateObj,
              $lt: new Date(gamificationDateObj.getTime() + 24 * 60 * 60 * 1000),
            },
          });
          console.log(req.body)

          if (existingDoc) {
            console.log(`    ⚠️ Document already exists for batch ${currentBatch} and school ${schoolObjectId}. Skipping creation.`);
            createdDocuments.push({
              schoolObjectId,
              batch: currentBatch,
              status: "skipped",
              existingDoc: existingDoc._id,
              point: point
            });
          } else if (point !== 0) {
            // Create new document only if point is not 0
            const createGamificationResponse = await GamificationUserPoint.create({
              unqObjectId: unqObjectId,
              pointType: "disciplinary",
              pointValue: point,
              batch: currentBatch,
              unqIdOfPointObject: applicableRange?._id || null,
              gamificationDate: gamificationDateObj,
              isPointClaimed: true,
              district_block_schoolsObjectId: schoolObjectId, // Store which school this belongs to
            });

            console.log(`    ✅ New document created for batch ${currentBatch}:`, createGamificationResponse._id);
            createdDocuments.push({
              schoolObjectId,
              batch: currentBatch,
              status: "created",
              documentId: createGamificationResponse._id,
              point: point
            });
          } else {
            console.log(`    ℹ️ Point is 0 for batch ${currentBatch}. No document created.`);
            createdDocuments.push({
              schoolObjectId,
              batch: currentBatch,
              status: "skipped_zero_points",
              point: point
            });
          }
        }
      }
    }

    // ──────────────────────────────────────────────────────────────
    // ✅ RESPONSE
    // ──────────────────────────────────────────────────────────────

    // If called as direct function, return the result
    if (isDirectCall) {
      return {
        status: "Ok",
        data: allResponses,
        totalPoints: totalPoints,
        documents: createdDocuments,
        summary: {
          totalSchools: schoolObjectIds.length,
          totalBatches: batches.length,
          totalDocumentsCreated: createdDocuments.filter(d => d.status === "created").length,
          totalSkipped: createdDocuments.filter(d => d.status === "skipped").length,
        }
      };
    }

    // If called as Express middleware, send response
    res.status(200).json({
      status: "Ok",
      data: allResponses,
      totalPoints: totalPoints,
      documents: createdDocuments,
      summary: {
        totalSchools: schoolObjectIds.length,
        totalBatches: batches.length,
        totalDocumentsCreated: createdDocuments.filter(d => d.status === "created").length,
        totalSkipped: createdDocuments.filter(d => d.status === "skipped").length,
      }
    });

  } catch (error) {
    console.log("Error:", error);
    
    // If called as direct function, throw error
    if (isDirectCall) {
      throw error;
    }
    
    // If called as Express middleware, send error response
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
    });
  }
};








// //marks gamification
// export const marks = async (req, res) => {
// console.log("I am in Gamificaition.controler.js, api: marks")

//   const { batch, schoolId, unqObjectId, unqIdOfPointObject, date, marksUploadWithinDaysOfCreationInErp, examAndTestcreatedAt } = req.body;
//   console.log(req.body)
//   //Fetching gamificaiton point logics

//   const responseGamificationPointLogic = await GamificationPointLogic.find({});

//   const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].callingAbsentee

//   // console.log(GamificationPointLogicForStudentAttendance)


//   let startDate;
//   let endDate;

//   const dateConversionFunction = (date) => {

//     startDate = new Date(date)
//     startDate.setUTCHours(0, 0, 0, 0)

//     endDate = new Date(date)
//     endDate.setUTCHours(23, 59, 59, 999)

//   }

//   dateConversionFunction(date)
//   console.log(startDate, endDate)



// const pipeline = [
//   {
//     $match: {
//       batch: batch,
//       schoolId: schoolId
//     }
//   },

//   {
//     $lookup: {
//       from: "studentattendances",

//       let: {
//         studentId: "$_id"
//       },

//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 {
//                   $eq: [
//                     "$unqStudentObjectId",
//                     "$$studentId"
//                   ]
//                 },

//                 {
//                   $gte: ["$date", startDate]
//                 },

//                 {
//                   $lte: ["$date", endDate]
//                 },

//                 {
//                   $eq: ["$status", "Absent"]
//                 },

//                 {
//                   $eq: ["$absenteeCallingStatus", "Connected"]
//                 }
//               ]
//             }
//           }
//         }
//       ],

//       as: "studentAttendanceData"
//     }
//   },

//   {
//     $match: {
//       "studentAttendanceData.0": { $exists: true }
//     }
//   },

//   {
//     $addFields: {
//       maxUpdatedAt: {
//         $max: "$studentAttendanceData.updatedAt"
//       }
//     }
//   }
// ];

//   try {
//     const response = await Student.aggregate(pipeline)
//     const studentAbsentConnectedCount = response.length
//     console.log(studentAbsentConnectedCount)

//     // console.log("i am max time", response[0].maxUpdatedAt)
//     // let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt
// if (response.length === 0) {
//   return res.status(404).json({
//     status: "Fail",
//     message: "No attendance data found for this date"
//   });
// }

// console.log("i am max time", response[0].maxUpdatedAt)

// //below fetches max absentee calling done time
// let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt
//     const istTime = new Date(maxAttendanceMarkDateAndTime)

//     const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,

//     })

//     console.log(maxAttendanceMarkingHours)

//     const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",")
//     const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("")
//     console.log(maxAttendanceTimeInNumber)

//     //now comparing this studentAttendanceCount with GamificationPointLogicForStudentAttendance to assing pointValue

//     let point;
//     let unqIdOfPointObject;

//     for (let i = 0; i <= studentAbsentConnectedCount; i++) {
//       if (studentAbsentConnectedCount >= GamificationPointLogicForStudentAttendance[i].startRange && studentAbsentConnectedCount <= GamificationPointLogicForStudentAttendance[i].endRange) {

//         //Checking validation for negative marking
//         if (maxAttendanceTimeInNumber > Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join(""))) {
//           point = -15
//           console.log("i am herer")
//           break;
//         }

//         console.log(Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join("")))
//         point = GamificationPointLogicForStudentAttendance[i].point
//         unqIdOfPointObject = GamificationPointLogicForStudentAttendance[i]._id
//         console.log(point)

//         break;
//       }
//     }



//     //Now we have the point now we update the gamificationuserpoints collection

//     //first we check if the doc already exist for the unqObjectId, batch, gamificationDate, pointType

//     const studentAttendanceExist = await GamificationUserPoint.find({
//       unqObjectId: unqObjectId, batch: batch, gamificationDate: {
//         $gte: startDate,
//         $lte: endDate
//       },
//       pointType: "callingAbsentee"
//     })

//     if (studentAttendanceExist.length > 0) {

//       // console.log(studentAttendanceExist[0].)

//       const response = await GamificationUserPoint.findOneAndUpdate({
//         unqObjectId: unqObjectId, batch: batch, gamificationDate: {
//           $gte: startDate,
//           $lte: endDate
//         },
//         pointType: "callingAbsentee"
//       }, {
//         $set: {
//           pointValue: point
//         }
//       })
//     } else {
//       const response = await GamificationUserPoint.create({
//         unqObjectId: unqObjectId,
//         pointType: "callingAbsentee",
//         pointValue: point,
//         batch: batch,
//         unqIdOfPointObject: unqIdOfPointObject,
//         gamificationDate: date
//       })
//     }

//     res.status(200).json({ status: "Ok", data: response })
//   } catch (error) {
//     console.log(error)
//   }
// }



//marks gamification
export const marks = async (req, res) => {
  console.log("I am in Gamificaition.controler.js, api: marks");

  // Handle both scenarios: Express middleware or direct function call
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    payload = req.body;
  } else if (req && req.pointType) {
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to marks function");
    if (res) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid request payload"
      });
    }
    throw new Error("Invalid request payload");
  }

  const { 
    batch, 
    schoolId, 
    unqObjectId, 
    date, 
    marksUploadWithinDaysOfCreationInErp, 
    examAndTestcreatedAt,
    examId,
    examType,
    subject,
    studentId,
    marksObtained,
    maxMarks
  } = payload;
  
  console.log("Marks payload:", payload);

  // ──────────────────────────────────────────────────────────────
  // ✅ VALIDATION: Check if marksUploadWithinDaysOfCreationInErp exists
  // ──────────────────────────────────────────────────────────────
  
  if (!marksUploadWithinDaysOfCreationInErp || marksUploadWithinDaysOfCreationInErp === 0 || marksUploadWithinDaysOfCreationInErp === null) {
    console.log("⚠️ marksUploadWithinDaysOfCreationInErp is 0, null, or doesn't exist. Skipping gamification.");
    
    const skipResult = {
      status: "Skipped",
      message: "marksUploadWithinDaysOfCreationInErp is 0, null, or doesn't exist. No gamification awarded.",
      pointValue: 0,
      daysTaken: 0,
      deadline: marksUploadWithinDaysOfCreationInErp
    };

    if (isDirectCall) {
      return skipResult;
    }
    
    return res.status(200).json({ 
      status: "Ok", 
      data: skipResult 
    });
  }

  // ──────────────────────────────────────────────────────────────
  // ✅ VALIDATION: Check if examAndTestcreatedAt exists
  // ──────────────────────────────────────────────────────────────
  
  if (!examAndTestcreatedAt) {
    console.log("⚠️ examAndTestcreatedAt is missing. Skipping gamification.");
    
    const skipResult = {
      status: "Skipped",
      message: "examAndTestcreatedAt is missing. No gamification awarded.",
      pointValue: 0,
      daysTaken: 0,
      deadline: marksUploadWithinDaysOfCreationInErp
    };

    if (isDirectCall) {
      return skipResult;
    }
    
    return res.status(200).json({ 
      status: "Ok", 
      data: skipResult 
    });
  }

  // ──────────────────────────────────────────────────────────────
  // ✅ FETCH GAMIFICATION POINT LOGICS
  // ──────────────────────────────────────────────────────────────
  
  const responseGamificationPointLogic = await GamificationPointLogic.find({});
  const GamificationPointLogicForMarks = responseGamificationPointLogic[0]?.marks || [];

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  };

  dateConversionFunction(date);
  console.log("Start Date:", startDate, "End Date:", endDate);

  // ──────────────────────────────────────────────────────────────
  // ✅ CALCULATE DAYS TAKEN TO UPLOAD MARKS
  // ──────────────────────────────────────────────────────────────

  try {
    let point = 0;
    let unqIdOfPointObjectFinal = null;
    let performanceLevel = "";
    let daysTaken = 0;
    let isLate = false;
    let matchedRange = null;

    // Calculate days difference
    const examCreatedDate = new Date(examAndTestcreatedAt);
    const marksUploadDate = new Date(date || new Date());
    
    // Calculate days difference
    const diffTime = Math.abs(marksUploadDate - examCreatedDate);
    daysTaken = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`📊 Days taken to upload marks: ${daysTaken} days`);
    console.log(`📊 Deadline: ${marksUploadWithinDaysOfCreationInErp} days`);

    const deadline = marksUploadWithinDaysOfCreationInErp;

    // ──────────────────────────────────────────────────────────────
    // ✅ CHECK IF DEADLINE IS EXCEEDED
    // ──────────────────────────────────────────────────────────────
    
    // First, find the matching range based on daysTaken
    let foundRange = false;
    if (GamificationPointLogicForMarks && Array.isArray(GamificationPointLogicForMarks)) {
      for (let i = 0; i < GamificationPointLogicForMarks.length; i++) {
        const logic = GamificationPointLogicForMarks[i];
        if (daysTaken >= logic.startRange && daysTaken <= logic.endRange) {
          matchedRange = logic;
          foundRange = true;
          console.log(`✅ Found matching range: ${logic.startRange}-${logic.endRange}`);
          break;
        }
      }
    }

    if (daysTaken > deadline) {
      // Deadline exceeded - use negativeMarkingOnBreakingTimeValidation
      console.log(`⚠️ Deadline exceeded! Days taken: ${daysTaken}, Deadline: ${deadline}`);
      isLate = true;
      
      if (foundRange && matchedRange) {
        // Use the negativeMarkingOnBreakingTimeValidation value
        point = matchedRange.negativeMarkingOnBreakingTimeValidation || -15;
        unqIdOfPointObjectFinal = matchedRange._id;
        performanceLevel = "Late (Penalty)";
        console.log(`✅ Using penalty points: ${point} (negativeMarkingOnBreakingTimeValidation)`);
      } else {
        // Fallback: Calculate penalty
        const lateDays = daysTaken - deadline;
        point = -(lateDays * 2); // -2 points per day late
        performanceLevel = "Late (Calculated)";
        console.log(`⚠️ No matching range found. Calculated penalty: ${point}`);
      }
    } else {
      // Within deadline - use regular point
      console.log(`✅ Within deadline! Days taken: ${daysTaken}, Deadline: ${deadline}`);
      
      if (foundRange && matchedRange) {
        // Use the regular point value
        point = matchedRange.point || 0;
        unqIdOfPointObjectFinal = matchedRange._id;
        performanceLevel = "On Time";
        console.log(`✅ Using regular points: ${point}`);
      } else {
        // Fallback: Calculate bonus
        const earlyBonus = deadline - daysTaken + 1;
        point = earlyBonus * 2; // 2 points per day early
        performanceLevel = "Early (Calculated)";
        console.log(`⚠️ No matching range found. Calculated bonus: ${point}`);
      }
    }

    console.log(`📊 Final Point: ${point}, Performance: ${performanceLevel}`);

    // ──────────────────────────────────────────────────────────────
    // ✅ CHECK FOR EXISTING GAMIFICATION RECORD
    // ──────────────────────────────────────────────────────────────

    const gamificationDateObj = new Date(startDate);
    gamificationDateObj.setUTCHours(0, 0, 0, 0);

    // Build the query
    const query = {
      unqObjectId: unqObjectId,
      pointType: "marks",
      batch: batch,
      gamificationDate: {
        $gte: gamificationDateObj,
        $lt: new Date(gamificationDateObj.getTime() + 24 * 60 * 60 * 1000)
      }
    };

    // Add examId and studentId if provided
    if (examId) query.examId = examId;
    if (studentId) query.studentId = studentId;

    // Check if gamification already exists
    const existingGamification = await GamificationUserPoint.findOne(query);

    let response = null;

    if (existingGamification) {
      console.log(`⚠️ Gamification already exists for this exam-student combination. Updating points.`);
      
      // Update existing record
      const updateData = {
        pointValue: point,
        unqIdOfPointObject: unqIdOfPointObjectFinal || null,
        isPointClaimed: true,
        schoolId: schoolId,
        batch: batch,
        isLate: isLate,
        daysTaken: daysTaken,
        deadline: deadline,
        performanceLevel: performanceLevel
      };

      // Add metadata
      updateData.metadata = {
        examId: examId,
        examType: examType,
        subject: subject,
        studentId: studentId,
        marksObtained: marksObtained,
        maxMarks: maxMarks,
        daysTaken: daysTaken,
        deadline: deadline,
        performanceLevel: performanceLevel,
        schoolId: schoolId,
        isLate: isLate,
        examCreatedDate: examCreatedDate,
        marksUploadDate: marksUploadDate,
        matchedRange: matchedRange ? {
          startRange: matchedRange.startRange,
          endRange: matchedRange.endRange,
          point: matchedRange.point,
          negativeMarkingOnBreakingTimeValidation: matchedRange.negativeMarkingOnBreakingTimeValidation
        } : null
      };

      response = await GamificationUserPoint.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true }
      );
      
      console.log(`✅ Updated existing gamification record:`, response._id);
    } else {
      // Create new gamification record
      const gamificationData = {
        unqObjectId: unqObjectId,
        pointType: "marks",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObjectFinal || null,
        gamificationDate: gamificationDateObj,
        isPointClaimed: true,
        schoolId: schoolId,
        isLate: isLate,
        daysTaken: daysTaken,
        deadline: deadline,
        performanceLevel: performanceLevel
      };

      // Add examId and studentId if provided
      if (examId) gamificationData.examId = examId;
      if (studentId) gamificationData.studentId = studentId;

      // Add metadata
      gamificationData.metadata = {
        examId: examId,
        examType: examType,
        subject: subject,
        studentId: studentId,
        marksObtained: marksObtained,
        maxMarks: maxMarks,
        daysTaken: daysTaken,
        deadline: deadline,
        performanceLevel: performanceLevel,
        schoolId: schoolId,
        isLate: isLate,
        examCreatedDate: examCreatedDate,
        marksUploadDate: marksUploadDate,
        matchedRange: matchedRange ? {
          startRange: matchedRange.startRange,
          endRange: matchedRange.endRange,
          point: matchedRange.point,
          negativeMarkingOnBreakingTimeValidation: matchedRange.negativeMarkingOnBreakingTimeValidation
        } : null
      };

      response = await GamificationUserPoint.create(gamificationData);
      console.log(`✅ New marks gamification created:`, response._id);
    }

    // ──────────────────────────────────────────────────────────────
    // ✅ RESPONSE
    // ──────────────────────────────────────────────────────────────

    const result = {
      status: "Success",
      message: existingGamification ? "Gamification updated successfully" : "Gamification awarded successfully",
      pointValue: point,
      performanceLevel: performanceLevel,
      daysTaken: daysTaken,
      deadline: deadline,
      isLate: isLate,
      matchedRange: matchedRange ? {
        startRange: matchedRange.startRange,
        endRange: matchedRange.endRange,
        regularPoint: matchedRange.point,
        penaltyPoint: matchedRange.negativeMarkingOnBreakingTimeValidation,
        usedPoint: point
      } : null,
      gamificationId: response._id
    };

    if (isDirectCall) {
      return result;
    }

    res.status(200).json({ 
      status: "Ok", 
      data: result 
    });

  } catch (error) {
    console.log("Error in marks:", error);
    
    if (isDirectCall) {
      throw error;
    }
    
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
    });
  }
};

// export const ClaimGamificationPoint = (req, res) =>{

//   console.log("I am inside Gamification.controller.js, api: ClaimGamificationPoint")
// const {pointType} = req.body;

// console.log(req.body)

//   try {
    
//     if (pointType === "selfAttendance"){

//       return selfAttendancePoint(req, res)


//     } else if (pointType === "studentAttendance"){

//       return studentAttendance(req, res);

//     } else if (pointType === "uploadPdf"){

//         return pdfUpload (req, res);

//     }else if (pointType === "callingAbsentee"){

//         return callingAbsentee(req, res);

//     } else if (pointType === "disciplinary"){
      
//       return disciplinary(req, res);
//     }




//     // res.status(200).json({status:"Ok", data:"functon ran"})
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({status:"failed", data:"error occured"})
//   }
// }



export const ClaimGamificationPoint = async (req, res) => {
  console.log("I am inside Gamification.controller.js, api: ClaimGamificationPoint");
  
  // Handle both scenarios
  let payload;
  let isDirectCall = false;
  
  if (req && req.body) {
    // Called as Express middleware
    payload = req.body;
  } else if (req && req.pointType) {
    // Called as direct function with payload
    payload = req;
    isDirectCall = true;
  } else {
    console.error("Invalid call to ClaimGamificationPoint");
    if (res) {
      return res.status(400).json({ status: "failed", message: "Invalid request" });
    }
    return { status: "failed", message: "Invalid request" };
  }

  const { pointType } = payload;
  console.log("Received payload:", payload);

  try {
    let result;
    
    if (pointType === "selfAttendance") {
      result = await selfAttendancePoint(payload, isDirectCall ? null : res);
    } else if (pointType === "studentAttendance") {
      result = await studentAttendance(payload, isDirectCall ? null : res);
    } else if (pointType === "uploadPdf") {
      result = await pdfUpload(payload, isDirectCall ? null : res);
    } else if (pointType === "callingAbsentee") {
      result = await callingAbsentee(payload, isDirectCall ? null : res);
    } else if (pointType === "disciplinary") {
      result = await disciplinary(payload, isDirectCall ? null : res);
    }  else if (pointType === "marks") {
      result = await marks(payload, isDirectCall ? null : res);
    } 
    else {
      throw new Error(`Unknown pointType: ${pointType}`);
    }
    
    // If direct call, return result
    if (isDirectCall) {
      return result;
    }
    
    // If Express middleware, send response
    res.status(200).json({ status: "Ok", data: result });
  } catch (error) {
    console.log("Error in ClaimGamificationPoint:", error);
    if (isDirectCall) {
      throw error;
    }
    res.status(500).json({ status: "failed", error: error.message });
  }
};



export const fetchUserGamificationPoints = async (req, res) => {
  console.log(
    "i am in Gamification.controller.js, api: fetchUserGamificationPoints"
  );

  const { unqObjectId, startDate, endDate } = req.body;

  console.log(req.body);

  try {
    let matchQuery = {
      unqObjectId: new mongoose.Types.ObjectId(unqObjectId),
    };

    // MAIN RANGE FILTER (existing logic)
    if (startDate && endDate) {
      matchQuery.gamificationDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // =========================
    // 1. MAIN AGGREGATION (TOTAL)
    // =========================
    const response = await GamificationUserPoint.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$pointType",
          totalPoints: { $sum: "$pointValue" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const grandTotal = response.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );

    // =========================
    // 2. CURRENT DAY / RANGE BREAKDOWN
    // =========================

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let currentDayMatch = {
      unqObjectId: new mongoose.Types.ObjectId(unqObjectId),
      gamificationDate: {
        $gte: startDate && endDate ? new Date(startDate) : todayStart,
        $lte: startDate && endDate ? new Date(endDate) : todayEnd,
      },
    };

    const currentDayAgg = await GamificationUserPoint.aggregate([
      {
        $match: currentDayMatch,
      },
      {
        $group: {
          _id: "$pointType",
          totalPoints: { $sum: "$pointValue" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    // Convert to lookup map (frontend friendly)
    const currentDayPoint = currentDayAgg.reduce((acc, item) => {
      acc[item._id] = {
        totalPoints: item.totalPoints,
        totalRecords: item.totalRecords,
      };
      return acc;
    }, {});

    // =========================
    // RESPONSE (UNCHANGED + NEW FIELD)
    // =========================

    res.status(200).json({
      status: "Ok",

      totalPoints: grandTotal,

      pointTypeBreakdown: response,

      // NEW FIELD (safe addition)
      currentDayPoint,
    });

    console.log(response);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "Failed",
      error,
    });
  }
};

















export const gamificationDashboardV2 = async (req, res) => {
  console.log("I am in gamificationDashboardV2 API");

  try {
    const { month, year, schoolId, districtId, blockId } = req.body;

    // ──────────────────────────────────────────────────────────────
    // ✅ SET MONTH AND YEAR (default to current month)
    // ──────────────────────────────────────────────────────────────

    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    // Calculate start and end date of the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(targetYear, targetMonth, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log(`📅 Fetching data for: ${targetMonth}-${targetYear}`);
    console.log(`📅 Date Range: ${startDate} to ${endDate}`);

    // ──────────────────────────────────────────────────────────────
    // ✅ AGGREGATION PIPELINE
    // ──────────────────────────────────────────────────────────────

    const pipeline = [
      // Step 1: Match only active CC users
      {
        $match: {
          role: "CC",
          isActive: true
        }
      },

      // Step 2: Lookup user access
      {
        $lookup: {
          from: "useraccesses",
          localField: "_id",
          foreignField: "unqObjectId",
          as: "userAccess"
        }
      },

      // Step 3: Unwind userAccess
      {
        $unwind: {
          path: "$userAccess",
          preserveNullAndEmptyArrays: false
        }
      },

      // Step 4: Unwind region and schoolIds for filtering
      {
        $unwind: "$userAccess.region"
      },
      {
        $unwind: "$userAccess.region.blockIds"
      },
      {
        $unwind: "$userAccess.region.blockIds.schoolIds"
      },

      // Step 5: Apply region filters if provided
      ...(districtId ? [{
        $match: {
          "userAccess.region.districtId": districtId
        }
      }] : []),
      ...(blockId ? [{
        $match: {
          "userAccess.region.blockIds.blockId": blockId
        }
      }] : []),
      ...(schoolId ? [{
        $match: {
          "userAccess.region.blockIds.schoolIds.schoolId": schoolId
        }
      }] : []),

      // Step 6: Group back to combine schoolIds per user
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          name: { $first: "$name" },
          email: { $first: "$email" },
          role: { $first: "$role" },
          contact1: { $first: "$contact1" },
          avgScore: { $first: "$avgScore" },
          rank: { $first: "$rank" },
          isActive: { $first: "$isActive" },
          userAccess: { $first: "$userAccess" },
          schools: {
            $addToSet: {
              districtId: "$userAccess.region.districtId",
              blockId: "$userAccess.region.blockIds.blockId",
              schoolId: "$userAccess.region.blockIds.schoolIds.schoolId"
            }
          }
        }
      },

      // Step 7: Lookup school details from district_block_schools
      {
        $lookup: {
          from: "district_block_schools",
          let: { schoolIds: "$schools" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$schoolId", "$$schoolIds.schoolId"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                districtId: 1,
                districtName: 1,
                blockId: 1,
                blockName: 1,
                schoolId: 1,
                schoolName: 1,
                isCenterClosed: 1
              }
            }
          ],
          as: "schoolDetails"
        }
      },

      // Step 8: Lookup gamification points for this user in the given month
      {
        $lookup: {
          from: "gamificationuserpoints",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$unqObjectId", "$$userId"] },
                    { $eq: ["$isPointClaimed", true] },
                    { $gte: ["$gamificationDate", startDate] },
                    { $lte: ["$gamificationDate", endDate] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalPoints: { $sum: "$pointValue" },
                records: { $push: "$$ROOT" },
                count: { $sum: 1 }
              }
            }
          ],
          as: "gamificationData"
        }
      },

      // Step 9: Add fields for easier access
      {
        $addFields: {
          gamificationTotalPoints: {
            $ifNull: [{ $arrayElemAt: ["$gamificationData.totalPoints", 0] }, 0]
          },
          gamificationRecords: {
            $ifNull: [{ $arrayElemAt: ["$gamificationData.records", 0] }, []]
          },
          gamificationCount: {
            $ifNull: [{ $arrayElemAt: ["$gamificationData.count", 0] }, 0]
          }
        }
      },

      // Step 10: Project final structure
      {
        $project: {
          _id: 1,
          userId: 1,
          name: 1,
          email: 1,
          role: 1,
          contact1: 1,
          avgScore: 1,
          rank: 1,
          isActive: 1,
          batches: "$userAccess.batch",
          schoolDetails: 1,
          gamificationTotalPoints: 1,
          gamificationRecords: 1,
          gamificationCount: 1
        }
      },

      // Step 11: Sort by total points (descending)
      {
        $sort: {
          gamificationTotalPoints: -1
        }
      }
    ];

    // ──────────────────────────────────────────────────────────────
    // ✅ EXECUTE AGGREGATION
    // ──────────────────────────────────────────────────────────────

    const usersData = await User.aggregate(pipeline);

    console.log(`✅ Found ${usersData.length} CC users with data`);

    // ──────────────────────────────────────────────────────────────
    // ✅ PROCESS DATA FOR RESPONSE
    // ──────────────────────────────────────────────────────────────

    const processedUsers = usersData.map(user => {
      // Calculate total points
      const totalPoints = user.gamificationTotalPoints || 0;
      const recordCount = user.gamificationCount || 0;

      return {
        user: {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          contact1: user.contact1,
          avgScore: user.avgScore || 0,
          rank: user.rank || 0
        },
        batches: user.batches || [],
        schoolDetails: user.schoolDetails || [],
        gamificationSummary: {
          totalPoints: totalPoints,
          recordCount: recordCount,
          averagePoints: recordCount > 0 ? totalPoints / recordCount : 0
        },
        // Optional: Include records if needed (can be removed if too heavy)
        // records: user.gamificationRecords || []
      };
    });

    // ──────────────────────────────────────────────────────────────
    // ✅ OVERALL SUMMARY
    // ──────────────────────────────────────────────────────────────

    const totalUsers = processedUsers.length;
    const totalPoints = processedUsers.reduce((sum, user) => sum + user.gamificationSummary.totalPoints, 0);
    const totalRecords = processedUsers.reduce((sum, user) => sum + user.gamificationSummary.recordCount, 0);

    const overallSummary = {
      totalUsers: totalUsers,
      totalPoints: totalPoints,
      totalRecords: totalRecords,
      averagePointsPerUser: totalUsers > 0 ? totalPoints / totalUsers : 0,
      topPerformer: totalUsers > 0 ? processedUsers.reduce((max, user) => 
        user.gamificationSummary.totalPoints > max.gamificationSummary.totalPoints ? user : max
      ) : null
    };

    // ──────────────────────────────────────────────────────────────
    // ✅ FINAL RESPONSE
    // ──────────────────────────────────────────────────────────────

    const responseData = {
      status: "Success",
      data: {
        month: targetMonth,
        year: targetYear,
        dateRange: {
          startDate: startDate,
          endDate: endDate
        },
        filters: {
          schoolId: schoolId || null,
          districtId: districtId || null,
          blockId: blockId || null
        },
        overallSummary: overallSummary,
        users: processedUsers
      }
    };

    console.log("✅ Dashboard data prepared successfully");
    res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Error in gamificationDashboardV2:", error);
    res.status(500).json({
      status: "Failed",
      error: error.message || error,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};