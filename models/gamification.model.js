//This holds the gamification model. 

import mongoose, {mongo, Schema} from "mongoose";

const GamificationSchema = new Schema(
    
    
    {
      userId: { type: String },
      pointType: {type: String},
      id: {type: String}, //Holds schoolIdorCode, examId, expenseId, Test ids
      examId: {type: String}, //Holds exam ids for test
      classofStudent:{type: String},
      point: {type: Number},
      

      disciplinaryRemark1: {type: String,},
      disciplinaryRemark1Count: {type: Number,},
      disciplinaryRemark2: {type: String, },
      disciplinaryRemark2Count: {type: Number,},
      disciplinaryRemark3: {type: String, },
      disciplinaryRemark3Count: {type: Number, },
      disciplinaryRemark4: {type: String,},
      disciplinaryRemark4Count: {type: Number,},


      dateOfPoint: {type: Date},

    },
    { timestamps: true }
  );


//   // 🔐 Add unique compound index to prevent duplicates
// GamificationSchema.index({
//   userId: 1,
//   pointType: 1,
//   id: 1,  // schoolId
//   classofStudent: 1,
//   examId: 1
// }, { unique: true });
  
//   export default mongoose.model("Employee", EmployeeSchema);

  export const Gamification = mongoose.model("Gamification", GamificationSchema);
  