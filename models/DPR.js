// import { Deadline } from "aws-sdk";
// import mongoose, {Schema} from "mongoose";


// const DailyWorSchema = new Schema({

//     unqUserObjectId:{
//          type: mongoose.Schema.Types.ObjectId, // reference to User
//          ref: "User",
//          required: true,
//     },
//     task: {type: String, default:null}, //task title
//     taskAssignedBy: {type:String, default:null}, //who assigned the task
//     startDate: {type: Date, default: new Date()}, //time when task is started
//     endDate: {type: Date, default: new Date()},
//     taskDeadline: {type:Date, default:new Date()},
//     totalHoursTakenTofinishTask: {type: Date, default: null},
//     totalDaysTakenToFinishTask: {type:Number, default:null},
//     challengesFaceOnTask:{type: String, default:null}, //user writes the challenges{
//     howChallengeResolved: {type: String, default:null}, //user writes how the challenge were resolved
//     isDeadlineCrossed:{type: Boolean, default:null}, //tru or false
//     taskStatus: {type:String}, //Pending, Working, Completed
//     reasonDeadlineCrossed: {type: String, default:null},
//      isDeleted: { type: Boolean, default: false } // 🆕 Soft delete ke liye
// },
// {timestamps:true})


// const DailyWorkStatus = new Schema ({
//     taskId:{type: mongoose.Schema.Types.ObjectId, // reference to User
//     ref: "DailyWorkReport",
//     required: true},
//     performedHow: { type: String, trim: true }, // task kaise perform kiya
//     toolsUsed: { type: [String], default: [] }, // which tool (array allow multiple)
//     challengesFaced: { type: String, trim: true },
//     challengesResolution: { type: String, trim: true },
//     actualTimeTaken: { type: Number }, // 🔥 ADD THIS - actual time vs estimated
//     workProof: { type: [String], default: [] }, // 🔥 ADD THIS - screenshots, file URLs
//     taskStatus: { type: String, enum: ['Pending', 'Working', 'Completed'] },
//     supportRequired: { type: String }, // kisi aur ki help lagi toh
//     date:{type: Date, default:new Date()},
//     statusUpdatedAt: { type: Date, default: Date.now }, // status fill karne ka exact time
//       isDeleted: { type: Boolean, default: false } // 🆕 Soft delete ke liye
//   },
//   {timestamps:true}
// )


// export const DailyWork = new mongoose.model("DailyWork", DailyWorSchema )

// export const DailyWorkStatus = new mongoose.model("DailyWorkStatus", DailyWorkStatus )




import mongoose, { Schema } from "mongoose";

const DailyWorkSchema = new Schema({
    unqUserObjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    task: { type: String, default: null },
    taskAssignedBy: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    taskDeadline: { type: Date, default: null },
    totalHoursTakenToFinishTask: { type: Number, default: 0 }, // 🔥 Number, not Date
    totalDaysTakenToFinishTask: { type: Number, default: 0 },
    challengesFaceOnTask: { type: String, default: null },
    howChallengeResolved: { type: String, default: null },
    isDeadlineCrossed: { type: Boolean, default: false },
    taskStatus: { type: String, enum: ['Pending', 'Working', 'Completed', 'Blocked', 'On-Hold'], default: 'Pending' },
    reasonDeadlineCrossed: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
      
}, { timestamps: true });

const DailyWorkStatusSchema = new Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DailyWork",
        required: true
    },
    performedHow: { type: String, trim: true },
    toolsUsed: { type: [String], default: [] },
    challengesFaced: { type: String, trim: true },
    challengesResolution: { type: String, trim: true },
    actualTimeTaken: { type: Number, default: 0 },
    workProof: { type: [String], default: [] },
    taskStatus: { type: String, enum: ['Pending', 'Working', 'Completed'], default: 'Working' },
    supportRequired: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    statusUpdatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const DailyWork = mongoose.model("DailyWork", DailyWorkSchema);
export const DailyWorkStatus = mongoose.model("DailyWorkStatus", DailyWorkStatusSchema);