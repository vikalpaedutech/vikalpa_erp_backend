

// import mongoose, { Schema } from "mongoose";

// const DailyWorkSchema = new Schema({
//     unqUserObjectId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//     },
//     task: { type: String, default: null },
//     taskAssignedBy: { type: String, default: null },
//     startDate: { type: Date, default: null },
//     endDate: { type: Date, default: null },
//     taskDeadline: { type: Date, default: null },
//     totalHoursTakenToFinishTask: { type: Number, default: 0 }, // 🔥 Number, not Date
//     totalDaysTakenToFinishTask: { type: Number, default: 0 },
//     challengesFaceOnTask: { type: String, default: null },
//     howChallengeResolved: { type: String, default: null },
//     isDeadlineCrossed: { type: Boolean, default: false },
//     taskStatus: { type: String, enum: ['Pending', 'Working', 'Completed', 'Blocked', 'On-Hold'], default: 'Pending' },
//     reasonDeadlineCrossed: { type: String, default: null },
//     isDeleted: { type: Boolean, default: false },
//       // ... existing fields ...
//     assignedTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     assignedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     assignedByRole: { type: String },
//     assignedByDepartment: { type: String },
//     assignedToDepartment: { type: String },
//     // ... rest fields
// }, { timestamps: true });

// const DailyWorkStatusSchema = new Schema({
//     taskId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "DailyWork",
//         required: true
//     },
//     performedHow: { type: String, trim: true },
//     toolsUsed: { type: [String], default: [] },
//     challengesFaced: { type: String, trim: true },
//     challengesResolution: { type: String, trim: true },
//     actualTimeTaken: { type: Number, default: 0 },
//     workProof: { type: [String], default: [] },
//     taskStatus: { type: String, enum: ['Pending', 'Working', 'Completed'], default: 'Working' },
//     supportRequired: { type: String, default: '' },
//     date: { type: Date, default: Date.now },
//     statusUpdatedAt: { type: Date, default: Date.now },
//     isDeleted: { type: Boolean, default: false }
// }, { timestamps: true });

// export const DailyWork = mongoose.model("DailyWork", DailyWorkSchema);
// export const DailyWorkStatus = mongoose.model("DailyWorkStatus", DailyWorkStatusSchema);











import mongoose, { Schema } from "mongoose";

const DailyWorkSchema = new Schema({
    // ============ User Assignment Fields ============
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedByRole: { type: String, default: null },
    assignedByDepartment: { type: String, default: null },
    assignedToDepartment: { type: String, default: null },

    // ============ Task Fields ============
    task: { type: String, default: null },
    taskAssignedBy: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    taskDeadline: { type: Date, default: null },
    totalHoursTakenToFinishTask: { type: Number, default: 0 },
    totalDaysTakenToFinishTask: { type: Number, default: 0 },
    challengesFaceOnTask: { type: String, default: null },
    howChallengeResolved: { type: String, default: null },
    isDeadlineCrossed: { type: Boolean, default: false },
    taskStatus: { 
        type: String, 
        enum: ['Pending', 'Working', 'Completed', 'Blocked', 'On-Hold'],
        default: 'Pending'
    },
    reasonDeadlineCrossed: { type: String, default: null },
    isDeleted: { type: Boolean, default: false }
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
    taskStatus: { 
        type: String, 
        enum: ['Pending', 'Working', 'Completed'],
        default: 'Working'
    },
    supportRequired: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    statusUpdatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const DailyWork = mongoose.model("DailyWork", DailyWorkSchema);
export const DailyWorkStatus = mongoose.model("DailyWorkStatus", DailyWorkStatusSchema);