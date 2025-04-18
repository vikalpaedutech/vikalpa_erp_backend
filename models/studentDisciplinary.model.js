//studentDisciplinary.model.js

import mongoose, {mongo, Schema} from "mongoose";

const StudentDisciplinarySchema = new Schema (

    {
        studentSrn: {type: String, required: true},
        firstName: {type: String, required: true},
        fatherName: {type: String, required: true},
        classofStudent: {type: String, required: true},
        districtId: { type: String, ref: "District", required: true },
        blockId: { type: String, ref: "Block", required: true },
        schoolId: { type: String, ref: "School", required: true },
        subject: {type: String},
        disciplinaryOrInteraction: {type: String}, // this holds the values like Disciplinary issue, Interaction
        disciplinaryOrInteractiionRemark: {type: String},
        remark: {type: String},
        userId: {type: String, ref:"User"}
    },
    {timestamps: true}
)

export const StudentDisciplinary = mongoose.model("StudentDisciplinary", StudentDisciplinarySchema);
