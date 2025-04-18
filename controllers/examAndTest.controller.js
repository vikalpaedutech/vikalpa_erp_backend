//All Business logic, rest apis, apis for examAndTest.modl.js

import { ExamAndTest } from "../models/examAndTest.model.js"; 

// Controller for creating a new exam
export const createPost = async (req, res) => {
  console.log("I am inside ExamAndTest controller, createExam API");

  try {
    // Destructure the required fields from the request body
    const { examId, examType, examBoard,  subject, examDate, description, maxMarks, passingMarks, batch, classofStudent } = req.body;

    // Validate input data (basic example)
    if (!examId || !examType || !examBoard ||  !subject || !examDate || !description || !maxMarks || !passingMarks || !batch || !classofStudent) {
      return res.status(400).json({ status: "Failed", message: "All fields are required" });
    }

    // Create a new exam record
    const exam = await ExamAndTest.create({
        examId, examType, examBoard,  subject, examDate, description, maxMarks, passingMarks, batch, classofStudent
    });

    // Respond with success and the created exam data
    res.status(201).json({ status: "Success", data: exam });
    
  } catch (error) {
    // Catch any errors and send a failure response
    res.status(500).json({ status: "Failed", message: error.message });
  }
};