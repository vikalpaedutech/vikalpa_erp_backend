import mongoose from "mongoose";
import { GamificationPointLogic, GamificationUserPoint } from "../models/gamification.model.js";

import { UserAttendance } from "../models/userAttendnace.model.js";

import { Student } from "../models/student.model.js"
import { District_Block_School } from "../models/district_block_school.model.js";
import { SchoolDisciplinary } from "../models/schoolDisciplinary.model.js";
import { ReturnDocument } from "mongodb";

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





// //Point assignments logic.
// //This runs a function, taking user object id, then updates the point corrresponding

// export const GamificationPointAssigningToUsers = async (req, res) => {
// console.log("helloo")
// const {userObjectId} = req.body;

// //variable to store point value of user, pointType, classOfCenter.

// let pointValue;

// const pointType = 'SelfAttendance'
// const classOfCenter = '8'

// console.log(req.body)


//   try {
//     const response = await GamificationPointLogic.find({})


//     //Giving points to attendance on current date and gamification logic

// const start = new Date();
// start.setHours(0,0,0,0);

// const end = new Date();
// end.setHours(23,59,59,999);

// const userAttendanceResponse = await UserAttendance.find({
//   unqUserObjectId: userObjectId,
//   date: {
//     $gte: start,
//     $lte: end
//   }
// });




//     // res.status(200).json({status:'Ok', data: response, data2: userAttendanceResponse})

//     //  res.status(200).json({status:'Ok', data: response[0].selfAttendance})



//           console.log(userAttendanceResponse[0].createdAt)


//           //extracting time in hr:mm format, from utc to local time
//           const userAttendanceTime =  userAttendanceResponse[0].loginTime.toLocaleTimeString('en-In',
//             {
//               timeZone: 'Asia/Kolkata',
//               hour: '2-digit',
//               minute: '2-digit',
//               hour12: false
//             }
//           )


//           //turning hh, mm into array and then joining them to make a number
//           console.log(userAttendanceTime.split(':'))
//           const userAttendanceTimeInNumber = userAttendanceTime.split(':').join('')
//           console.log(Number(userAttendanceTimeInNumber))


//           //Loop to check in which time interval user times lie...and assigning point
//           for (let i=0; i<5; i++ ){

//             console.log(i)



//             console.log(response[0].selfAttendance[i])


//           //extracting time in hr:mm format, start time and end time
//             const startTimeInNumber = response[0].selfAttendance[i].startTime.split(':').join('')
//             const endTimeInNumber = response[0].selfAttendance[i].endTime.split(':').join('')

//             //time validation conversion into number format

//             const timeValidationInNumber = response[0].selfAttendance[i].timeValidation.split(':').join('')

//           console.log(Number(startTimeInNumber))
//           console.log(Number(endTimeInNumber))
//           console.log(Number(userAttendanceTimeInNumber))
//           console.log(Number(timeValidationInNumber))


//             if (timeValidationInNumber<=userAttendanceTimeInNumber){

//               console.log('i am okay')

//               pointValue = response[0].selfAttendance[i].negativeMarkingOnBreakingTimeValidation;

//               console.log(pointValue)
//               break;
//             }

//             if (startTimeInNumber < userAttendanceTimeInNumber && endTimeInNumber < userAttendanceTimeInNumber ){
//               console.log("i am true")
//             } else {
//                 console.log(' i am in else block')
//                 console.log(i)
//                 pointValue = response[0].selfAttendance[i].point

//                 break;
//             }

//           }

//           console.log(pointValue)
//            res.status(200).json({status:'Ok', data:response[0].selfAttendance[0] })



//   } catch (error) {
//     res.status(500).json({status:"Failed", message: "Internal server error", error: error.message})
//   }
// }





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


export const selfAttendancePoint = async (req, res) => {

  console.log("i am inside Gamification.controller.js, api: selfAttendancePoint")

  const { unqObjectId, batch, unqIdOfPointObject, date } = req.body;

  console.log(req.body)

  //logic building for point assigning

  //fetching user attendance time for holding it in a const.
  //then fetches "gamificationuserpoints", which contains logic to match with
  //then we match the point types with different times ad ranges to asign pints.


  //Fetching gamificaiton point logics

  const responseGamificationPointLogic = await GamificationPointLogic.find({});

  const GamificationPointLogicForAttendance = responseGamificationPointLogic[0].selfAttendance

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {
    startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
  }

  dateConversionFunction(date)

  console.log(startDate, endDate)
  //Fetching student time

  const responseAttendance = await UserAttendance.find({
    unqUserObjectId: unqObjectId, date: {
      $gte: startDate,
      $lte: endDate
    }
  })

  const userAttendanceTime = responseAttendance[0].date

  //converting user time to hh:mm format

  const istTime = new Date(userAttendanceTime)

  const userHours = istTime.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,

  })

  const userTimeInNumbers = Number(userHours.split(",")[1].split(":").join(""))


  console.log(GamificationPointLogicForAttendance)

  console.log("i am user login attendance", userTimeInNumbers)

  //Logic for point assignment by compring userTimeInNumbers to GamificationPointLogicForAttendance

  let userPoint;
  let unqIdOfPoint;
  //Loop for assigning points

  for (let i = 0; i < GamificationPointLogicForAttendance.length; i++) {

    if (userTimeInNumbers >= (GamificationPointLogicForAttendance[i].startTime.split(":").join(""))
      && userTimeInNumbers <= (GamificationPointLogicForAttendance[i].endTime.split(":").join(""))) {

      console.log(GamificationPointLogicForAttendance[i].startTime.split(":").join(""))
      console.log(GamificationPointLogicForAttendance[i].endTime.split(":").join(""))
      userPoint = GamificationPointLogicForAttendance[i].point

      unqIdOfPoint = GamificationPointLogicForAttendance[i]._id

      break;
    }

  }
  console.log("hulalal", userPoint)

  //Creating GamificationUserPoint doc in same collection

  try {

    //checking if point already exist or not.
    const pointExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId, createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "SelfAttendance"
    })

    if (pointExist.length > 0) {
      console.log(pointExist.length)

      const response = await GamificationUserPoint.findOneAndUpdate(
        {
          unqObjectId: unqObjectId, createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        },
        {
          $set: {
            pointValue: userPoint
          }
        }

      )
    } else {
      //Else creating new object to update in db
      console.log("i am inside else")
      const response222 = await GamificationUserPoint.create(
        {
          unqObjectId: unqObjectId,
          batch: null, //batch
          gamificationDate: new Date(),
          pointType: "selfAttendance",
          pointValue: userPoint,
          unqIdOfPointObject: unqIdOfPoint,
          isPointClaimed:true
        }
      )

    }

    res.status(200).json({ status: "Ok", dataAtt: responseAttendance, data: responseGamificationPointLogic[0].selfAttendance })


  } catch (error) {
    console.log('error occured', error)
  }

}






//This api gives point to user on the basis of studentAttendance of their classes


export const studentAttendance = async (req, res) => {

  const { batch, schoolId, unqObjectId, unqIdOfPointObject, date } = req.body;
  console.log(req.body)
  //Fetching gamificaiton point logics

  const responseGamificationPointLogic = await GamificationPointLogic.find({});

  const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].studentAttendance

  // console.log(GamificationPointLogicForStudentAttendance)


  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {

    startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)

  }

  dateConversionFunction(date)
  console.log(startDate, endDate)


  //Finding total present student in a school by batch & schoolId
  //Aggeregating students data with req.body studentAttendances

  let pipeLine;
  // pipeLine = [
  //   {
  //     $match:{
  //       batch:batch,
  //       schoolId: schoolId
  //     }
  //   },
  //  {
  //   $lookup:{
  //     form:"studentattendances",
  //     localField: "_id",
  //     foreignField: "unqStudentObjectId",
  //     as:"studentAttendanceData"
  //   }
  //  }
  // ]


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
    const response = await Student.aggregate(pipeline)
    const studentAttendanceCount = response.length
    console.log(studentAttendanceCount)

    console.log("i am max time", response[0].maxUpdatedAt)
    let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt

    const istTime = new Date(maxAttendanceMarkDateAndTime)

    const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,

    })

    console.log(maxAttendanceMarkingHours)

    const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",")
    const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("")
    console.log(maxAttendanceTimeInNumber)

    //now comparing this studentAttendanceCount with GamificationPointLogicForStudentAttendance to assing pointValue

    let point;
    let unqIdOfPointObject;

    for (let i = 0; i <= studentAttendanceCount; i++) {
      if (studentAttendanceCount >= GamificationPointLogicForStudentAttendance[i].startRange && studentAttendanceCount <= GamificationPointLogicForStudentAttendance[i].endRange) {

        //Checking validation for negative marking
        if (maxAttendanceTimeInNumber > Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join(""))) {
          point = -15
          console.log("i am herer")
          break;
        }

        console.log(Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join("")))
        point = GamificationPointLogicForStudentAttendance[i].point
        unqIdOfPointObject = GamificationPointLogicForStudentAttendance[i]._id
        console.log(point)

        break;
      }
    }



    //Now we have the point now we update the gamificationuserpoints collection

    //first we check if the doc already exist for the unqObjectId, batch, gamificationDate, pointType

    const studentAttendanceExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId, batch: batch, gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "studentAttendance"
    })

    if (studentAttendanceExist.length > 0) {

      // console.log(studentAttendanceExist[0].)

      const response = await GamificationUserPoint.findOneAndUpdate({
        unqObjectId: unqObjectId, batch: batch, gamificationDate: {
          $gte: startDate,
          $lte: endDate
        },
        pointType: "studentAttendance"
      }, {
        $set: {
          pointValue: point
        }
      })
    } else {
      const response = await GamificationUserPoint.create({
        unqObjectId: unqObjectId,
        pointType: "studentAttendance",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObject,
        gamificationDate: date,
        isPointClaimed:true
        
      })
    }

    res.status(200).json({ status: "Ok", data: response })
  } catch (error) {
    console.log(error)
  }
}





export const pdfUpload = async (req, res) => {
  console.log("i am in Gamification.controller.js, api: pdfUpload")

  const { batch, unqObjectId, schoolId, date } = req.body;
  console.log(req.body)
  //fetching gamificationpointlogics

  const fetchGamificationPointLogic = await GamificationPointLogic.find({})

  console.log(fetchGamificationPointLogic[0].pdfUpload[0])

  const pdfUploadTimeValidation = Number(fetchGamificationPointLogic[0].pdfUpload[0].timeValidation.split(":").join(""))
  console.log(pdfUploadTimeValidation)

  let unqIdOfPointObject;
  unqIdOfPointObject = fetchGamificationPointLogic[0].pdfUpload[0]._id
  //Date conversion

  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {

    startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)
  }

  dateConversionFunction(date);

  console.log(startDate, endDate)

  //Creating pipeline that aggregates district_block_schools with attendancePdfs and fetches updatedAt and maxUpdatedat for point assignment
  let pipeline;

  pipeline = [
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
    const response = await District_Block_School.aggregate(pipeline)

console.log(response)
    //pdf time conversion in to number for comparison and poin assignment

    const pdfTime = response[0].pdfDetails[0].createdAt





    //Taking out just the time in hh:mm from pdfTime
    const istTime = new Date(pdfTime)

    const pdfUploadInHHmm = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,

    })

    let point;

    const pdfUploadInHHmmInNumber = Number(pdfUploadInHHmm.split(",")[1].split(":").join(""))

    console.log(pdfUploadInHHmmInNumber)


    //Comparing times of upload with gamificationpointlogic time number values and updating or creating it in gamificatinuserpoints
    if (pdfUploadInHHmmInNumber > pdfUploadTimeValidation) {
      console.log("in tru")
      point = -5
    } else {
      console.log("in else")
      point = 5
    }

    //Now chcking if the object already exist in gamificationuserpoints by unqObjectId, pointType, batch, gamificationDate


    const pdfUploadExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId, gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "uploadPdf",
      batch: batch
    })

    if (pdfUploadExist.length > 0) {
      const updateResponse = await GamificationUserPoint.findOneAndUpdate({
        unqObjectId: unqObjectId, gamificationDate: {
          $gte: startDate,
          $lte: endDate
        },
        pointType: "uploadPdf",
        batch: batch
      },
        {
          $set: {
            pointValue: point
          }
        }
      )
    } else {
      const createResponse = await GamificationUserPoint.create({
        unqObjectId: unqObjectId,
        pointType: "uploadPdf",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObject,
        gamificationDate: new Date()


      })
    }


    res.status(200).json({ status: "Ok", data: response })
  } catch (error) {
    console.log(error)
  }
}







export const callingAbsentee = async (req, res) => {

  console.log("I am in Gamificaition.controler.js, api: callingAbsentee")

  const { batch, schoolId, unqObjectId, unqIdOfPointObject, date } = req.body;
  console.log(req.body)
  //Fetching gamificaiton point logics

  const responseGamificationPointLogic = await GamificationPointLogic.find({});

  const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].callingAbsentee

  // console.log(GamificationPointLogicForStudentAttendance)


  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {

    startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)

  }

  dateConversionFunction(date)
  console.log(startDate, endDate)


  //Finding total present student in a school by batch & schoolId
  //Aggeregating students data with req.body studentAttendances

  let pipeLine;
  // pipeLine = [
  //   {
  //     $match:{
  //       batch:batch,
  //       schoolId: schoolId
  //     }
  //   },
  //  {
  //   $lookup:{
  //     form:"studentattendances",
  //     localField: "_id",
  //     foreignField: "unqStudentObjectId",
  //     as:"studentAttendanceData"
  //   }
  //  }
  // ]

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
    const response = await Student.aggregate(pipeline)
    const studentAbsentConnectedCount = response.length
    console.log(studentAbsentConnectedCount)

    // console.log("i am max time", response[0].maxUpdatedAt)
    // let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt
if (response.length === 0) {
  return res.status(404).json({
    status: "Fail",
    message: "No attendance data found for this date"
  });
}

console.log("i am max time", response[0].maxUpdatedAt)

//below fetches max absentee calling done time
let maxAttendanceMarkDateAndTime = response[0].maxUpdatedAt
    const istTime = new Date(maxAttendanceMarkDateAndTime)

    const maxAttendanceMarkingHours = istTime.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,

    })

    console.log(maxAttendanceMarkingHours)

    const maxAttendanceTimeSplit = maxAttendanceMarkingHours.split(",")
    const maxAttendanceTimeInNumber = maxAttendanceTimeSplit[1].split(":").join("")
    console.log(maxAttendanceTimeInNumber)

    //now comparing this studentAttendanceCount with GamificationPointLogicForStudentAttendance to assing pointValue

    let point;
    let unqIdOfPointObject;

    for (let i = 0; i <= studentAbsentConnectedCount; i++) {
      if (studentAbsentConnectedCount >= GamificationPointLogicForStudentAttendance[i].startRange && studentAbsentConnectedCount <= GamificationPointLogicForStudentAttendance[i].endRange) {

        //Checking validation for negative marking
        if (maxAttendanceTimeInNumber > Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join(""))) {
          point = -15
          console.log("i am herer")
          break;
        }

        console.log(Number(GamificationPointLogicForStudentAttendance[i].timeValidation.split(":").join("")))
        point = GamificationPointLogicForStudentAttendance[i].point
        unqIdOfPointObject = GamificationPointLogicForStudentAttendance[i]._id
        console.log(point)

        break;
      }
    }



    //Now we have the point now we update the gamificationuserpoints collection

    //first we check if the doc already exist for the unqObjectId, batch, gamificationDate, pointType

    const studentAttendanceExist = await GamificationUserPoint.find({
      unqObjectId: unqObjectId, batch: batch, gamificationDate: {
        $gte: startDate,
        $lte: endDate
      },
      pointType: "callingAbsentee"
    })

    if (studentAttendanceExist.length > 0) {

      // console.log(studentAttendanceExist[0].)

      const response = await GamificationUserPoint.findOneAndUpdate({
        unqObjectId: unqObjectId, batch: batch, gamificationDate: {
          $gte: startDate,
          $lte: endDate
        },
        pointType: "callingAbsentee"
      }, {
        $set: {
          pointValue: point
        }
      })
    } else {
      const response = await GamificationUserPoint.create({
        unqObjectId: unqObjectId,
        pointType: "callingAbsentee",
        pointValue: point,
        batch: batch,
        unqIdOfPointObject: unqIdOfPointObject,
        gamificationDate: date
      })
    }

    res.status(200).json({ status: "Ok", data: response })
  } catch (error) {
    console.log(error)
  }
}







export const disciplinary = async (req, res) => {



console.log("i am inside Gamification.controller.js, api: disciplinary")

  const { batch, district_block_schoolsObjectId
, unqObjectId, unqIdOfPointObject, date, schoolId } = req.body;
  console.log(req.body)
  //Fetching gamificaiton point logics


  const responseGamificationPointLogic = await GamificationPointLogic.find({});

  const GamificationPointLogicForStudentAttendance = responseGamificationPointLogic[0].disciplinary

  // console.log(GamificationPointLogicForStudentAttendance)


  let startDate;
  let endDate;

  const dateConversionFunction = (date) => {

    startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)

  }

  dateConversionFunction(date)


  let pipelineRegion;


pipelineRegion = [
  {
    $match: {
      _id: new mongoose.Types.ObjectId(
        district_block_schoolsObjectId
      ),
    },
  },

  {
    $lookup: {
      from: "students",
      let: {
        schoolId: "$schoolId",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    "$schoolId",
                    "$$schoolId",
                  ],
                },
                {
                  $eq: [
                    "$batch",
                    batch,
                  ],
                },
                {
                  $eq: [
                    "$isSlcTaken",
                    false,
                  ],
                },
              ],
            },
          },
        },
        {
          $count: "studentCount",
        },
      ],
      as: "studentData",
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
              $and: [
                {
                  $eq: [
                    "$district_block_schoolsObjectId",
                    "$$schoolObjectId",
                  ],
                },
                {
                  $eq: [
                    "$batch",
                    batch,
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
              ],
            },
          },
        },

        {
          $addFields: {
            istHour: {
              $hour: {
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },
        },

        {
          $facet: {
            beforeNoon: [
              {
                $match: {
                  istHour: {
                    $lt: 12,
                  },
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
            ],

            afterNoon: [
              {
                $match: {
                  istHour: {
                    $gte: 12,
                  },
                },
              },
              {
                $sort: {
                  createdAt: 1,
                },
              },
              {
                $limit: 1,
              },
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
        $ifNull: [
          {
            $arrayElemAt: [
              "$studentData.studentCount",
              0,
            ],
          },
          0,
        ],
      },

      disciplinaryBeforeNoon: {
        $arrayElemAt: [
          {
            $arrayElemAt: [
              "$disciplinaryData.beforeNoon",
              0,
            ],
          },
          0,
        ],
      },

      disciplinaryAfterNoon: {
        $arrayElemAt: [
          {
            $arrayElemAt: [
              "$disciplinaryData.afterNoon",
              0,
            ],
          },
          0,
        ],
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

  try {

  const response = await District_Block_School.aggregate(
    pipelineRegion
  );

  let point = 0;
  let applicableRange;

  if (response?.length > 0) {

    const schoolData = response[0];

    const studentCount = schoolData.studentCount || 0;

    // Find applicable point slab
    applicableRange =
  GamificationPointLogicForStudentAttendance.find(
    (item) =>
      studentCount >= item.startRange &&
      studentCount <= item.endRange
  );

    const totalPoints = applicableRange?.point || 0;


    const calculateStatusPoint = (
      status,
      totalPoints
    ) => {

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

    const beforeNoonStatus =
      schoolData?.disciplinaryBeforeNoon?.status;

    const afterNoonStatus =
      schoolData?.disciplinaryAfterNoon?.status;

    const beforeNoonPoints =
      calculateStatusPoint(
        beforeNoonStatus,
        totalPoints
      );

    const afterNoonPoints =
      calculateStatusPoint(
        afterNoonStatus,
        totalPoints
      );

    point =
      beforeNoonPoints +
      afterNoonPoints;

    console.log("Student Count:", studentCount);

    console.log(
      "Applicable Slab:",
      applicableRange
    );

    console.log(
      "Total Slab Points:",
      totalPoints
    );

    console.log(
      "Before Noon Status:",
      beforeNoonStatus
    );

    console.log(
      "Before Noon Points:",
      beforeNoonPoints
    );

    console.log(
      "After Noon Status:",
      afterNoonStatus
    );

    console.log(
      "After Noon Points:",
      afterNoonPoints
    );

    console.log(
      "Final Point:",
      point
    );
  }


  //Creating point object. Now we have to check district_block_schoolsObjectId this id
  //...assigned to whom users by role specifically "CC" cause we have to update their unqObjectId

  const createGamificationResponse = await GamificationUserPoint.create({
    unqObjectId:unqObjectId,
    pointType:"disciplinary",
    pointValue:point,
    batch:batch,
    unqIdOfPointObject:applicableRange?._id || null,
    gamificationDate:startDate,
    isPointClaimed:true
  })

  res.status(200).json({
    status: "Ok",
    data: response,
    point,
  });

} catch (error) {

  console.log(error);

  res.status(500).json({
    status: "Failed",
    error,
  });
}
}



export const marks = async (req, res) => {

  try {

  } catch (error) {

  }
}








export const ClaimGamificationPoint = (req, res) =>{

  console.log("I am inside Gamification.controller.js, api: ClaimGamificationPoint")
const {pointType} = req.body;

console.log(req.body)

  try {
    
    if (pointType === "selfAttendance"){

      return selfAttendancePoint(req, res)


    } else if (pointType === "studentAttendance"){

      return studentAttendance(req, res);

    } else if (pointType === "uploadPdf"){

        return pdfUpload (req, res);

    }else if (pointType === "callingAbsentee"){

        return callingAbsentee(req, res);

    } else if (pointType === "disciplinary"){
      
      return disciplinary(req, res);
    }




    // res.status(200).json({status:"Ok", data:"functon ran"})
  } catch (error) {
    console.log(error)
    res.status(500).json({status:"failed", data:"error occured"})
  }
}




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
