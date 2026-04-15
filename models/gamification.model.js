//This holds the gamification model 


import mongoose, {Schema} from "mongoose";
import { User } from "./user.model.js";

const GamificationPointLogicSchema = new Schema(
  {
    selfAttendance: [
      {
        startTime: { 
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          description: "Time in HH:MM format (24-hour)"
        },
        endTime: { 
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          description: "Time in HH:MM format (24-hour)"
        },
        point: { 
          type: Number, 
          required: true,
          default: 0
        },
        description: {type: String},  // Fixed: 'type' not 'tyype', removed default null
        timeValidation: {type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/},
        descriptionOfTimeValdidation: {type: String, default: '"if attendance gets marked after school time (2:40 PMB), then negative marks is given"'},
        negativeMarkingOnBreakingTimeValidation: {
          type: Number,
          default: -10,
        }
      },
    ],

    studentAttendance: [
      {
        startRange: {type: Number, default: 0},
        endRange: {type: Number, default: 0},
        point: {type: Number, default: 0},
        description: {type: String},  // Fixed here too
        timeValidation: {type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, description: "Time in HH:MM format (24-hour)"},
        descriptionOfTimeValdidation: {type: String, default: "if attendance gets marked after school time (2:40 PMB), then negative marks is given"},
        negativeMarkingOnBreakingTimeValidation: {
          type: Number,
          default: -15,
        }
      }
    ],

    pdfUpload: [
      {
        timeValidation: {type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, description: "Time in HH:MM format (24-hour)"},
        point: {type: Number, default: 0},
        description: {type: String},  // Added missing description field
        descriptionOfTimeValdidation: {type: String, default: "if pdf gets uploaded after (2:40 PM), then negative marks is given"},
        negativeMarkingOnBreakingTimeValidation: {type: Number, default: -5}
      }
    ],

    callingAbsentee: [
      {
        startRange: {type: Number, default: 0},
        endRange: {type: Number, default: 0},
        point: {type: Number, default: 0},
        description: {type: String},  // Fixed here too
        timeValidation: {type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, description: "Time in HH:MM format (24-hour)"},
        descriptionOfTimeValdidation: {type: String, default: "if calling done after school time (2:40 PMB), then negative marks is given"},
        negativeMarkingOnBreakingTimeValidation: {type: Number, default: -15}
      }
    ],

    marks: [
      {
        startRange: {type: Number, default: 0},
        endRange: {type: Number, default: 0},
        point: {type: Number, default: 0},
        description: {type: String},  // Fixed here too
        timeValidation: {type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, description: "Time in HH:MM format (24-hour)"},
        descriptionOfTimeValdidation: {type: String, default: "if marks gets updated after school time (2:40 PMB), then negative marks is given"},
        negativeMarkingOnBreakingTimeValidation: {type: Number, default: -15},
        examId:{type: String}
      }
    ]
  },
  {
    timestamps: true
  }
)




// //Below model is for updating points of users
// const GamificationPointOfUserScheam = new Schema(
//   {
//     unqObjectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true
//     },
    
//     class8: {
//       selfAttendancePoint: { type: Number, default: 0 },
//       studentAttendancePoint: { type: Number, default: 0 },
//       pdfUploadPoint: { type: Number, default: 0 },
//       callingAbsenteePoint: { type: Number, default: 0 },
//       marksPoint: { type: Number, default: 0 }  // Fixed typo
//     },
    
//     class10: {
//       selfAttendancePoint: { type: Number, default: 0 },
//       studentAttendancePoint: { type: Number, default: 0 },
//       pdfUploadPoint: { type: Number, default: 0 },
//       callingAbsenteePoint: { type: Number, default: 0 },
//       marksPoint: { type: Number, default: 0 }  // Fixed typo
//     }, 

//     gamificationDate: {type: Date}
//   },
//   { timestamps: true }
// )







//Below model is for updating points of users
const GamificationPointOfUserScheam = new Schema(
  {
    unqObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    pointType: {type: String}, //selfAttendancePoint, studentAttendancePoint, pdfUploadPoint, callingAbsenteePoint, marksPoint
    pointValue: {type: Number},
    classOfCenter: {type: String},
    unqIdOfPointObject:{type: mongoose.Schema.Types.ObjectId},  //Id like exam id or so...



    gamificationDate: {type: Date}
  },
  { timestamps: true }
)


export const GamificationPointLogic =  mongoose.model("GamificationPointLogic", GamificationPointLogicSchema);



export const GamificationUserPoint =  mongoose.model("GamificationUserPoint", GamificationPointOfUserScheam)




