import mongoose from "mongoose";
import { Gamification, GamificationRanking } from "../models/gamification.model.js";
import { UserAccess } from "../models/user.model.js";
import { User } from "../models/user.model.js";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { Student } from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";
import { AttendancePdf } from "../models/UploadAttendancePdf.model.js";
import { FindCursor } from "mongodb";
import { all } from "axios";
import { Marks } from "../models/marks.model.js";


export const createGamificationData = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { role: "CC",
             isActive: true
         } // filter only CC role
      },
      {
        $lookup: {
          from: "useraccesses",         // collection name in Mongo
          localField: "_id",            // User _id
          foreignField: "unqObjectId",  // matches useraccesses.unqObjectId
          as: "accesses"                // output array field
        }
      }
    ];

    const result = await User.aggregate(pipeline);

    console.log(result[1])


    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error("Error creating gamification data:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};



// export const selfAttendanceGamification = async (req, res) =>{

//     console.log('Hello self attendance')

//     const {unqUserObjectId,  date  } = req.body //userId

//     console.log(req.body)

//     // const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4'

//     // Setting dates for querying
//     const startDate = new Date()
//     const endDate = new Date ()

//     startDate.setUTCHours(0, 0, 0, 0);
//     endDate.setHours(23, 59, 59, 999)

// const findAttendance = await UserAttendance.findOne({
//   unqUserObjectId: unqUserObjectId,
//    date: { $gte: startDate, $lte: endDate }
// });


// const userLoginTime = findAttendance.loginTime

// const istms = userLoginTime.getTime() + (5.5 * 60 * 60 *1000);
// const formattedISTDate = new Date(istms)

// // const utcms = userLoginTime.getTime();
// // const formattedUtc = new Date(utcms)

// console.log(userLoginTime)
// console.log(formattedISTDate)
// const hours = userLoginTime.getHours(); //Converts utc hours into ist hours
// const minutes = userLoginTime.getMinutes(); //converts utc minutes into ist minutes
// console.log(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`);



// //Function to convert utc minute hour into milisecons
// function timeToMs(timeStr) {
//   const [h, m] = timeStr.split(":").map(Number);
//   return (h * 60 * 60 * 1000) + (m * 60 * 1000);
// }

// const t1_userLoginTimeinMs =  timeToMs(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`)
// // const t1_userLoginTimeinMs =  timeToMs(`08:16`)

// console.log(t1_userLoginTimeinMs)

// //Point assignment logic

// // 7:31 to 7:45: 5,
// // 7:41 to 8:00: 2,
// // 8:01 to 8:15: -5,
// // Greater than 8:15: -10
// let point;
// async function getPoints(t1_userLoginTimeinMs) {
//    point = 5; // default if before 7:31

//   if (t1_userLoginTimeinMs >= 27060000 && t1_userLoginTimeinMs <= 27900000) {
//     point = 5;
//   } else if (t1_userLoginTimeinMs >= 27660000 && t1_userLoginTimeinMs <= 28800000) {
//     point = 2;
//   } else if (t1_userLoginTimeinMs >= 28860000 && t1_userLoginTimeinMs <= 29700000) {
//     point = -5;
//   } else if (t1_userLoginTimeinMs > 29700000) {
//     point = -10;
//   }

//   return point;
// }
// await getPoints(t1_userLoginTimeinMs)

// console.log("point is: ", point)

//     try {
        
//             const pipeline = [
//       {
//         $match: { role: "CC",
//              isActive: true,
//               _id: new mongoose.Types.ObjectId(unqUserObjectId),
//          } // filter only CC role
//       },
//       {
//         $lookup: {
//           from: "useraccesses",         // collection name in Mongo
//           localField: "_id",            // User _id
//           foreignField: "unqObjectId",  // matches useraccesses.unqObjectId
//           as: "accesses"                // output array field
//         }
//       }
//     ];


//  const result = await User.aggregate(pipeline);

//  console.log(result[0].accesses[0].region)




// const schoolData = result[0].accesses[0].region
 


// const schoolIdsArray = [
//   ...new Set(
//     schoolData.flatMap(district =>
//       district.blockIds.flatMap(block =>
//         block.schoolIds.map(school => school.schoolId)
//       )
//     )
//   )
// ];


// const schoolIdsArrayToStringConversion = schoolIdsArray.join(",")

// console.log(schoolIdsArray)
 
// console.log(result[0].accesses[0].classId)

// const classess = result[0].accesses[0].classId.join(",")
// console.log(classess)

// const response  = await Gamification.create({
//     unqUserObjectId:result[0]._id,
//     userId: result[0].userId,
//     pointType:"Self_Attendance",
//     centerId: schoolIdsArrayToStringConversion,
//     classOfCenter: classess,
//     poorRankCount: null,
//     averageRankCount:null,
//     goodRankCount:null,
//     excellentRankCount:null,
//     examId: null,
//     finalPoint:point,
//     pointGivenBy:null,
//     pointClaimed:false,
//     date: new Date()
// })
 




//  res.status(200).json({
//       success: true,
//       count: result.length,
//       data: response //result[0].accesses[0].region
//     });



//     } catch (error) {
//         console.log('Error::::>', error)

//         res.status(500).json({status: "Success", message:"Error updating "})
//     }


// }


export const selfAttendanceGamification = async (req, res) =>{

    console.log('Hello self attendance ERP TEST')

    const {unqUserObjectId,  date  } = req.body //userId

    console.log(req.body)

    // const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4'

    // Setting dates for querying
    const startDate = new Date()
    const endDate = new Date ()

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999)

const findAttendance = await UserAttendance.findOne({
  unqUserObjectId: unqUserObjectId,
   date: { $gte: startDate, $lte: endDate }
});

if (!findAttendance) {
  return res.status(404).json({
    success: false,
    message: "No attendance record found for this user on given date"
  });
}

const userLoginTime = findAttendance.loginTime

const istms = userLoginTime.getTime() + (5.5 * 60 * 60 *1000);
const formattedISTDate = new Date(istms)

// const utcms = userLoginTime.getTime();
// const formattedUtc = new Date(utcms)

console.log(userLoginTime)
console.log(formattedISTDate)
const hours = userLoginTime.getHours(); //Converts utc hours into ist hours
const minutes = userLoginTime.getMinutes(); //converts utc minutes into ist minutes
console.log(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`);



//Function to convert utc minute hour into milisecons
function timeToMs(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return (h * 60 * 60 * 1000) + (m * 60 * 1000);
}

const t1_userLoginTimeinMs =  timeToMs(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`)
// const t1_userLoginTimeinMs =  timeToMs(`08:16`)

console.log(t1_userLoginTimeinMs)

//Point assignment logic

// 7:31 to 7:45: 5,
// 7:41 to 8:00: 2,
// 8:01 to 8:15: -5,
// Greater than 8:15: -10
let point;
async function getPoints(t1_userLoginTimeinMs) {
   point = 5; // default if before 7:31

  if (t1_userLoginTimeinMs >= 27060000 && t1_userLoginTimeinMs <= 27900000) {
    point = 5;
  } else if (t1_userLoginTimeinMs >= 27660000 && t1_userLoginTimeinMs <= 28800000) {
    point = 2;
  } else if (t1_userLoginTimeinMs >= 28860000 && t1_userLoginTimeinMs <= 29700000) {
    point = -5;
  } else if (t1_userLoginTimeinMs > 29700000) {
    point = -10;
  }

  return point;
}
await getPoints(t1_userLoginTimeinMs)

console.log("point is: ", point)

    try {
        
            const pipeline = [
      {
        $match: { role: "CC",
             isActive: true,
              _id: new mongoose.Types.ObjectId(unqUserObjectId),
         } // filter only CC role
      },
      {
        $lookup: {
          from: "useraccesses",         // collection name in Mongo
          localField: "_id",            // User _id
          foreignField: "unqObjectId",  // matches useraccesses.unqObjectId
          as: "accesses"                // output array field
        }
      }
    ];


 const result = await User.aggregate(pipeline);

 console.log(result[0].accesses[0].region)

const schoolData = result[0].accesses[0].region
 


const schoolIdsArray = [
  ...new Set(
    schoolData.flatMap(district =>
      district.blockIds.flatMap(block =>
        block.schoolIds.map(school => school.schoolId)
      )
    )
  )
];


const schoolIdsArrayToStringConversion = schoolIdsArray.join(",")

console.log(schoolIdsArray)
 
console.log(result[0].accesses[0].classId)

const classess = result[0].accesses[0].classId.join(",")
console.log(classess)

const response  = await Gamification.create({
    unqUserObjectId:result[0]._id,
    userId: result[0].userId,
    pointType:"Self_Attendance",
    centerId: schoolIdsArrayToStringConversion,
    classOfCenter: classess,
    poorRankCount: null,
    averageRankCount:null,
    goodRankCount:null,
    excellentRankCount:null,
    examId: null,
    finalPoint:point,
    pointGivenBy:null,
    pointClaimed:false,
    date: new Date()
})
 




 res.status(200).json({
      success: true,
      count: result.length,
      data: response //result[0].accesses[0].region
    });



    } catch (error) {
        console.log('Error::::>', error)

        res.status(500).json({status: "Success", message:"Error updating "})
    }


}





export const studentAttendanceGamification = async (req, res) =>{

    // console.log("Hello student attendance gamification")

    const {unqUserObjectId, schoolId, classOfCenter, userId} = req.body;

    // console.log(req.body)

//     const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4'
    
//     const schoolId = '4025'
//    const classOfCenter = '9'
    
    //Fetching student attendance count based on schoolId, and clas of student

    const findStudentWithschoolIdandClass = await Student.find({
        schoolId: schoolId,
        classofStudent: classOfCenter,
        isSlcTaken:false
    })

    //Storing all student ids from Student collection. 
    //Then we can use those ids for query in student attendances for fetching attendance count.

     let allStudentId = [];
        findStudentWithschoolIdandClass.map((eachStudent)=>{
        allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
        })

    //-----------------------------------------------------------------------------

    //Now fetching student attendance count (only Present count) from studentattendances
    //We wil fetch current dates present count only only.

    // Setting dates for querying
    const startDate = new Date()
    const endDate = new Date ()

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // console.log("dates are", startDate, endDate)

    const fetchPresentStudentCountFromStudentAttendances = await StudentAttendance.find({
        unqStudentObjectId: {$in:allStudentId},
        date: {$gte:startDate, $lte:endDate},
        status: 'Present'
    })

    const PresentCount = fetchPresentStudentCountFromStudentAttendances.length

    // console.log(fetchPresentStudentCountFromStudentAttendances.length)
    //--------------------------------------------------------

    //Point logic. And time validation logic.

    // 0 to 9: 3,
    // 10 to 14: 5,
    // 15 to 29: 7,
    // 30 to 39: 8,
    // 40 to 49: 10,
    // 50 to 79: 12, 
    // 80 and above: 15


    const currentTime = new Date();
    
    const hours = currentTime.getHours(); //Converts utc hours into ist hours
    const minutes = currentTime.getMinutes(); //converts utc minutes into ist minutes
    // console.log(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`);

    //Function to convert utc minute hour into milisecons
    function timeToMs(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60 * 60 * 1000) + (m * 60 * 1000);
    }

    const timeWhenAttendaceIsMarked =  timeToMs(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`)
    const validationTime = timeToMs(`14:40`)
    // console.log(timeWhenAttendaceIsMarked)
    // console.log(validationTime)

    let point;

    if(timeWhenAttendaceIsMarked <= validationTime){
        if (PresentCount >= 0 && PresentCount <= 9) {
            point = 3;
        } else if (PresentCount >= 10 && PresentCount <= 14) {
            point = 5;
        } else if (PresentCount >= 15 && PresentCount <= 29) {
            point = 7;
        } else if (PresentCount >= 30 && PresentCount <= 39) {
            point = 8;
        } else if (PresentCount >= 40 && PresentCount <= 49) {
            point = 10;
        } else if (PresentCount >= 50 && PresentCount <= 79) {
            point = 12;
        } else if (PresentCount >= 80) {
            point = 15;}

    } else {
        point = -15
    }
        // console.log("Point:", point);
    try {

      //Case when student-attendance-gamification exist
      

      const studentAttendanceGamificationExist = await Gamification.find({
        pointType:"Student_Attendance",
        centerId:schoolId,
        classOfCenter:classOfCenter,
        date:{$gte:startDate, $lte:endDate}
      })

      

      if (studentAttendanceGamificationExist.length>0){
        console.log('Attendance gamification exist')
        
        studentAttendanceGamificationExist[0].finalPoint = point;
        

        const response  = await Gamification.create(studentAttendanceGamificationExist[0])
       
       console.log(response);

       res.status(200).json({status:"Ok", data: response})

       console.log('Existed data updated')
        return;
      }

      





        //Find user who is to be given points.
         const findRegionWithItsUser = await UserAccess.find({
                unqObjectId:unqUserObjectId,
                classId:{$in:["9"]},
                 "region.blockIds.schoolIds.schoolId": { $in: ["4025"] }
            })



        // console.log(findRegionWithItsUser[0])   
        
        

        //Creating gamification data and storing it into DB.

        const response  = await Gamification.create({
                                unqUserObjectId:unqUserObjectId,
                                userId: userId,
                                pointType:"Student_Attendance",
                                centerId: schoolId,
                                classOfCenter: classOfCenter,
                                poorRankCount: null,
                                averageRankCount:null,
                                goodRankCount:null,
                                excellentRankCount:null,
                                examId: null,
                                finalPoint:point,
                                pointGivenBy:null,
                                pointClaimed:false,
                                date: new Date()
                            })
        

        res.status(200).json({status:'Success', count:fetchPresentStudentCountFromStudentAttendances.length, data:findRegionWithItsUser})
    } catch (error) {
        console.log('Error::::>', error)
    }
}




export const attendancePdfGamification = async (req, res) => {

  console.log('Hello attendance pdf gamification')


  const {unqUserObjectId, schoolId, classofStudent, userId} =  req.body;


  // const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4';
  // const schoolId = '4025';
  // const classofStudent = '9'
  // const userId = 'TESTCC'

  // console.log(req.body)



//Date management for querying
//Always gonna give points on current date

const startDate = new Date ();
const endDate = new Date ();


startDate.setUTCHours(0, 0, 0, 0);
endDate.setUTCHours(23, 59, 59, 9999);

// console.log(startDate, endDate)

  const findPdf = await AttendancePdf.find({
    unqUserObjectId:new mongoose.Types.ObjectId(unqUserObjectId),
    schoolId:schoolId,
    classofStudent:classofStudent,
    dateOfUpload:{$gte:startDate, $lte:endDate}
  })

//   console.log(findPdf[0].dateOfUpload)
// //comparing pdf date with current date.
// console.log(startDate.toISOString().split('T')[0] === findPdf[0].dateOfUpload.toISOString().split('T')[0] )



//Below function to convert utc hour:miuntes into miliseconds for comparison
    function timeToMs(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60 * 60 * 1000) + (m * 60 * 1000);
    }
    //---------------------------------------------------

//Getting hours and minutes from current date and dateOfUpload

    const currentDateAndTime = new Date()

    const hours = currentDateAndTime.getHours(); //Converts utc hours into ist hours
    const minutes = currentDateAndTime.getMinutes(); //converts utc minutes into ist minutes
    // console.log(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`);

//------------------------------------------------------------------
  
//Converting current dates minutes: hours with static validation time which is
//...upto school timings (14:40). It means if user uploads pdf after this...
//... time then he she will be given negative points else positive.

const currentTimeInMiliseconds = timeToMs(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`)
// console.log("current time in ms: ", currentTimeInMiliseconds)
// console.log("stati time in ms:", timeToMs(`14:40`))
const validationTime =  timeToMs(`14:40`)
    try {

      //Checking if the uploaded pdf is in current date or not.
      //If user uploads backdated or by mistake future date pdf, then no...
      //...no points will be given

      // Till school (2:40): 5
      // After school (2:40): -5


      let point;
      if (startDate.toISOString().split('T')[0] === findPdf[0].dateOfUpload.toISOString().split('T')[0]){

        if(currentTimeInMiliseconds<= validationTime ){
          point = 5
        } else {
          point = -5;
        }

      } else {
        point = -5;
      }

    //--------------------------------------------------------------------

//Case 1 if the attendance pdf gamification object already exist in db.

const attendancePdfGamificationExist = await Gamification.find({
  pointType: "Attendance_Pdf",
  centerId: schoolId,
  classOfCenter:classofStudent
})

if (attendancePdfGamificationExist.length>0){
  console.log("Attendance pdf gamification exist")
  console.log(attendancePdfGamificationExist)

  attendancePdfGamificationExist[0].finalPoint = point;

  const response  = await Gamification.create(attendancePdfGamificationExist[0])

res.status(200).json({status:"Ok", data:response})
  return;
}





    //creating gamification data in db
    const response  = await Gamification.create({
                                unqUserObjectId:unqUserObjectId,
                                userId: userId,
                                pointType:"Attendance_Pdf",
                                centerId: schoolId,
                                classOfCenter: classofStudent,
                                poorRankCount: null,
                                averageRankCount:null,
                                goodRankCount:null,
                                excellentRankCount:null,
                                examId: null,
                                finalPoint:point,
                                pointGivenBy:null,
                                pointClaimed:false,
                                date: new Date()
                            })

        res.status(200).json({status:'Ok', data:findPdf})
    } catch (error) {
        console.log("Error::::>", error)
    }
}















//Below api is exact same as studentAttendanceGamification
export const studentAbsenteeCallingGamification = async (req, res) =>{

    console.log("Hello student absentee calling gamification")

    const {unqUserObjectId, schoolId, classOfCenter, userId} = req.body;

    console.log(req.body)

  //   const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4'
    
  //   const schoolId = '4025'
  //  const classOfCenter = '9'

  //  const userId = 'TESTCC'
    
    //Fetching student attendance count based on schoolId, and clas of student

    const findStudentWithschoolIdandClass = await Student.find({
        schoolId: schoolId,
        classofStudent: classOfCenter,
        isSlcTaken:false
    })

    //Storing all student ids from Student collection. 
    //Then we can use those ids for query in student attendances for fetching attendance count.

     let allStudentId = [];
        findStudentWithschoolIdandClass.map((eachStudent)=>{
        allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
        })

        console.log(allStudentId.length)

    //-----------------------------------------------------------------------------

    //Now fetching student attendance count (only Present count) from studentattendances
    //We wil fetch current dates present count only only.

    // Setting dates for querying
    const startDate = new Date()
    const endDate = new Date ()

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("dates are", startDate, endDate)

    const fetchPresentStudentCountFromStudentAttendances = await StudentAttendance.find({
        unqStudentObjectId: {$in:allStudentId},
         date: {$gte:startDate, $lte:endDate},
        absenteeCallingStatus: 'Connected'
    })

    const PresentCount = fetchPresentStudentCountFromStudentAttendances.length

    console.log(fetchPresentStudentCountFromStudentAttendances.length)
    //--------------------------------------------------------

    //Point logic. And time validation logic.

    // 0 to 9: 3,
    // 10 to 14: 5,
    // 15 to 29: 7,
    // 30 to 39: 8,
    // 40 to 49: 10,
    // 50 to 79: 12, 
    // 80 and above: 15


    const currentTime = new Date();
    
    const hours = currentTime.getHours(); //Converts utc hours into ist hours
    const minutes = currentTime.getMinutes(); //converts utc minutes into ist minutes
    console.log(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`);

    //Function to convert utc minute hour into milisecons
    function timeToMs(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60 * 60 * 1000) + (m * 60 * 1000);
    }

    const timeWhenAttendaceIsMarked =  timeToMs(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`)
    const validationTime = timeToMs(`14:40`)
    console.log(timeWhenAttendaceIsMarked)
    console.log(validationTime)

    let point;

    if(timeWhenAttendaceIsMarked <= validationTime){
        if (PresentCount >= 0 && PresentCount <= 9) {
            point = 3;
        } else if (PresentCount >= 10 && PresentCount <= 14) {
            point = 5;
        } else if (PresentCount >= 15 && PresentCount <= 29) {
            point = 7;
        } else if (PresentCount >= 30 && PresentCount <= 39) {
            point = 8;
        } else if (PresentCount >= 40 && PresentCount <= 49) {
            point = 10;
        } else if (PresentCount >= 50 && PresentCount <= 79) {
            point = 12;
        } else if (PresentCount >= 80) {
            point = 15;}

    } else {
        point = -15
    }
        // console.log("Point:", point);
    try {

        //Find user who is to be given points.
         const findRegionWithItsUser = await UserAccess.find({
                unqObjectId:unqUserObjectId,
                classId:{$in:["9"]},
                 "region.blockIds.schoolIds.schoolId": { $in: ["4025"] }
            })



        // console.log(findRegionWithItsUser[0])   
        


        //absentee calling gamification exist;

        const studentAbsenteeCallingGamificationExist = await Gamification.find({
                                pointType:"Student_Absentee_Calling",
                                centerId: schoolId,
                                classOfCenter: classOfCenter,
                                   })
        if (studentAbsenteeCallingGamificationExist.length>0){


          console.log('absentee calling gamification exist')
          studentAbsenteeCallingGamificationExist[0].finalPoint = point;

          const response  = await Gamification.create(
            studentAbsenteeCallingGamificationExist[0])

            console.log('Existing data updated')

            res.status(200).json({status:'Ok', data: response})
          return;
        }
        

        //Creating gamification data and storing it into DB.

        const response  = await Gamification.create({
                                unqUserObjectId:unqUserObjectId,
                                userId: userId,
                                pointType:"Student_Absentee_Calling",
                                centerId: schoolId,
                                classOfCenter: classOfCenter,
                                poorRankCount: null,
                                averageRankCount:null,
                                goodRankCount:null,
                                excellentRankCount:null,
                                examId: null,
                                finalPoint:point,
                                pointGivenBy:null,
                                pointClaimed:false,
                                date: new Date()
                            })
        

        res.status(200).json({status:'Success', count:fetchPresentStudentCountFromStudentAttendances.length, data:fetchPresentStudentCountFromStudentAttendances})
    } catch (error) {
        console.log('Error::::>', error)
    }
}











export const studentMarksGamification = async (req, res)=>{
console.log("Hello Student Marks Gamification")


const {unqUserObjectId, schoolId, classOfCenter, userId, examId } = req.body;

  console.log(req.body)

  // const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4'
    
  //   const schoolId = '4025'
  //  const classOfCenter = '9'

  //  const userId = 'TESTCC'

  //  const examId = 'English-CBSE_HBSE-9-(SAT)-(2025-09-11)'




   
    //Fetching student attendance count based on schoolId, and clas of student

    const findStudentWithschoolIdandClass = await Student.find({
        schoolId: schoolId,
        classofStudent: classOfCenter,
        isSlcTaken:false
    })

   

    //Storing all student ids from Student collection. 
    //Then we can use those ids for query in student attendances for fetching attendance count.

     let allStudentId = [];
        findStudentWithschoolIdandClass.map((eachStudent)=>{
        allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
        })

        console.log(allStudentId)

    //-----------------------------------------------------------------------------



    //Now fetching student attendance count (only Present count) from studentattendances
    //We wil fetch current dates present count only only.

    // Setting dates for querying
    const startDate = new Date()
    const endDate = new Date ()

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("dates are", startDate, endDate)

    const fetchMarksCount = await Marks.find({
        unqStudentObjectId: {$in:allStudentId},
        //  date: {$gte:startDate, $lte:endDate},
        examId: examId,
         marksObtained: { $ne: null, $exists: true, $type: "number" }
    })

    const marksCount = fetchMarksCount.length

    console.log(fetchMarksCount.length)
    //--------------------------------------------------------


     //Point logic. And time validation logic.

    // 0 to 9: 3,
    // 10 to 14: 5,
    // 15 to 29: 7,
    // 30 to 39: 8,
    // 40 to 49: 10,
    // 50 to 79: 12, 
    // 80 and above: 15


    const currentTime = new Date();
    
    const hours = currentTime.getHours(); //Converts utc hours into ist hours
    const minutes = currentTime.getMinutes(); //converts utc minutes into ist minutes
    console.log(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`);

    //Function to convert utc minute hour into milisecons
    function timeToMs(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60 * 60 * 1000) + (m * 60 * 1000);
    }

    const timeWhenMarkIsMarked =  timeToMs(`${hours}:${minutes < 10 ? "0" + minutes : minutes}`)
    const validationTime = timeToMs(`14:40`)
    console.log(timeWhenMarkIsMarked)
    console.log(validationTime)

    let point;

    if(timeWhenMarkIsMarked <= validationTime){
        if (marksCount >= 0 && marksCount <= 9) {
            point = 3;
        } else if (marksCount >= 10 && marksCount <= 14) {
            point = 5;
        } else if (marksCount >= 15 && marksCount <= 29) {
            point = 7;
        } else if (marksCount >= 30 && marksCount <= 39) {
            point = 8;
        } else if (marksCount >= 40 && marksCount <= 49) {
            point = 10;
        } else if (marksCount >= 50 && marksCount <= 79) {
            point = 12;
        } else if (marksCount >= 80) {
            point = 15;}

    } else {
      
        point = -15
    }
        console.log("Point:", point);

try {
  


  //Checking if marks gamification already exists.

  const studentMarksGamificationExist = await Gamification.find({
                                pointType:"Student_Marks",
                                centerId: schoolId,
                                classOfCenter: classOfCenter,
  })

  if(studentMarksGamificationExist.length>0){
    console.log("marks gamificatio exixt")

    studentMarksGamificationExist[0].finalPoint = point;

    const response  = await Gamification.create(studentMarksGamificationExist[0])

    res.status(200).json({status:"Ok", data:response});

    console.log('Exited marks gamification updated')
    return;

  }


  //Creating gamification data and storing it into DB.

        const response  = await Gamification.create({
                                unqUserObjectId:unqUserObjectId,
                                userId: userId,
                                pointType:"Student_Marks",
                                centerId: schoolId,
                                classOfCenter: classOfCenter,
                                poorRankCount: null,
                                averageRankCount:null,
                                goodRankCount:null,
                                excellentRankCount:null,
                                examId: examId,
                                finalPoint:point,
                                pointGivenBy:null,
                                pointClaimed:false,
                                date: new Date()
                            })
        

  res.status(200).json({status:'Ok', count:fetchMarksCount.length, data:response})
} catch (error) {
  
    console.log("Error::::>", error)

}
}






export const disciplinaryGamification = async (req, res) =>{

  console.log("Hello disciplinary gamification!")


  const {unqUserObjectId, schoolId, classOfCenter, userId, rank } = req.body;

 

  console.log(req.body)

  // const unqUserObjectId = '68c1f6c442aa3b998a0ad9e4'
    
  //   const schoolId = '4025'
  //  const classOfCenter = '9'

  //  const userId = 'TESTCC'


  //Logic for fetching user object id whose center and class is being given the points...
  ///...It will be cc. 
  //We fetch the data using classOfCenter, schoolId, and then fetch the data...
  //...from Users to find the role cc.

 const findRegionAccess = await UserAccess.find({
  classId: { $in: [classOfCenter] },
  region: {
    $elemMatch: {
      blockIds: {
        $elemMatch: {
          schoolIds: {
            $elemMatch: {
              schoolId: schoolId
            }
          }
        }
      }
    }
  }
});


let allRegionIds = [];
  if (findRegionAccess){
    // console.log(findRegionAccess)
    console.log('Hello find region')

    
    findRegionAccess.map((eachObject)=>{
      allRegionIds.push(new mongoose.Types.ObjectId(eachObject.unqObjectId)) 
   })
// console.log(allRegionIds)



  }

  const findCC = await User.find({
  _id:{$in:allRegionIds},
  role:'CC'
})

//----------------------------------------------------

//Calculating total student count in schoolId and classOfcenter.
const findStudentCount = await Student.find({
  schoolId:schoolId,
  classofStudent:classOfCenter,
  isSlcTaken:false
})

const totalStudentCount = findStudentCount.length

console.log("Student count", findStudentCount.length)
//--------------------------------------------------------


//Point assigning logic.
let point;
if(totalStudentCount >= 0 && totalStudentCount <= 9){
  if(rank === "Poor"){ point = -10;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 5;} // point/4
  else if(rank === "Excellent"){point = 10;} //point/2
} else if (totalStudentCount >= 10 && totalStudentCount <= 14){
  if(rank === "Poor"){ point = -12.5;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 6.25;} // point/4
  else if(rank === "Excellent"){point = 12.5;} //point/2
}else if (totalStudentCount >= 15 && totalStudentCount <= 19){
  if(rank === "Poor"){ point = -15;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 7.5;} // point/4
  else if(rank === "Excellent"){point = 15;} //point/2
} else if (totalStudentCount >= 20 && totalStudentCount <= 24){
  if(rank === "Poor"){ point = -17.5;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 8.75;} // point/4
  else if(rank === "Excellent"){point = 17.5;} //point/2
} else if (totalStudentCount >= 25 && totalStudentCount <= 29){
  if(rank === "Poor"){ point = -20;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 10;} // point/4
  else if(rank === "Excellent"){point = 20;} //point/2
}else if (totalStudentCount >= 30 && totalStudentCount <= 39){
  if(rank === "Poor"){ point = -25;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 12.5;} // point/4
  else if(rank === "Excellent"){point = 25;} //point/2
}else if (totalStudentCount >= 40 && totalStudentCount <= 49){
  if(rank === "Poor"){ point = -27.5;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 13.75;} // point/4
  else if(rank === "Excellent"){point = 27.5;} //point/2
}else if (totalStudentCount >= 50 && totalStudentCount <= 200){
  if(rank === "Poor"){ point = -30;} // -point/2
  else if(rank === "Average"){point = 0;} //0
  else if(rank === "Good"){point = 15;} // point/4
  else if(rank === "Excellent"){point = 30;} //point/2
}




//Before updating point, we check if the object already exists by querying with...
//...pointType='Disciplinary' and date= currentDate. So that, if the object...
//...already exists so same object can be updated rather creating multiple duplicate...
//... objects.

const startDate = new Date();
const endDate = new Date ();

startDate.setUTCHours(0, 0, 0, 0)
endDate.setHours(23, 59, 59, 999)

const disciplinaryExist = await Gamification.find({
  centerId:schoolId,
  classOfCenter:classOfCenter,
  pointType:'Disciplinary',
  date: {$gte:startDate, $lte:endDate}
})

if (disciplinaryExist.length>0){
  console.log("Disciplinary already exist")
  console.log(disciplinaryExist)

console.log(disciplinaryExist[0].poorRankCount)
console.log(disciplinaryExist[0].averageRankCount)
console.log(disciplinaryExist[0].goodRankCount)
console.log(disciplinaryExist[0].excellentRankCount)

const sumOfRankPoints = disciplinaryExist[0].poorRankCount + 
                        disciplinaryExist[0].averageRankCount +
                        disciplinaryExist[0].goodRankCount +
                        disciplinaryExist[0].excellentRankCount





//Finding existing gamification data of users
const findGamificationData = await GamificationRanking.find({
  unqUserObjectId:unqUserObjectId,
  centerId:schoolId,
  classOfCenter:classOfCenter,
  date: {$gte:startDate, $lte:endDate}
})


if (findGamificationData.length > 0){
  //Crating gamification object dynamically for dsiciplinary
let disciplinaryObject= {
unqUserObjectId:unqUserObjectId,
userId: userId,
pointType:"Disciplinary",
centerId: schoolId,
classOfCenter: classOfCenter,
poorRankCount: 0,
averageRankCount:0,
goodRankCount:0,
excellentRankCount:0,
 date: new Date()
}

if (rank === "Poor") {
  findGamificationData[0].poorRankCount = findGamificationData[0].poorRankCount + 1 ;
} else if (rank === "Average") {
  findGamificationData[0].averageRankCount = findGamificationData[0].averageRankCount + 1;
} else if (rank === "Good") {
  findGamificationData[0].goodRankCount = findGamificationData[0].goodRankCount + 1;
} else if (rank === "Excellent") {
  findGamificationData[0].excellentRankCount = findGamificationData[0].excellentRankCount + 1;
}


const response = await GamificationRanking.create(findGamificationData[0])

console.log("I am updated existing data")
} else {
console.log("i am insdie else block")
console.log(findGamificationData)
console.log(unqUserObjectId)


//Crating gamification object dynamically for dsiciplinary
let disciplinaryObject= {
unqUserObjectId:unqUserObjectId,
userId: userId,
pointType:"Disciplinary",
centerId: schoolId,
classOfCenter: classOfCenter,
poorRankCount: 0,
averageRankCount:0,
goodRankCount:0,
excellentRankCount:0,
 date: new Date()
}

if (rank === "Poor") {
  disciplinaryObject.poorRankCount = 1;
} else if (rank === "Average") {
  disciplinaryObject.averageRankCount = 1;
} else if (rank === "Good") {
  disciplinaryObject.goodRankCount = 1;
} else if (rank === "Excellent") {
  disciplinaryObject.excellentRankCount = 1;
}

const response = await GamificationRanking.create(disciplinaryObject)


}





//-------------------------------------------------------------------------------------   






//Per center only two ranks are allowed
if (sumOfRankPoints>=2){
  console.log(sumOfRankPoints)
  console.log("No more points can be assigned to this center, limit exhausted")
  res.status(200).json({status:"Ok", message:"Point Exhausted"})
  return;
}



  //Now if disciplniaryExist then we will update current object
if(rank === 'Poor'){
  disciplinaryExist[0].poorRankCount = disciplinaryExist[0].poorRankCount + 1
} else if (rank === 'Average'){
  disciplinaryExist[0].averageRankCount = disciplinaryExist[0].averageRankCount + 1
} else if (rank === 'Good'){
  disciplinaryExist[0].goodRankCount = disciplinaryExist[0].goodRankCount + 1
} else if (rank === 'Excellent'){
  disciplinaryExist[0].excellentRankCount = disciplinaryExist[0].excellentRankCount + 1
}

//Point assigning logic.
let point;
if(totalStudentCount >= 0 && totalStudentCount <= 9){
  if(rank === "Poor"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -10;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 5;;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 10;} //point/2
} else if (totalStudentCount >= 10 && totalStudentCount <= 14){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -12.5;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 6.25;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 12.5;} //point/2
}else if (totalStudentCount >= 15 && totalStudentCount <= 19){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -15;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 7.5;} // point/4
  else if(rank === "Excellent"){point = 15;} //point/2
} else if (totalStudentCount >= 20 && totalStudentCount <= 24){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -17.5;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 8.75;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 17.5;} //point/2
} else if (totalStudentCount >= 25 && totalStudentCount <= 29){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -20;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 10;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 20;} //point/2
}else if (totalStudentCount >= 30 && totalStudentCount <= 39){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -25;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 12.5;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 25;} //point/2
}else if (totalStudentCount >= 40 && totalStudentCount <= 49){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -27.5;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 13.75;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 27.5;} //point/2
}else if (totalStudentCount >= 50 && totalStudentCount <= 200){
  if(rank === "Poor"){ disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + -30;} // -point/2
  else if(rank === "Average"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 0;} //0
  else if(rank === "Good"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 15;} // point/4
  else if(rank === "Excellent"){disciplinaryExist[0].finalPoint =  disciplinaryExist[0].finalPoint + 30;} //point/2
}


  console.log('I am total stu count', totalStudentCount)
  console.log('I am rank value', rank)


const response  = await Gamification.create(disciplinaryExist[0])

res.status(200).json({status:"Ok", data:response})






console.log("existing data updated")

  return;
}



//Crating gamification object dynamically for dsiciplinary
let disciplinaryObject= {
unqUserObjectId:findCC[0]._id,
userId: findCC[0].userId, //userId,
pointType:"Disciplinary",
centerId: schoolId,
classOfCenter: classOfCenter,
poorRankCount: 0,
averageRankCount:0,
goodRankCount:0,
excellentRankCount:0,
examId: null,
finalPoint:point,
pointGivenBy:null,
pointClaimed:false,
 date: new Date()
}

if (rank === "Poor") {
  disciplinaryObject.poorRankCount = 1;
} else if (rank === "Average") {
  disciplinaryObject.averageRankCount = 1;
} else if (rank === "Good") {
  disciplinaryObject.goodRankCount = 1;
} else if (rank === "Excellent") {
  disciplinaryObject.excellentRankCount = 1;
}


console.log(disciplinaryObject)

  try {

    //Creating fresh gamification data and storing it into DB.

    const response  = await Gamification.create(disciplinaryObject)
    
    

    console.log("I am response",response)

    
    
//Function that stores each users data who are giving ranking.
const storeGamificationRankOfUsers = async () =>{
//Crating gamification object dynamically for dsiciplinary
let disciplinaryObject= {
unqUserObjectId:unqUserObjectId,
userId: userId,
pointType:"Disciplinary",
centerId: schoolId,
classOfCenter: classOfCenter,
poorRankCount: 0,
averageRankCount:0,
goodRankCount:0,
excellentRankCount:0,
 date: new Date()
}

if (rank === "Poor") {
  disciplinaryObject.poorRankCount = 1;
} else if (rank === "Average") {
  disciplinaryObject.averageRankCount = 1;
} else if (rank === "Good") {
  disciplinaryObject.goodRankCount = 1;
} else if (rank === "Excellent") {
  disciplinaryObject.excellentRankCount = 1;
}

const response = await GamificationRanking.create(disciplinaryObject)

console.log("I am inside new function")

}

storeGamificationRankOfUsers();

    res.status(200).json({status:"Ok", data:response})
  } catch (error) {
    console.log("Error::::>", error)
  }
}

//----------------------------------------------









//Api for get disciplinaryGamification data.

export const getDisciplinaryGamificationData = async (req, res) =>{

  console.log("Hello gamification disci data")

  const startDate = new Date();
  const endDate = new Date ();

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);




  try {
    const response = await Gamification.find({
      pointType:"Disciplinary",
      date:{$gte:startDate, $lte:endDate}
  })

  res.status(200).json({status:"Ok", data: response})

  } catch (error) {
    console.log("Error::::>", error)
  } 
    
    
}


//Get all gamification data.

export const getAllGamificationData = async (req, res) =>{

  console.log('Hello Get all gamification data')

  const {unqUserObjectId} = req.body;

  console.log(req.body)

  // const unqUserObjectId = "68c1f6c442aa3b998a0ad9e4"

  const startDate = new Date();
  const endDate = new Date ();

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

console.log(startDate)


  try {
    const response = await Gamification.find({
      unqUserObjectId:unqUserObjectId,
  })


  res.status(200).json({status:"Ok", count:response.length, data: response})

  } catch (error) {
    console.log("Error::::>", error)
  } 
    
    
}


//update pointClaimed field in gamification
export const pointClaimedUpdation = async (req, res) =>{

  console.log('Hello Point claimed gamification data')

  const {unqUserObjectId, pointType, centerId, classOfCenter, date} = req.body;

  console.log(req.body)

  // const unqUserObjectId = "68c1f6c442aa3b998a0ad9e4"
  // const pointType = "Self_Attendance"
  // const centerId = "4025"

  // const classOfCenter = "9,10"

  

  const startDate = new Date(date);
  const endDate = new Date (date);

  console.log("i am start date:", startDate)

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);




  try {
    const response = await Gamification.find({
      unqUserObjectId:unqUserObjectId,
      pointType:pointType,
       centerId:centerId,
       classOfCenter:classOfCenter,
      date:{$gte:startDate, $lte:endDate}
  })


  if (response.length>0){

    response[0].pointClaimed = true;

    const Response = await Gamification.create(response[0])

    console.log("Upated gamification data")
  }


  res.status(200).json({status:"Ok", count:response.length, data: response})

  } catch (error) {
    console.log("Error::::>", error)
  } 
    
    
}







//Get all user marked gamification data.

export const getUserMarkedGamificationData = async (req, res) =>{

  // console.log('Hello Get all gamification data')

  const {unqUserObjectId} = req.body;

  console.log(req.body)

  // const unqUserObjectId = "68c1f6c442aa3b998a0ad9e4"

  const startDate = new Date();
  const endDate = new Date ();

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

console.log(startDate)


  try {
    const response = await GamificationRanking.find({
      unqUserObjectId:unqUserObjectId,
      date:{$gte:startDate, $lte:endDate}
  })


 
  res.status(200).json({status:"Ok", count:response.length, data: response})

  } catch (error) {
    console.log("Error::::>", error)
  } 
    
    
}