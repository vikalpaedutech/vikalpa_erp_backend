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
    ],
     disciplinary: [
      {
        startRange: {
          type: Number,
          default: 0
        },
        endRange: {
          type: Number,
          default: 0
        },
        point: {
          type: Number,
          default: 0
        },
        description: {
          type: String
        },
        timeValidation: {
          type: String,
          default: null
        },
        descriptionOfTimeValdidation: {
          type: String,
          default: null
        },
        negativeMarkingOnBreakingTimeValidation: {
          type: Number,
          default: 0,
          description: "Half the negative points of poor ranking"
        }
      }
    ]
  },
  {
    timestamps: true
  }
)




//Below model is for updating points of users
const GamificationPointOfUserScheam = new Schema(
  {
    unqObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    
     
    },
    pointType: {type: String}, //selfAttendancePoint, studentAttendancePoint, pdfUploadPoint, callingAbsenteePoint, marksPoint
    pointValue: {type: Number},
    // classOfCenter: {type: String},
    batch: {type: String},
    unqIdOfPointObject:{type: mongoose.Schema.Types.ObjectId},  //Id like exam id or so...
    isPointClaimed: {type:Boolean, default: false},
    examId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: "examAndTest",
    },
    gamificationDate: {type: Date},
    disciplinaryPointValues:[
      {
      beforeNoon: {type:Number, default:null},
      unqIdOfPointObject:{type: mongoose.Schema.Types.ObjectId},
       batch: {type: String},
    },
    {
       afterNoon: {type: Number, default: null},
       unqIdOfPointObject:{type: mongoose.Schema.Types.ObjectId},
        batch: {type: String},
    }
    ]
  },
  { timestamps: true }
)





//This schema is for storing the users data who are the contestants of gamificaition
//It will store contestant who will be the part of gamification privilige

const GamificationContestantSchema = new Schema ({
  unqUserObjectId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
  },
  schoolId:{type: Array, default: [null]},
  batch: {type: Array, default: [null]},

},
{ timestamps: true })







const GamificationRankSchema = new Schema ({
  unqUserObjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    unique: true 
  },
  month: { type: String, required: true }, // "2026-08"
  totalPoints: { type: Number, default: 0 },
  pointsClassification: {
    selfAttendance: { type: Number, default: 0 },
    studentAttendance: { type: Number, default: 0 },
    uploadPdf: { type: Number, default: 0 },
    callingAbsentee: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    disciplinary: { type: Number, default: 0 }
  },
  rank: { type: Number, default: 0 },
  calculatedAt: { type: Date, default: Date.now },

},
{ timestamps: true })






export const GamificationPointLogic =  mongoose.model("GamificationPointLogic", GamificationPointLogicSchema);




export const GamificationUserPoint =  mongoose.model("GamificationUserPoint", GamificationPointOfUserScheam)




export const GamificationContestant = mongoose.model("GamificationContestant",GamificationContestantSchema)


export const GamfificationRank = mongoose.model("GamfificationRank",GamificationRankSchema)