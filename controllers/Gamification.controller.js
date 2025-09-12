import mongoose from "mongoose";
import { Gamification } from "../models/gamification.model.js";
import { UserAccess } from "../models/user.model.js";
import { User } from "../models/user.model.js";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { Student } from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";


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



export const selfAttendanceGamification = async (req, res) =>{

    console.log('Hello self attendance')

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

 console.log("Hello Result")


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
      data: findAttendance //result[0].accesses[0].region
    });



    } catch (error) {
        console.log('Error::::>', error)

        res.status(500).json({status: "Success", message:"Error updating "})
    }


}



export const studentAttendanceGamification = async (req, res) =>{

    console.log("Hello student attendance gamification")

    const {unqUserObjectId, schoolId, classOfCenter, userId} = req.body;

    console.log(req.body)

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

    console.log("dates are", startDate, endDate)

    const fetchPresentStudentCountFromStudentAttendances = await StudentAttendance.find({
        unqStudentObjectId: {$in:allStudentId},
        date: {$gte:startDate, $lte:endDate},
        status: 'Present'
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



        console.log(findRegionWithItsUser[0])   
        
        

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


    try {
        
    } catch (error) {
        
    }
}

