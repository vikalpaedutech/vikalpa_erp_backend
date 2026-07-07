//BACKEND/models/userAttendance.model.js

import mongoose, { Schema } from "mongoose";
import { type } from "os";

const userAttendanceSchema = new Schema(
  {


    unqUserObjectId: {
          type: mongoose.Schema.Types.ObjectId, // reference to User
          ref: "User",
          required: true,
        },

    userId: { type: String, ref: "User" },
    date: { type: Date, default: Date.now, required: true },
    attendance: { type: String, default: "Absent" }, //Present, Absent, Leave, WFH, Comp-off, Emergency Leave

    //New added 29-June-2026
    reasonIfNotPresent: {type: String, default: null},
    isLeaveApproved: {type: Boolean, default:null},
    approvalRemark: {type: String, default:null},
    approvedBy: {type: mongoose.Schema.Types.ObjectId, // reference to User
          ref: "User",
          default: null
        },
    //--------------------------------------------------------------------
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
      default: Date.now,
    },
    longitude: { type: Number, default: 0 },
    latitude: { type: Number, default: 0 },
    coordinateDifference: { type: Number },

  logoutLongitude: {type: Number, default: 0},
  logoutLatitude: {type: Number, default: 0},
  logoutCoordinateDifference: {type: Number, default:0},
  fileName: {type: String, default: null}, //Uploaded file name
  fileUrl: {type: String, default:null}, //User image
  attendanceType: {type: String, default: null}, //center visit, wfh, govt. official visit, event.
  visitingLocation: {type: String, default: null}, //visiting location, center name, 
  attendanceMarkedBy: {
          type: mongoose.Schema.Types.ObjectId, // reference to User
          ref: "User",
          required: true,
          default: null
        }, //Who is updating attendance.
  remarkForManualAttendance: {type: String, default:null},// if someone elses marks other user attendane then this field must have remark.

  },


 

 

  {
    timestamps: true,
  }
);

export const UserAttendance = mongoose.model(
  "UserAttendance",
  userAttendanceSchema
);


