// BACKEND/controllers/StudentRelatedCallings.controller.js

import { StudentRealtedCalling } from "../models/StudentRelatedCallings.model.js";
import { Student } from "../models/student.model.js";


//Creating Calling data in db. POST API

export const CreateCalling = async () => {
    console.log("I am inside CreateCalling function");
    try {


        const students = await Student.find({}); // Get all students

        console.log(students);

        console.log(`Found ${students.length} students`);

        // Loop through students and create attendance records
        for (const student of students) {
            console.log(`Processing student with SRN: ${student.studentSrn}`);
            
            const response = new StudentRealtedCalling({
                jobId: null,
                callingTitle:null,
                studentSrn: student.studentSrn,
                personalContact: student.personalContact ,
                //lastName: student.lastName,
                ParentContact: student.ParentContact,
                otherContact: student.otherContact,
                remark1: null,
                remark2: null,
                comments:"",
                callingStatus:"Not Connected",
                date: new Date().toISOString().split("T")[0], // => "2025-04-10",
                
            });

            await response.save(); // Save the attendance data
            console.log(`Callings saved for SRN: ${student.studentSrn}`);
        }

        console.log('Callings records created for all students');
    } catch (error) {
        console.error('Error during Callings dump: ', error);
    }
};

//--------------------------------------------

//GET CALLING DATA.

export const GetStudentRelatedCallingData = async (req, res) => {
    try {
        // Build dynamic match object based on available query params
        const matchConditions = {};

        if (req.query.jobId) {
            matchConditions.jobId = req.query.jobId;
        }
        if (req.query.callingTitle) {
            matchConditions.callingTitle = req.query.callingTitle;
        }
        if (req.query.callingStatus) {
            matchConditions.callingStatus = req.query.callingStatus;
        }
        if (req.query.remark1) {
            matchConditions.remark1 = req.query.remark1;
        }
        if (req.query.remark2) {
            matchConditions.remark2 = req.query.remark2;
        }

        // Now build aggregation pipeline with optional match
        const pipeline = [];

        // Add $match if there are any conditions
        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        // Add $lookup to join students
        pipeline.push({
            $lookup: {
                from: 'students',
                localField: 'studentSrn',
                foreignField: 'studentSrn',
                as: 'StudentData'
            }
        });

        // Execute aggregation
        const response = await StudentRealtedCalling.aggregate(pipeline);

        res.status(200).json({ status: "Success", data: response });
    } catch (error) {
        console.log("Error fetching calling data from db", error.message);
        res.status(500).json({
            status: "Error",
            message: "Server Error"
        });
    }
}

//-------------------------------------------------------------------------


//PATCH calling data.

export const PatchStudentRelatedCallings = async (req, res) =>{

    const {studentSrn, jobId, callingTitle} = req.query;
    const {remark1, remark2, comments, callingStatus} = req.body;



    try {
        console.log(req.body)
        const response = await StudentRealtedCalling.findOneAndUpdate(req.query,
            {$set:req.body},
            { new: true }
        )

        res.status(200).json({status:"Success", data: response})
    } catch (error) {
        console.log('Error patching calling data');
        res.status(500).json({status:"Error", msg: error.message})
    }
};

//----------------------------------------------------------