//Holds the block data

import mongoose, { Schema } from "mongoose";

const BlockSchema = new Schema(
  {
    blockId: { type: String, required: true, unique: true },
    blockName: { type: String, required: true },
    districtId: { type: String, ref: "District", required: true },
    //schools: [{ type: Schema.Types.ObjectId, ref: "School" }],
  },
  { timestamps: true }
);

export const Block =  mongoose.model("Block", BlockSchema);