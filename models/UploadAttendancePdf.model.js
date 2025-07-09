// BACKEND/models/UploadAttendancePdf.model.js

//This model defines the pdf upload schema for the users who will upload attendance pdf.

import mongoose, {mongo, Schema} from "mongoose";


//CRON JOB FOR INITALIZING DATA INTO DB. It's entry point is in app.js
const UploadAttendancePdfSchema = new Schema (

    {
        userId: {type: String, ref: "User"},
        districtId: {type: String, ref: "District"},
        districtName: {type: String, ref: "District"},
        blockId:{type: String, ref: "Block"},
        blockName: {type: String, ref: "Block"},
        schoolId: {type: String, ref:"School"},
        schoolName: {type: String, ref: "School"},
        classofStudent:{type: String, required: true},
        isPdfUploaded: {type: Boolean, default: false},
        dateOfUpload: {type: Date,   required: true}, //default: Date.now,
        fileName: { type: String }, // Name of the file attached to the expense (e.g., receipt image)
        fileUrl: { type: String }, // URL link to the file (e.g., location in cloud storage)

    },
    {timestamps: true}
);

export const AttendancePdf = mongoose.model("AttendancePdf", UploadAttendancePdfSchema)
//__________________________________________________________________________________________________






// default: () => {
//             const now = new Date();
//             now.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000
            
            
//             return now;
//           },