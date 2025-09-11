//Contains the bills model

import mongoose, { Schema } from "mongoose";

// Expense/Bills Schema
const ExpenseSchema = new Schema(
  {
    //expenseId: { type: String, required: true, unique: true }, // Unique ID for each expense
     unqUserObjectId: {
              type: mongoose.Schema.Types.ObjectId, // reference to User
              ref: "User",
              required: true,
            },
    userId: { type: String, ref: "User", required: true }, // Reference to the user who created the expense
    role: {type: String, ref: "User", required: true},
    //userModelRef: { type: String, required: true }, // Reference model name of the user (e.g., 'User', 'Admin', etc.)
    purposeOfExpense: {type: String, required: true}, //Office, Orientating, Center Event, MB Center,  Stationary
    descriptionExpense: { type: String, }, // Description of the expense
    expenseDate: { type: Date, required: true }, // Date of the expense made
    expenseType: { type: String, required: true }, // Type of expense (e.g., "Travel", "Office Supplies", "Lunch", etc.)

    //If selected expenseTYPE selected "Travel" from frontend"
    travelFrom : {type: String, },
    travelTo: {type: String,},
    travelledDistance: {type:Number},

     //If selected expenseTYPE selected "Food" from frontend"
     foodType: {type: String}, //Breakfast, Lunch, Dinner.

       //If selected expenseTYPE selected "Food" from frontend"
      accomodationDate: {type: Date},
      stayedForDays: {type: Number},

      //If selected expenseTYPE selected "Other" from frontend"
      otherItemName: {type: String},
      otherItemPurchasingPurpose: {type: String},
      otherItemDescription: {type: String},



     


    expenseAmount: { type: Number, required: true }, // The amount spent
    
    
    fileName: { type: String }, // Name of the file attached to the expense (e.g., receipt image)
    fileUrl: { type: String }, // URL link to the file (e.g., location in cloud storage)
    fileMetadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {} // Stores file metadata (type, size, etc.)
    },
    status: {
      type: String,
      enum: ["Submitted", "Pending", "Verified",  "Approved", "Rejected", "Paid"],
      default: "Pending", // Status of the expense
    },

    verification: {
      verifiedBy: { type: String, ref: "User" }, // User who verified the expense
      verifiedAt: { type: Date }, // Date of verification
      comments: { type: String }, // Comments during verification
    },


    approval: {
      approvedBy: { type: String, ref: "User" }, // User who approved the expense
      approvedAt: { type: Date }, // Date of approval
      comments: { type: String }, // Comments during approval
    },
   
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const Expense = mongoose.model("Expense", ExpenseSchema);
