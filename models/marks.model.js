//This model contains marks schema.

import mongoose, { Schema } from "mongoose";

// Marks Schema
const MarksSchema = new Schema(
  {
    unqStudentObjectId: {
                  type: mongoose.Schema.Types.ObjectId, // reference to User
                  ref: "Student",
                  required: true,
                },
    studentSrn: { type:String, ref: "Student", required: true }, // Reference to the student schema
    firstName:{type: String, ref: "Student", required: true},
    fatherName:{type: String, ref: "Student", required: true},
    districtId: { type: String, ref: "District", required: true },
    blockId: { type: String, ref: "Block", required: true },
    schoolId: { type: String, ref: "School", required: true },
    classofStudent: { type: String, ref: "Student",required: true },
    examId: {type: String, ref:"ExamAndTest", required: true},
    marksObtained: { type: Number,  }, // Marks obtained by the student
    recordedBy: { type: String, ref: "User",}, // Reference to the user who recorded the marks
    remark: { type: String }, // Additional remarks if any
    marksUpdatedOn: { type: Date, default: Date.now }, // Date when marks were updated
   
    
    
    
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const Marks = mongoose.model("Marks", MarksSchema);