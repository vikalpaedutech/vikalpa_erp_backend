//Contains all the user data
//User will register themselves in the app. Users like CC, ACI, Managers, Admin, 
// ...Stakeholders will have permissions, and access of different modules, using this model

import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact1: { type: String, required: true },
    contact2: { type: String },
    department: { type: String, required: true }, // e.g., Operations, Tech, HR, Academics
    role: { type: String, required: true }, // e.g., Teacher, MIS, DTP, Operations
    
    isActive: { type: Boolean, default: true },
    profileImage: { type: String, default:null },
    // lastLogin: { type: Date },
    longitude: {type: Number, default:null},
    latitude: {type: Number, default:null},
    
    //Gamification rankings are shown here for center coordinators
    avgScore: { type: Number, default: 0 }, //Gets cumulative avg score
    totalPoints: { type: String, default: 0 }, //sum of total points of each users
    rank: { type: Number, default: 0 },
    
  },
  { timestamps: true }
);




export const User = mongoose.model("User", UserSchema);










//User access model
const UserAccessSchema = new Schema(
  {
    unqObjectId: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
      ref: "User",
      required: true,
    },

    userId: { type: String },

    //modular access

    modules: [

      {
        _id: false,
        name: {
          type: String,
          // enum: ["Academics", "Accounts"],
        },

        accessLevel: {
          type: String,
          // enum: ["create", "read", "write", "delete", "admin"],
          default: "read",
        },
      },
    ],

    //Region-wise access

    region: [
      {
        _id: false,
        districtId: { type: String },
        blockIds: [
          {
            _id: false,
            blockId: { type: String },
            schoolIds: [
              {
                _id: false,
                schoolId: { type: String },
              },
            ],
          },
        ],
      },
    ],

    // classId: [{ type: String }], // Class id will be class 8, 9th, etc.,
    batch:[{type: String,}], //Batch wise assignment
  },
  { timestamps: true }
);

export const UserAccess = mongoose.model("UserAccess", UserAccessSchema);














//Leave management




//User access model
const UserLeaveSchema = new Schema(
  {
    unqObjectId: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
      ref: "User",
      required: true,
    },

    year:{type: String, default:null},
    // casualLeave:{type:Number, default:0},
    // sickLeave:{type:Number, default:0},
    // earnedLeave:{type:Number, default:0},
    // paidLeave:{type:Number, default:0},
    // leaveWithoutPay:{type:Number, default:0},
    // maternityLeave:{type:Number, default:0},
    // paternityLeave:{type:Number, default:0},
    // compensatoryOff:{type:Number, default:0},
    // floatingHoliday:{type:Number, default:0},
    // gazettedHolidays:{type:Number, default:0},
    // wfh:{type:Number, default:0},
    // halfDay:{type:Number, default:0},
    
    leaves:{
      type:Object, default:{
        leaveType: {type: String, default:null},// CL, SL, EL, PL, LWP, ML, PL, Comp-off...
        totalAlloted:{type:Number, default:0},
        totalUsed: {type:Number, default:0},
        remaining: {type: Number, default:0}
      }
    }
    

  },
  { timestamps: true }
);

export const UserLeave = mongoose.model("UserLeave", UserLeaveSchema);

