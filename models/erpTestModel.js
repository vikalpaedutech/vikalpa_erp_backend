// //This model is for taking test of erp for new users.




// //Contains the bills model

// import mongoose, { Schema } from "mongoose";

// // Expense/Bills Schema
// const ErpTestSchema = new Schema(
//   {
//     //expenseId: { type: String, required: true, unique: true }, // Unique ID for each expense
//      unqUserObjectId: {
//               type: mongoose.Schema.Types.ObjectId, // reference to User
//               ref: "User",
//               required: true,
//             },
//     userId: { type: String, ref: "User", required: true }, // Reference to the user who created the expense
//     selfAttendance: {type: Boolean, default: false},
//     studentAttendanceCount: {type: Number, default:0},
//     // password: {type: String, default:'1234'},
//     disciplinary: {type: Boolean, default: false},
//     copyChecking: {type: Boolean, default: false},
  
    
//     downloadAttendancePdfFormat: {type: Boolean, default: false},
//     uploadAttendancePdfFormat: {type: Boolean, default: false},
//     uploadMarksCount: {type:Number, default: 0},
//     techConcern: {type: Boolean, default: false},
//     schoolConcern: {type: Boolean, default: false},
//     studentRelatedConncern: {type: Boolean, default: false},
//     individualConcern: {type: Boolean, default: false}
   
//   },
//   { timestamps: true } // Automatically adds createdAt and updatedAt fields
// );

// export const ErpTest = mongoose.model("ErpTest", ErpTestSchema);






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
    selfAttendance: {type: Boolean, default: false},
    studentAttendanceCount: {type: Object, default:{
      count9: 0,
      Ajay: false,
      Jatin: false,
      count10: 0,
      Samay: false,
      Anjali: false
    }}, // These students remain false and both classes must have 13 students present, total 26, then asnwer is correct.
    uploadMarksCount: {type:Object, default: {
    //Below 9th
    Shubham: 0,
    Ripudaman: 0,
    Sanjeev: 0,
    Ajay: 0,
    Jatin: 0,
    Poshak: 0,
    Anshu: 0,
    Gajendra: 0,
    Vimal: 0,
    Madhu: 0,
    //Below 10
    Akhilesh: 0,
    Abhinesh: 0,
    Akshay: 0,
    Samay: 0,
    Anjali: 0,
    Rekha: 0,
    Srishti: 0,
    Aayush: 0,
    Jay: 0,
    Rohit: 0
    }},
    // password: {type: String, default:'1234'},/
    disciplinary: {type: Object, default: {
      Aalia:null,  // value should be "Late Arrival"
      Ajay:null,   // value should be "Absenteeism"
      Aayush:null, // value should be "Using Mobile Phone"
      Abhinesh:null, // value should be "Talking"
      Akhilesh:null, //value should be "Leaving Class"
    }},
    copyChecking: {type: Object, default: {
      Aalia: [{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
      Ajay: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
      Aayush:[{English: null, status: null}, {Hindi: null, status:null}, {Science: null, status: null}], 
      Abhinesh:[{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
      Akhilesh: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
    }},
    
    downloadAttendancePdfFormat: {type: Boolean, default: false},
    uploadAttendancePdfFormat: {type: Boolean, default: false},
    schoolConcern: {type: Object, default: {
      concerns:[], 
    }},
    studentRelatedConncern: {type: Object, default: {
      concerns: []
    }},
    techConcern: {type: Object, default: {
      concerns: [], //Screen, Inverter, Microphone, Internet, Camera, Mini_PC, Electricity
    }},
    
     absenteeCalling: {type: Object, default: {
      students: [], //Ajay, Jatin, Samay, Anjali
    }},
   
      closeSchoolConcerns: {type: Object, default: {
      concerns: [], 
    }},

      closeStudentConcerns: {type: Object, default: {
      concerns: [], 
    }},

      closeTechConcerns: {type: Object, default: {
      concerns: [], 
    }},
   

    marks: {type:Object, default:{
      q1:0,
      q2:0,
      q3:0,
      q4:0,
      q5:0,
      q6:0,
      q7:0,
      q8:0,
      q9:0,
      q10:0,
      q11:0,
      q12:0,
      q13:0,
      q14:0,
      isTestSubmitted: false
    }}

  },

  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const ErpTest = mongoose.model("ErpTest", ErpTestSchema);
