import mongoose, { Schema } from "mongoose";

//Objective of calling schema

const ObjectiveOfCallingSchema = new Schema (
    {
        objectiveOfCalling: {type: String}, //ABSENTEE, SLC, PRINCIPAL, DEO, BEO
        // remark: {type: String}, //remark corresponding to calling
        descriptionOfCalling: {type: String}, //it will be like a mini script for the calling purpose

         remarks: [
            {
                _id: 0,
                remark: { type: String, required: true },
                dependentRemarks: [{ type: String, default: null }] // Array of dependent options for this remark
            }
        ],
        // dependentRemark: {type: String}, //dpendent remark for "remark" field.
        callingStatus: {type: String}, //this tells that is the call corresponding to this objctive completed or not
        
        isNewValueToBeUpdatedRequired: {type: Boolean, default:false}, //for more controlled fields
        dependentRemarkRequired: {type: Boolean, default: false},
        isManualRemarkRequired: {type: Boolean, default:true},
        isObjectOfCallingDone: {type: Boolean, default:false},
        callingDate: {type: Date}
    }
)




//Calling Schema
const CallingSchema = new Schema (
  {
    studentUnqObjectId: {
          type: mongoose.Schema.Types.ObjectId, // reference to User
          ref: "Student",
          default: null
        },
   
   assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
   }, 
   roleOfAssignedTo: {type: String, default:null},
   callingType: {type:String, default:null}, //MB calling or Random/Misc calling.
   calledTo: {type: String, default:null}, //Student, deo, beo, Principal etc...
   name: {type: String, default:null}, //name of person being called. For random calling
   fatherName: {type: String, default:null}, //when random calls are done to students.
   district: {type:String, default:null}, //for random calls creation
   block: {type: String, default:null}, //for random calls creation
   school: {type: String, default:null}, //for random calls creation
   contact1: {type: String, default:null}, //for random calls creation
   contact2: {type: String, default:null}, //for random calls creation
   contact3: {type: String, default:null}, //for random calls creation
   callingStatus: {type: String, default:null}, //connected/ not connected/ wrong number etc...
   remark: {type: String, default:null}, //drop downs static
   dependentRemark: {type: String, default:null}, //dependent remark(dependent dro down for "for remark field")
   manualRemark: {type: String, default:null}, //manual comment 
   newUpdatedValue: {type: String}, //if collection of data like new numbers and any kind of value user is collecting so this field
   objectiveOfCallId: {type: mongoose.Schema.Types.ObjectId, default:null},
   callingDate: {type:Date, default:null},
   followUpDate:{type: Date}
  },
  { timestamps: true }
);

export const Calling =  mongoose.model("Calling", CallingSchema);

export const ObjectiveOfCalling =  mongoose.model("ObjectiveOfCalling", ObjectiveOfCallingSchema);