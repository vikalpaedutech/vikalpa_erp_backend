//Holds the districtBlockBuniyaadCenters data schema

import mongoose, { Schema } from "mongoose";

const DistrictBlockBuniyaadCenterSchema = new Schema(
  {
    districtId: { type: String },
    districtName: { type: String},
    blockId: {type: String},
    blockName: {type: String},
    schoolId: {type: String},
    schoolName: {type: String}


  },
  { timestamps: true }
);

export const District_Block_School =  mongoose.model("District_Block_School", DistrictBlockBuniyaadCenterSchema);