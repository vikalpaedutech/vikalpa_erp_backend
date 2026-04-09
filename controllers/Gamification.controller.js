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





//Point assignments logic.
//This runs a function, taking user object id, then updates the point corrresponding

export const GamificationPointAssigningToUsers = async (req, res) => {
console.log("helloo")
const {userObjectId} = req.body;

console.log(req.body)


  try {
    const response = await GamificationPointLogic.find({})
    

    //Giving points to attendance on current date and gamification logic
    
const start = new Date();
start.setHours(0,0,0,0);

const end = new Date();
end.setHours(23,59,59,999);

const userAttendanceResponse = await UserAttendance.find({
  unqUserObjectId: userObjectId,
  date: {
    $gte: start,
    $lte: end
  }
});




    // res.status(200).json({status:'Ok', data: response, data2: userAttendanceResponse})

    //  res.status(200).json({status:'Ok', data: response[0].selfAttendance})

          res.status(200).json({status:'Ok', data:userAttendanceResponse })

          console.log(userAttendanceResponse[0].createdAt)

          const userAttendanceTime =  userAttendanceResponse[0].createdAt.toLocaleTimeString('en-In',
            {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }
          )

          console.log(userAttendanceTime.split(':'))
          const joinedResult = userAttendanceTime.split(':').join('')
          console.log(Number(joinedResult))
         


  } catch (error) {
    res.status(500).json({status:"Failed", message: "Internal server error", error: error.message})
  }
}