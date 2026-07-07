//Defining student model.

import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema(
  {
    studentSrn: { type: String, required: true, unique: true },
    rollNumber: { type: String },


    // rollNumber: { 
    //   type: String, 
    //   required: false, 
    //   unique: true, 
    //   sparse: true,  // This allows multiple null values
    //   index: { 
    //     unique: true, 
    //     partialFilterExpression: { rollNumber: { $type: "string" } } 
    //   } 
    // },


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
    districtId: { type: String, required: true },
    blockId: { type: String, required: true },
    schoolId: { type: String, required: true },
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
    slc: { type: Boolean, default: null },
    isSlcTaken: { type: Boolean, default: null },
    slcReleasingDate: { type: Date },
    erpEnrollingDate: { type: Date },
    medium: { type: String, default:null },  //enum: ["CBSE", "HBSE"]
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
    batchCompleted: {type: Boolean, default: false}, //It is set to true when students have completed there two years in programme
    // dressSizeInInches: [{s}],
    shirtSizeInInches: {type: Number},
    waistSizeInInches: {type: Number},
    waistToBottomLengthInInches:{type: Number},
    dressAmountSubmitted: {type: Boolean, default: false},
    dressSizeConfirmationForm: {type: String}, //File link of data uploaded.




  //Below fileds are new and added on 28-March-2026, for ame score card purpposes.
  disciplineGradeAssessment_AME: {type: String},
  academicPerformanceGradeAssessment_AME: {type: String},
  classParticipationGradeAssessment_AME:{type: String},
  responsibilityAssessment_AME: {type: String},
  attendanceAssessment_AME: {type: String},
  coCurricularAssessment_AME: {type: String},
  mayMonthAttendancePercentage: {type: String},
  julyMonthAttendancePercentage: {type: String},
  augustMonthAttendancePercentage: {type: String},
  septemberMonthAttendancePercentage: {type: String},
  octoberMonthAttendancePercentage: {type: String},
  novemberMonthAttendancePercentage: {type: String},
  decemberMonthAttendancePercentage: {type: String},
  januaryMonthAttendancePercentage: {type: String},
  februaryMonthAttendancePercentage: {type: String},

  examinationVenue:{type: String},
  //Student creation or removing or scl releaising
  studentCreatedBy: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
              ref: "User",
              // required: true,
              default:null
  },
   studentRemovedBy: {
      type: mongoose.Schema.Types.ObjectId, // reference to User (who initates request)
              ref: "User",
              // required: true,
              default:null
  },

   studentCreationDate:{type: Date}, //once the approval of authorised person comes, this is upated
   studentRemoveDate: {type: String}, //once the approval of authorised person comes, this is upated
   studentCRUDStatus: {type: String}, //Removed, SLC Released, Added. It tells us either student be Removed, Add or etc.
   
   //First user create request to Add, Remove, Release SLC of students

   request: {type:String}, //Add, Remove, Release SLC, Approved. CC or any other user initates request to add, remove, release slc of students. It doesn't
   // directly get removed or anything like that rather it goes to superior ofr approval
   requestDate: {type: Date},
   requestStatus:{type: String}, //Pending, Rejected, Approved
   requestApprovedBy: {
     type: mongoose.Schema.Types.ObjectId, // reference to User (who initates request)
              ref: "User",
              // required: true,
              default:null
   }

  },
  { timestamps: true }
);

// export const Student =  mongoose.model("Student", StudentSchema);


export const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);








//WorksheetUpload

const StudentUploadSchema = new Schema(
  {

     unqStudentObjectId: {
              type: mongoose.Schema.Types.ObjectId, // reference to User
              ref: "Student",
              required: true,
            },
    
    fileName: { type: String },
    fileUrl: { type: String },
    batch:{type: String},
    uploadType: {type: String}, //Like class work, home work and all
    subject: {type: String}, //maths, hindi, sst, etc
    dateOfSubmission:{type: String}, //On which the file was uploaded.
    topic: {type: String}, //topic of homework or class work
    fileType: {type:String}, //pdf, image
    unqObjectIdOfStudentUploads: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"StudentUploads",
    }
  },
  { timestamps: true }
);



export const StudentUpload = mongoose.models.StudentUpload || mongoose.model("StudentUpload", StudentUploadSchema);





//StudentUploadObjectives

const StudentUploadObjectiveSchema = new Schema (
  {
    objective:{type:String},
    dateOfObjective: {type:Date}, //on which data assignment was given
    subject:{type: String}, //maths, hinidi, english etc...
    batch: {type: String},
    submissionDate: {type: Date}, //by when file should be submitted,
    descriptionOfObject: {type: String}, //little explaination about object,
    

  },
  { timestamps: true }
);


export const StudentUploadObjective = mongoose.models.StudentUploadObjective || mongoose.model("StudentUploadObjective", StudentUploadObjectiveSchema);


