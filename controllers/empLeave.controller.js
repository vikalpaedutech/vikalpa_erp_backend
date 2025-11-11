// Import the LeaveApplication model and any other necessary models (like Employee)
import { LeaveApplication } from "../models/empLeave.model.js";
import { Employee } from "../models/emp.model.js"; // Assuming you have the Employee model to update leave balance


// Create Leave Application
export const createPost = async (req, res) => {
    //console.log("Creating leave application");
  
    try {
      // Destructure fields from request body
      const {
        leaveId,
        emp_id,
        leaveType,
        startDate,
        endDate,
        reason,
        attachedFile,
        fileMetadata,
        hrReview,
        approval,
        appliedAt,
        updatedAt,
      } = req.body;
  
      // Create a new leave application document
      const leaveApplication = await LeaveApplication.create({
        leaveId,
        emp_id,
        leaveType,
        startDate,
        endDate,
        reason,
        attachedFile,
        fileMetadata,
        hrReview,
        approval,
        appliedAt,
        updatedAt,
      });
  
      // Optional: If you want to update the employee's leave balance after a leave is applied
      // Fetch the employee document to update leave balance
    //   const employee = await Employee.findOne({ emp_id });
  
    //   if (employee) {
    //     // Example logic for updating leave balance, adjust as per your leave type
    //     const leaveDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24)) + 1; // Calculate leave days
  
    //     if (leaveType === "casualLeave") {
    //       employee.leaves.casualLeave -= leaveDays; // Decrease casual leave balance
    //     } else if (leaveType === "sickLeave") {
    //       employee.leaves.sickLeave -= leaveDays; // Decrease sick leave balance
    //     }
  
    //     await employee.save();
    //     //console.log("Employee leave balance updated successfully.");
    //   }
  
      // Respond with the created leave application
      res.status(201).json({ status: "Success", data: leaveApplication });
    } catch (error) {
      //console.log("Leave application creation failed due to error", error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  };
  