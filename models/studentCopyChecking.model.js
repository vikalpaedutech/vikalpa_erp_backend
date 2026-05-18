//studentDisciplinary.model.js

import mongoose, {mongo, Schema} from "mongoose";

const StudentCopyCheckingScheam = new Schema (

    {
       unqStudentObjectId: {
                      type: mongoose.Schema.Types.ObjectId, // reference to User
                      ref: "Student",
                      required: true,
                    },
        studentSrn: {type: String, required: true},
        batch: {type:String},
        schoolId: { type: String, ref: "School", required: true },
        subject: {type: String},   //English, hindi, maths...
        copyCheckingType: {type: String, default: null}, //class work, home work
        status: {type: String, default: null}, //complete, incomplete, unavailable
        remark: {type: String}, //If any remark
        date:{type:Date},
        copyCheckingDoneBy: {
                 type: mongoose.Schema.Types.ObjectId, // reference to User
                 ref: "User",
                 required: true,
                 default: null
               }, //Who is updating attendance.
    },
    {timestamps: true}
)

export const StudentCopyChecking = mongoose.model("StudentCopyChecking", StudentCopyCheckingScheam);





