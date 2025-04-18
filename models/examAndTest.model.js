//Student marks schema

import mongoose, { Schema } from "mongoose";

const ExamAndTestSchema = new Schema(
  {
    examId: { type: String, required: true, unique: true }, //Each exam or test must have unqid
    examType: { type: String, required: true }, //Exam type like class test, Half Yearly, Anual exam
    examBoard: {type: String}, //CBSE, HBSE
    subject: { type: String, required: true }, //Hindi, English, Maths...
    examDate: { type: Date, required: true }, //Date of exam conduction
    description: { type: String, }, //breif exam description. It is optional
    maxMarks: { type: Number, required: true }, //Mas marks. Optional
    passingMarks: { type: Number,  }, //Passing marks
    batch: { type: String }, // batch of students
    classofStudent: { type: String, required: true }, //Class like 8, 10
  },
  { timestamps: true }
);

export const ExamAndTest = mongoose.model("ExamAndTest", ExamAndTestSchema);
