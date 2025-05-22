// BACKEND/models/StudentRelatedCallings.model.js

import mongoose, {Schema} from "mongoose";

const StudentRelatedCallingsScheam = new Schema (
    {
       jobId: {type: String}, 
       callingTitle: {type: String},
       studentSrn: {type: String},
       personalContact:{type: String},
       ParentContact: {type: String},
       otherContact: {type: String},
       remark1: {type: String, default:null},
       remark2: {type: String, default: null},
       comments: {type:String},
       callingStatus: {type: String, default:'Not Connected'},
       date: { type: Date, default: Date.now, required: true },
       


    },
     { timestamps: true }
)

export const StudentRealtedCalling = mongoose.model('StudentRealtedCalling', StudentRelatedCallingsScheam);