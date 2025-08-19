//This handles the disciplinary part of the gamification.
//This will use the utils of disciplinary, 

import { awardPoints } from "../utils/gamification.utils.js"
import { Gamification } from "../models/gamification.model.js";

// export const disciplinaryGamification = (req, res) =>{

// console.log('hellow route')

// const {keyValue, disciplinaryValue, schoolId, classofStudent } = req.body;

// console.log(req.body)
// console.log(keyValue)

//     //Handling gamification point for disciplinary.
            
//     // const date = loginTime



//         //   const keyValue = "disciplinary"

//           const AwardPoints = awardPoints({keyValue, disciplinaryValue, schoolId, classofStudent})


//     //------------------------------------------------------------

//     res.status({status:"Success", message:"Point updated successfully"})



// console.log(req.query)


// console.log(new Date())

// }








//This handles the disciplinary part of the gamification.
//This will use the utils of disciplinary, 



export const disciplinaryGamification = (req, res) =>{

  console.log('hellow route')

  const {keyValue, disciplinaryValue, schoolId, classofStudent } = req.body;

  console.log(req.body)
  console.log(keyValue, disciplinaryValue, schoolId, classofStudent)

  try {
    // ✅ your existing logic (whatever processing / awardPoints etc.)
    awardPoints(req.body);

    // ✅ send response so frontend request can complete
    res.status(200).json({
      success: true,
      message: "Disciplinary gamification saved successfully",
      data: req.body
    });

  } catch (error) {
    console.error("Error in disciplinaryGamification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}


//Get api to fetch ponitType: 'disciplinary' for current date only--


export const getDisciplinaryGamificationDocumentsForCurrentDate = async (req, res) =>{

    console.log('hello fetch disciplinary')
   try {
    const now = new Date();

    const startOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    console.log("Query range:", { startOfDay, endOfDay });

    const documents = await Gamification.find({
      pointType: "disciplinary",
      dateOfPoint: { $gte: startOfDay, $lte: endOfDay }
    });

    console.log("Found documents:", documents);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error("Error fetching disciplinary gamification docs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

//--------------------------------------------------------------------------------------------------