//Defining student model.

import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema(
  {
    studentSrn: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    //lastName: { type: String },
    fatherName: { type: String,  },
    motherName: { type: String,  },
    email: { type: String,  },
    personalContact: {type: String},
    ParentContact: { type: String,},
    otherContact: { type: String },
    dob: { type: Date, },
    gender: { type: String, required: true },
    category: { type: String },
    address: { type: String, },
    districtId: { type: String, ref: "District", required: true },
    blockId: { type: String, ref: "Block", required: true },
    schoolId: { type: String, ref: "School", required: true },
    classofStudent: { type: String, required: true },
    parent: { type: String, ref: "User" },
    enrollmentDate: { type: Date,  },
    batch: { type: String },

    session: {type: Map, default: {
      session1: null,
      session2: null,
    }}, //Student enrolls for two years so this field contains object which can be updated to students current session

    documents: { type: Object, default: {} },
    singleSideDistance: { type: Number },
    bothSideDistance: { type: Number },
    slc: { type: Boolean, default: false },
    isSlcTaken: { type: Boolean, default: false },
    slcReleasingDate: { type: Date },
    erpEnrollingDate: { type: Date },
    medium: { type: String, enum: ["CBSE", "HBSE"], required: true },
    isStudentOf: { type: String, enum: ["MB", "S100", "Others"], required: true },
    isDressGiven: { type: Boolean, default: false },
    isTabGiven: { type: Boolean, default: false },
    tabIMEI: { type: String },
    isSimGiven: { type: Boolean, default: false },
    simNumber: {type: String,},
    simIMSI: { type: String },
    bankName: { type: String },
    bankIFSC: { type: String },
    bankAccNumber: { type: String },
    bankHolderName: { type: String },
    batchCompleted: {type: Boolean, default: false} //It is set to true when students have completed there two years in programme
  },
  { timestamps: true }
);

// export const Student =  mongoose.model("Student", StudentSchema);


export const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
