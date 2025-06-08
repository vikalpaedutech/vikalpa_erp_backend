//Student attendance model

import mongoose, { Schema } from "mongoose";

const StudentAttendanceSchema = new Schema(
  {
    //student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    studentSrn: {type: String, ref: "Student", required: true },
    //firstName: { type: String, ref: "Student", required: true },
    // lastName: { type: String, ref: "Student", required: true },
    //fatherName: { type: String, ref: "Student", required: true  },
    date: { type: Date, default: Date.now, required: true },
    //districtId: { type: String, ref: "District", },
    //blockId: { type: String, ref: "Block", },
    //schoolId: { type: String, ref: "School",},
    //classofStudent: { type: String, required: true },
    //batch: { type: String },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      required: true,
    },
    isAttendanceMarked: { type: Boolean, default: false },
    //isAttendanceUpdated: { type: Boolean, default: false },
    TA: { type: Number, default: 0 }, // TA (Attendance * both side distance)
    absenteeCallingStatus: {type: String, default:"Not-called"}, //Holds values like, connected, not-connected, wrong-number
    callingRemark1: {type: String, default:null},
    callingRemark2: {type: String, default:null},
    comments: {type: String, default:null},

  },

  //below fields are for absentee callings.
  
  { timestamps: true }
);

export const StudentAttendance = mongoose.model("StudentAttendance", StudentAttendanceSchema);