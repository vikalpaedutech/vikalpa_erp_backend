//Holds the district schema

import mongoose, { Schema } from "mongoose";

const DistrictSchema = new Schema(
  {
    districtId: { type: String, required: true, unique: true },
    districtName: { type: String, required: true },
    // blocks: [{ type: Schema.Types.ObjectId, ref: "Block" }],
    // totalSchools: { type: Number, default: 0 },
    // totalStudents: { type: Number, default: 0 },
    // totalTeachers: { type: Number, default: 0 },
    // totalBlocks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const District =  mongoose.model("District", DistrictSchema);