//this is empLeave.model.js

//employee leave scheam...

import mongoose, { Schema } from "mongoose";

// Employee Leave Schema
const LeaveApplicationSchema = new Schema(
  {
    leaveId: { type: String, required: true, unique: true }, // Unique ID for each leave application
    emp_id: { type: String, ref:"Employee", required: true }, // Reference to the Employee schema applying for leave
    leaveType: { type: String, required: true }, // Type of leave (e.g., "Sick", "Casual", etc.)
    startDate: { type: Date, required: true }, // Start date of the leave
    endDate: { type: Date, required: true }, // End date of the leave
    reason: { type: String, required: true }, // Reason for applying for leave
    attachedFile: { type: String }, // Name of the attached file (optional, e.g., doctor's note)
    
    // File metadata information
    fileMetadata: {
      fileType: { type: String }, // Type of the file (e.g., image/jpeg)
      fileSize: { type: Number }, // Size of the file in bytes
      uploadedAt: { type: Date, default: Date.now } // Date when the file was uploaded
    },

    // Leave status
    status: {
      type: String,
      enum: ['Submitted', 'Pending', 'Approved', 'Rejected'],
      default: 'Pending' // Initial status is 'submitted'
    },

    rejectionReason: {type: String,},

    // HR Review details
    hrReview: {
        reviewedBy: { type: String, ref: 'User' }, // User who reviewed the leave
        reviewedAt: { type: Date }, // Date when the leave was reviewed by HR
        approvedByHr: {type: String, ref:"User"}, //this stores the data of hr like [Approved, not-approved, forwarded]
        comments: { type: String } // Review comments
      },

    // Approval details
    approval: [
        {
          approver: { type: String, ref: 'User' },
          status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
          approvedAt: { type: Date },
          comments: { type: String }
        }
      ],
    

    appliedAt: { type: Date, default: Date.now() }, // Date when the leave was applied
    updatedAt: { type: Date, default: Date.now() } // Date when the leave application was last updated
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Pre-save hook to update the updatedAt field automatically
LeaveApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the model
export const LeaveApplication = mongoose.model("LeaveApplication", LeaveApplicationSchema);
