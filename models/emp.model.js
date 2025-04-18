//This holds the employee model. It will have all the details of employee.
//For HR department/

import mongoose, {mongo, Schema} from "mongoose";

const EmployeeSchema = new Schema(
    
    
    {
      emp_id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      lastName: {type: String,},
      gen: { type: String, enum: ["Male", "Female", "Other"], required: true },
      category: { type: String, required: true },
      maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], required: true },
      dob: { type: Date, required: true },
      email: { type: String, unique: true },
      officialEmail: { type: String, unique: true },
      personalEmail: { type: String },
      contact1: { type: String, required: true },
      contact2: { type: String },
      address: { type: String, required: true },
      department: { type: String, required: true },
      designation: { type: String, required: true },
      district: { type: String, required: true },
      center: { type: String, required: true },
      headoffice: { type: String, required: true },
      joiningDate: { type: Date, required: true },
      relievingDate: { type: Date },
      employmentType: { type: String, required: true },
      salary: { type: Number, required: true },
      leaves: { type: Object, default: {} },
      documents: { type: Object, default: {} },
      status: { type: String, enum: ["Active", "Resigned"], required: true },
    },
    { timestamps: true }
  );
  
//   export default mongoose.model("Employee", EmployeeSchema);

  export const Employee = mongoose.model("Employee", EmployeeSchema);
  