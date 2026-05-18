//studentDisciplinary.model.js

import mongoose, {mongo, Schema} from "mongoose";

const StudentDisciplinarySchema = new Schema (

    {
       unqStudentObjectId: {
                      type: mongoose.Schema.Types.ObjectId, // reference to User
                      ref: "Student",
                      required: true,
                    },
        studentSrn: {type: String, required: true},
        // firstName: {type: String, required: true},
        // fatherName: {type: String, required: true},
        // classofStudent: {type: String, required: true},
        batch: {type:String},
        districtId: { type: String, ref: "District", required: true },
        blockId: { type: String, ref: "Block", required: true },
        schoolId: { type: String, ref: "School", required: true },
        subject: {type: String},
        status: {type: String}, // this holds the values like Disciplinary issue, Interaction
        remark: {type: String},
       
        classWorkChecking: {type: String},
        homeWorkChecking: {type: String},
        comment: {type: String},
        userId: {type: String, ref:"User"}
    },
    {timestamps: true}
)

export const StudentDisciplinary = mongoose.model("StudentDisciplinary", StudentDisciplinarySchema);





