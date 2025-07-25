//Writing all the Business logic, Rest APIs, for student.model.js;

import mongoose from "mongoose";

// import { Student } from "../models/Student.model.js";

// import  {Student}  from "../models/student.model.js"
// import  StudentDb  from "../models/student.model.js";


import {Student}  from "../models/student.model.js";



export const createPost = async (req, res) => {

    console.log("i am inside student controller, createPost api")


    try {

        const {studentSrn, rollNumber, firstName, fatherName, motherName,email, personalContact,
            ParentContact, otherContact, dob, gender, category, address,districtId, blockId, schoolId, classofStudent, 
            parent, enrollmentDate, batch, session, documents, singleSideDistance, bothSideDistance, slc, isSlcTaken,
            slcReleasingDate, erpEnrollingDate, medium, isStudentOf, isDressGiven, isTabGiven, tabIMEI, isSimGiven,
            simNumber, simIMSI, bankName, bankIFSC, bankAccNumber, bankHolderName, batchCompleted
         } = req.body;
        
         const student = await Student.create( {
            

            studentSrn, rollNumber, firstName, fatherName, motherName,email, personalContact,
            ParentContact, otherContact, dob, gender, category, address,districtId, blockId, schoolId, classofStudent, 
            parent, enrollmentDate, batch, session, documents, singleSideDistance, bothSideDistance, slc, isSlcTaken,
            slcReleasingDate, erpEnrollingDate, medium, isStudentOf, isDressGiven, isTabGiven, tabIMEI, isSimGiven,
            simNumber, simIMSI, bankName, bankIFSC, bankAccNumber, bankHolderName, batchCompleted

         })

         res.status(201).json({status: "Success", data: student})

    } catch (error) {
        console.log("Student data has not posted to db due to server error", error.message)
    }
}


//isSlcTaken === false
//Get API for fetching all students in backend. 
export const getStudentIfisSlcTakenIsFalse = async (req, res) => {
    console.log("I am inside student controller, getStudent api");

    try {
        // const { studentSrn, id } = req.params;

        // Find student whose slc isSlcTaken status is false. That means they have not release their slc and still our students
        const student = await Student.find({isSlcTaken: false });

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", data: student });
        // console.log(student)
    } catch (error) {
        console.log("Error fetching student data from DB", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//________________________________________________________________________________

//Below API shows all the students dta with all the database fields.

export const getAllStudents = async (req, res) => {

    console.log("I am inside student controller, getAllStudents api");


    try {
        
        const student = await Student.find();

        if (!student){
            return res.status(404).json({status: "Error", message: "Student not found"})
        }

        res.status(200).json({status: "Success", data: student})
    } catch (error) {
        console.log("Error fetching studnts data from db", error.message)
        res.status(500).json({status: "Eroor" , message: "Server Error"})
    }

    


}

//____________________________________________________________________


// PUT API to update student by SRN
export const updateStudentBySrn = async (req, res) => {
    console.log("I am inside student controller, updateStudentBySrn api");

    try {
        const { studentSrn } = req.params;

        // Find the student by studentSrn
        const student = await Student.findOneAndUpdate(
            { studentSrn },
            req.body, // This will update the student with the data in the request body
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", data: student });
    } catch (error) {
        console.log("Error updating student data", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//____________________________________________________________________________


// PATCH API to update student data by SRN
export const patchStudentBySrn = async (req, res) => {
    console.log("I am inside student controller, patchStudentBySrn api");

    try {
        const { studentSrn } = req.params;

        // Find the student by studentSrn and update only the fields provided in the request body
        const student = await Student.findOneAndUpdate(
            { studentSrn },
            req.body, // Partially update the student with the provided fields in the request body
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", data: student });
    } catch (error) {
        console.log("Error patching student data", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

//________________________________________________________________


// DELETE API to delete student by SRN
export const deleteStudentBySrn = async (req, res) => {
    console.log("I am inside student controller, deleteStudentBySrn api");

    try {
        const { studentSrn } = req.params;

        // Find and delete the student based on studentSrn
        const student = await Student.findOneAndDelete({ studentSrn });

        if (!student) {
            return res.status(404).json({ status: "Error", message: "Student not found" });
        }

        res.status(200).json({ status: "Success", message: "Student deleted successfully" });
    } catch (error) {
        console.log("Error deleting student data", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

//___________________________________________________________________


//Api for getting students by query parmas.

// export const getStudentsByQueryParams = async (req, res) => {

//     console.log('I am inside get students by query params')

//     const {studentSrn, 
//         rollNumber, 
//         firstName, 
//         fatherName, 
//         districtId, 
//         blockId, 
//         schoolId, 
//         classofStudent,
//         isSlcTaken
//     }= req.query


// console.log(req.query)


//    const schoolIds = Array.isArray(schoolId) ? schoolId : schoolId?.split(',') || [];
//     const classofStudents = Array.isArray(classofStudent) ? classofStudent : classofStudent?.split(',') || [];
    

//     try {

//          const query = {};
//          if(studentSrn) query.studentSrn = studentSrn;
//          if (rollNumber) query.rollNumber = rollNumber;
//          if (firstName) query.firstName = { $regex: `^${firstName}`, $options: "i" }; 
//          if (fatherName) query.fatherName = fatherName;
//          if (districtId) query.districtId = districtId;
//          if (blockId) query.blockId = blockId;
//          if (schoolIds) query.schoolId = {$in:schoolIds};
//          if (classofStudents) query.classofStudent = {$in:classofStudents};

//         console.log(query)
//         const request = await Student.find(query);

//         res.status(200).json({status: "Success", data: request})
//     } catch (error) {
//         res.status(500).json({status: "Failed", message: error.message})
//     }

// } ;  






// export const getStudentsByQueryParams = async (req, res) => {
//   console.log("I am inside get students by query params");

//   const {
//     studentSrn,
//     rollNumber,
//     firstName,
//     fatherName,
//     districtId,
//     blockId,
//     schoolId,
//     classofStudent,
//   } = req.query;

//   const schoolIds = Array.isArray(schoolId)
//     ? schoolId
//     : schoolId?.split(",") || [];
//   const classofStudents = Array.isArray(classofStudent)
//     ? classofStudent
//     : classofStudent?.split(",") || [];

//   try {
//     const matchQuery = {};
//     if (studentSrn) matchQuery.studentSrn = studentSrn;
//     if (rollNumber) matchQuery.rollNumber = rollNumber;
//     if (firstName)
//       matchQuery.firstName = { $regex: `^${firstName}`, $options: "i" };
//     if (fatherName) matchQuery.fatherName = fatherName;
//     if (districtId) matchQuery.districtId = districtId;
//     if (blockId) matchQuery.blockId = blockId;
//     if (schoolIds.length) matchQuery.schoolId = { $in: schoolIds };
//     if (classofStudents.length)
//       matchQuery.classofStudent = { $in: classofStudents };

//     const pipeline = [
//       { $match: matchQuery },

//       {
//         $lookup: {
//           from: "studentdisciplinaries",
//           localField: "studentSrn",
//           foreignField: "studentSrn",
//           as: "disciplinaryRecords",
//         },
//       },
//       {
//         $addFields: {
//           disciplinaryCount: {
//             $size: {
//               $filter: {
//                 input: "$disciplinaryRecords",
//                 as: "record",
//                 cond: { $eq: ["$$record.status", "Disciplinary"] },
//               },
//             },
//           },
//           countOfNotesChecking: {
//             $size: {
//               $filter: {
//                 input: "$disciplinaryRecords",
//                 as: "record",
//                 cond: { $eq: ["$$record.status", "Copy Checking"] },
//               },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           disciplinaryRecords: 0, // exclude full array
//         },
//       },
//     ];

//     const students = await Student.aggregate(pipeline);

//     res.status(200).json({ status: "Success", data: students });
//   } catch (error) {
//     console.error("Error in getStudentsByQueryParams:", error);
//     res.status(500).json({ status: "Failed", message: error.message });
//   }
// };





export const getStudentsByQueryParams = async (req, res) => {
  console.log("I am inside get students by query params");

  const {
    studentSrn,
    rollNumber,
    firstName,
    fatherName,
    districtId,
    blockId,
    schoolId,
    classofStudent,
  } = req.query;

  const schoolIds = Array.isArray(schoolId)
    ? schoolId
    : schoolId?.split(",") || [];

  const classofStudents = Array.isArray(classofStudent)
    ? classofStudent
    : classofStudent?.split(",") || [];

  try {
    const matchQuery = {};
    if (studentSrn) matchQuery.studentSrn = studentSrn;
    if (rollNumber) matchQuery.rollNumber = rollNumber;
    if (firstName)
      matchQuery.firstName = { $regex: `^${firstName}`, $options: "i" };
    if (fatherName) matchQuery.fatherName = fatherName;
    if (districtId) matchQuery.districtId = districtId;
    if (blockId) matchQuery.blockId = blockId;
    if (schoolIds.length) matchQuery.schoolId = { $in: schoolIds };
    if (classofStudents.length)
      matchQuery.classofStudent = { $in: classofStudents };

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "studentdisciplinaries",
          localField: "studentSrn",
          foreignField: "studentSrn",
          as: "disciplinaryRecords",
        },
      },
      {
        $addFields: {
          disciplinaryCount: {
            $size: {
              $filter: {
                input: "$disciplinaryRecords",
                as: "record",
                cond: { $eq: ["$$record.status", "Disciplinary"] },
              },
            },
          },
          countOfNotesChecking: {
            $size: {
              $filter: {
                input: "$disciplinaryRecords",
                as: "record",
                cond: { $eq: ["$$record.status", "Copy Checking"] },
              },
            },
          },
          todayCopyChecking: {
            $filter: {
              input: "$disciplinaryRecords",
              as: "record",
              cond: {
                $and: [
                  { $eq: ["$$record.status", "Copy Checking"] },
                  {
                    $eq: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$$record.createdAt",
                        },
                      },
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: new Date(),
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          disciplinaryRecords: 0,
        },
      },
    ];

    const students = await Student.aggregate(pipeline);

    res.status(200).json({ status: "Success", data: students });
  } catch (error) {
    console.error("Error in getStudentsByQueryParams:", error);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

