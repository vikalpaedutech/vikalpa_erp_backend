//BACKEND/models/userAttendance.model.js

import mongoose, { Schema } from "mongoose";
import { type } from "os";

const userAttendanceSchema = new Schema(
  {
    userId: { type: String, ref: "User" },
    date: { type: Date, default: Date.now, required: true },
    attendance: { type: String, default: "Absent" },
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
  logoutCoordinateDifference: {type: Number},
  fileName: {type: String}, //Uploaded file name
  fileUrl: {type: String}, //User image
  attendanceType: {type: String}, //center visit, wfh, govt. official visit, event.
  visitingLocation: {type: String}, //visiting location, center name, 
  attendanceMarkedBy: {type: String, default: null}, //Who is updating attendance.
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


