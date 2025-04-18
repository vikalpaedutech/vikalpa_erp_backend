//Schools or mb center schema.


import mongoose, { Schema } from "mongoose";

const SchoolSchema = new Schema(
  {
    schoolId: { type: String, required: true, unique: true },
    schoolName: { type: String, required: true },
    schoolCode: { type: String, required: true, unique: true },
    blockId: { type: String, ref: "Block", required: true },
    districtId: { type: String, ref: "District", required: true },
    address: { type: String, },
    pincode: { type: String,  },
    contactNumber: { type: String, },
    principalName: { type: String,  },
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const School =  mongoose.model("School", SchoolSchema);