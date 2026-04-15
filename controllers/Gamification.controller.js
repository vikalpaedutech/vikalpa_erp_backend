import { GamificationPointLogic, GamificationUserPoint } from "../models/gamification.model.js";

import { UserAttendance } from "../models/userAttendnace.model.js";



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
  const { userObjectId, classValue } = req.body;

  //variable to store point value of user, pointType, classOfCenter.
  let pointValue;
  let pointType = 'SelfAttendance'
  let classOfCenter = '8'
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