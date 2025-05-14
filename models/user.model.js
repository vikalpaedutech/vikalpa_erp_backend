//Contains all the user data
//User will register themselves in the app. Users like CC, ACI, Managers, Admin, 
// ...Stakeholders will have permissions, and access of different modules, using this model

// import mongoose, { Schema } from "mongoose";

// const UserSchema = new Schema(
//   {
//     userId: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     contact1: { type: String, required: true },
//     contact2: { type: String },
//     department: { type: String, required: true }, //Operatins, Tech, HR, Academics
//     role: { type: String, required: true }, //Teacher, MIS, DTP, Operations etc...
//     assignmentLevel: {
//       type: String,
//       enum: ["District", "Block", "School"],
//       default: "School",
//     },   //Here school will be our MB centers.
//     isAdmin: {type: Boolean, default:false},
//     assignedDistrict: { type: String },
//     assignedBlock: { type: String },
//     assignedSchool: { type: String },  //Basically mb centers
//     districtId: { type: String, ref: "District" },
//     blockId: { type: String, ref: "Block" },
//     schoolId: { type: String, ref: "School" },
//     classId: { type: String, ref: "Class" }, //Class id will be the class 8, 9th something like that
//     studentId: { type: String, ref: "Student" },//If a student creates his her account then we give the student id.SRN Most probably
//     permission: { type: Object, default: {} },// Permissions like CRUD. Or Admin Usres like permission
//     accessModules: { type: [String], default: [] }, //What type of functionality will be allowed on based on permission given to users.
//     isActive: { type: Boolean, default: true },
//     profileImage: { type: String },
//     lastLogin: { type: Date },
//   },
//   { timestamps: true }
// );

// export const User =  mongoose.model("User", UserSchema);


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
    assignmentLevel: {
      type: String,
      enum: ["District", "Block", "School"],
      default: "School",
    },  // This sets the level of access to per user. Like if access the district, so all the blocks, 
    // and school can be accessed, if block, then all school under that bloci, and if goes to school, then 
    // only that school can be accessed.
    isAdmin: { type: Boolean, default: false },
    // Allowing multiple assignments for District, Block, and School
    assignedDistricts: [{ type: String, required: true }], // Multiple districts a user can access
    assignedBlocks: [{ type: String }],    // Multiple blocks a user can access
    assignedSchools: [{ type: String }],   // Multiple schools a user can access
    // Using ObjectIds for references to District, Block, School collections
    districtIds: [{ type: String, ref: "District" }],
    blockIds: [{ type: String, ref: "Block" }],
    schoolIds: [{ type: String, ref: "School" }],
    classId: [{ type: String,  ref: "Class" }], // Class id will be class 8, 9th, etc.
    studentId: { type: String, ref: "Student" }, // For students, using student id/SRN
    permission: { type: Object, default: {} }, // Permissions like CRUD, Admin rights
    accessModules: { type: [String], default: [] }, // What functionality will be allowed based on permissions
    isActive: { type: Boolean, default: true },
    profileImage: { type: String },
    lastLogin: { type: Date },
    longitude: {type: Number},
    latitude: {type: Number}
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
