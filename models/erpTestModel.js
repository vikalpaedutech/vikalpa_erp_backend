//This model is for taking test of erp for new users.




//Contains the bills model

import mongoose, { Schema } from "mongoose";

// Expense/Bills Schema
const ErpTestSchema = new Schema(
  {
    //expenseId: { type: String, required: true, unique: true }, // Unique ID for each expense
     unqUserObjectId: {
              type: mongoose.Schema.Types.ObjectId, // reference to User
              ref: "User",
              required: true,
            },
    userId: { type: String, ref: "User", required: true }, // Reference to the user who created the expense
    
    password: {type: String, default:'1234'},
    disciplinary: {type: Boolean, default: false},
    copyChecking: {type: Boolean, default: false},
    selfAttendance: {type: Boolean, default: false},
    studentAttendanceCount: {type: Number, default:0},
    downloadAttendancePdfFormat: {type: Boolean, default: false},
    uploadAttendancePdfFormat: {type: Boolean, default: false},
    uploadMarksCount: {type:Number, default: 0},
    techConcern: {type: Boolean, default: false},
    schoolConcern: {type: Boolean, default: false},
    studentRelatedConncern: {type: Boolean, default: false},
    individualConcern: {type: Boolean, default: false}
   
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const ErpTest = mongoose.model("ErpTest", ErpTestSchema);
