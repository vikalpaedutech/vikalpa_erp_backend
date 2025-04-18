//employee attendance scheam...

import mongoose, { Schema } from "mongoose";

const EmployeeAttendanceSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeId: {type: String, ref: "Employee", required: true},
    date: { type: Date, default: Date.now, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "On Leave", "WFH"],
      required: true,
    },
    isAttendanceMarked: { type: Boolean, default: false },
    isAttendanceUpdated: { type: Boolean, default: false },
    inTime: { type: String }, // Store as "HH:MM AM/PM" format
    outTime: { type: String },
    remarks: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User"}, // Users like cc and aci will mark there attendance on therir own.
  },
  { timestamps: true }
);

export const EmployeeAttendance = mongoose.model("EmployeeAttendance", EmployeeAttendanceSchema);
