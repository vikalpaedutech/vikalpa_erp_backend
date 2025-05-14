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
  },
 

  {
    timestamps: true,
  }
);

export const UserAttendance = mongoose.model(
  "UserAttendance",
  userAttendanceSchema
);
