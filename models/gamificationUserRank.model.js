
import mongoose, { mongo, Schema } from "mongoose";

const GamificationUserRankSchema = new Schema(


    {

        unqUserObjectId: {
            type: mongoose.Schema.Types.ObjectId, // reference to User
            ref: "User",
            required: true,
        },   // 
        userId: { type: String },
        avgScore: { type: Number, default: 0 }, //Gets cumulative avg score
        totalPoints: { type: String, default: 0 }, //sum of total points of each users
        rank: { type: Number },
    },
    { timestamps: true }
);


export const GamificationUserRank = mongoose.model("GamificationUserRank", GamificationUserRankSchema);

