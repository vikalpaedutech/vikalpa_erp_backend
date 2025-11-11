//Controller for ErpModel.
import mongoose from "mongoose";
import { ErpTest } from "../models/erpTestModel.js";
import { Student } from "../models/student.model.js";
import { StudentAttendance } from "../models/studentAttendance.model.js";
import { Marks } from "../models/marks.model.js";

//Post api. For updating answers.
//Answer 1. Change password
export const ChangePassword = async (req, res) =>{

    const {unqUserObjectId, userId, password} = req.body;

    // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
    // const userId = "23VFC0029"
    // const password = "2321"
   

    console.log(unqUserObjectId)

    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
        console.log(response[0])

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { password } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            password: password,
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:0,
            techConcern: false,
            schoolConcern: false,
            studentRelatedConncern:false,
            individualConcern: false

            }


            const response = await ErpTest.create(testObject)


            res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
    }
};





//Answer 2 api. selfAttendance

export const selfAttendance = async (req, res) =>{
    console.log('hello self attendance erp test')

    const {unqUserObjectId, userId, selfAttendance} = req.body;

    // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
    // const userId = "23VFC0029"
    // const password = "2321"
    // const selfAttendance = true

    console.log(unqUserObjectId)

    try {
          console.log('hello self attendance')

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
        console.log(response)

        if (response.length > 0){


            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { selfAttendance } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            password: "1234",
            selfAttendance: selfAttendance,
            // studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:0,
            // techConcern: false,
            // schoolConcern: false,
            // studentRelatedConncern:false,
            // individualConcern: false

            }


            const response = await ErpTest.create(testObject)


            res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
    }
};

// //Answer 3 api


// export const studentAttendance = async (req, res) =>{

//     console.log("Hello erp test student attendance.")

//     const {unqUserObjectId, userId, schoolId, classOfCenter} = req.body;


// //     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
// //     const userId = "23VFC0029"
// //     const password = "2321"
// //     const selfAttendance = true

    
// //     const schoolId = '4025'
// //    const classOfCenter = '9'

//    console.log(unqUserObjectId)


//    //Fetching student attendance count.


//    //Fetching student attendance count based on schoolId, and clas of student
   
//        const findStudentWithschoolIdandClass = await Student.find({
//            schoolId: schoolId,
//            classofStudent: classOfCenter,
//            isSlcTaken:false
//        })
   
//        //Storing all student ids from Student collection. 
//        //Then we can use those ids for query in student attendances for fetching attendance count.
   
//         let allStudentId = [];
//            findStudentWithschoolIdandClass.map((eachStudent)=>{
//            allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
//            })
   

//         //    console.log(allStudentId)

//        //-----------------------------------------------------------------------------
   
//        //Now fetching student attendance count (only Present count) from studentattendances
//        //We wil fetch current dates present count only only.
   
//        // Setting dates for querying
//        const startDate = new Date()
//        const endDate = new Date ()
   
//        startDate.setUTCHours(0, 0, 0, 0);
//        endDate.setHours(23, 59, 59, 999);
   
//        // console.log("dates are", startDate, endDate)
   
//        const fetchPresentStudentCountFromStudentAttendances = await StudentAttendance.find({
//            unqStudentObjectId: {$in:allStudentId},
//            date: {$gte:startDate, $lte:endDate},
//            status: 'Present'
//        })
   
//        const PresentCount = fetchPresentStudentCountFromStudentAttendances.length
   
//        //console.log(PresentCount)


//        //--------------------------------------------------------------------



//     try {

//         //first we will check if the data exist in db using objectId.
//         const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

//         // console.log(response)

//         if (response.length > 0){

//             // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { studentAttendanceCount:PresentCount } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//         } else {

//             const testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             // password: "1234",
//             selfAttendance: false,
//             studentAttendanceCount: PresentCount,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:0,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: false

//             }


//             const response = await ErpTest.create(testObject)


//             res.status(200).json({status: 'Ok', data: response})
//         }
        
//     } catch (error) {
//         console.log("Error::::>", error)

//          res.status(500).json({status: 'Ok', message: 'Error occured!'})
//     }
// };



export const studentAttendance = async (req, res) => {

    console.log("Hello erp test student attendance.")

    const { unqUserObjectId, userId, schoolId, classOfCenter, student } = req.body;

    console.log(student)

    console.log(unqUserObjectId)

    //Fetching student attendance count.
    //Fetching student attendance count based on schoolId, and class of student
    const findStudentWithschoolIdandClass = await Student.find({
        schoolId: schoolId,
        classofStudent: classOfCenter,
        isSlcTaken: false
    })

    //Storing all student ids from Student collection. 
    //Then we can use those ids for query in student attendances for fetching attendance count.
    let allStudentId = [];
    findStudentWithschoolIdandClass.map((eachStudent) => {
        allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
    })

    //-----------------------------------------------------------------------------
    //Now fetching student attendance count (only Present count) from studentattendances
    //We will fetch current date's present count only.

    // Setting dates for querying
    const startDate = new Date()
    const endDate = new Date()

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const fetchPresentStudentCountFromStudentAttendances = await StudentAttendance.find({
        unqStudentObjectId: { $in: allStudentId },
        date: { $gte: startDate, $lte: endDate },
        status: 'Present'
    })

    // -------------------------------------------------------------------


    //first we will check if the data exist in db using objectId.
    const response = await ErpTest.find({ unqUserObjectId: unqUserObjectId })

    //If data exist then
    if (response.length>0) {
        // console.log(response[0].studentAttendanceCount)



        // Map attendance to counts and individual booleans
        fetchPresentStudentCountFromStudentAttendances.forEach(att => {
            const studentName = student.firstName; // make sure StudentAttendance has studentName
            const classOfStudent = att.classOfStudent; // make sure StudentAttendance has classOfStudent

            ////

            if (classOfCenter === '9') {

                if (student.status === "Present") {
                    response[0].studentAttendanceCount.count9 = fetchPresentStudentCountFromStudentAttendances.length
                } else {
                    response[0].studentAttendanceCount.count9 = fetchPresentStudentCountFromStudentAttendances.length
                }


                ;
                if (studentName in response[0].studentAttendanceCount && student.status === "Present") { response[0].studentAttendanceCount[studentName] = true; }
                else if (studentName in response[0].studentAttendanceCount && student.status === "Absent") { response[0].studentAttendanceCount[studentName] = false; }
            } else if (classOfCenter === '10') {

                if (student.status === "Present") {
                    response[0].studentAttendanceCount.count10 = fetchPresentStudentCountFromStudentAttendances.length
                } else {
                    response[0].studentAttendanceCount.count10 = fetchPresentStudentCountFromStudentAttendances.length
                }

                if (studentName in response[0].studentAttendanceCount && student.status === "Present") { response[0].studentAttendanceCount[studentName] = true }
                else if (studentName in response[0].studentAttendanceCount && student.status === "Absent") { response[0].studentAttendanceCount[studentName] = false; }
            }
        });


        console.log(student.firstName in response[0].studentAttendanceCount)
        //--------------------------------------------------------------------


        const studentAttendanceCount = response[0].studentAttendanceCount
        try {



            if (response.length > 0) {

                // ✅ Update existing
                const updateResponse = await ErpTest.findOneAndUpdate(
                    { unqUserObjectId },
                    { $set: { studentAttendanceCount } },
                    { new: true }   // returns updated doc
                );

                res.status(200).json({ status: "Ok", data: updateResponse });

            } else {

            }

        } catch (error) {
            console.log("Error::::>", error)

            res.status(500).json({ status: 'Ok', message: 'Error occured!' })
        }

    } else {

          // Build studentAttendanceCount object as per new schema

        let studentAttendanceCount;
        if (classOfCenter === "9" && student.status === "Present"){
            if (student.firstName === "Ajay"){

                  studentAttendanceCount = {
                count9: 1,
                Ajay: true,
                Jatin: false,
                count10: 0,
                Samay: false,
                Anjali: false
    };

            } else if (student.firstName === "Jatin"){
                 
                 studentAttendanceCount = {
                count9: 1,
                Ajay: false,
                Jatin: true,
                count10: 0,
                Samay: false,
                Anjali: false
    };

            }
             
        } else if (classOfCenter === "10" && student.status === "Present"){
            
            if (student.firstName === "Samay"){

                studentAttendanceCount = {
                count9: 0,
                Ajay: false,
                Jatin: false,
                count10: 1,
                Samay: true,
                Anjali: false
    };

            } else if (student.firstName === "Samay") {
                 studentAttendanceCount = {
                count9: 0,
                Ajay: false,
                Jatin: false,
                count10: 1,
                Samay: false,
                Anjali: true
    };
            }
            
            
        }

   

        
                const testObject = {
                    unqUserObjectId: unqUserObjectId,
                    userId: userId,
                    selfAttendance: false,
                    studentAttendanceCount,
                    downloadAttendancePdfFormat: false,
                    uploadAttendancePdfFormat: false,
                    uploadMarksCount: 0,
                    // techConcern: false,
                    // schoolConcern: false,
                    // studentRelatedConncern: false,
                    // individualConcern: false
                }

                const response = await ErpTest.create(testObject)

                res.status(200).json({ status: 'Ok', data: response })
        
    }




  





};









//Anser 4 api. Download attendance pdf format.
export const downloadAttendancePdfFormat = async (req, res) =>{

    console.log('Hello download attendance pdf format')

    const {unqUserObjectId, userId,  schoolId, classOfCenter} = req.body;


//     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     const userId = "23VFC0029"
//     const password = "2321"

//     const downloadAttendancePdfFormat = true

//    console.log(unqUserObjectId)



    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

        // console.log(response)

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { downloadAttendancePdfFormat:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: true,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:0,
            // techConcern: false,
            // schoolConcern: false,
            // studentRelatedConncern:false,
            // individualConcern: false

            }


            const response = await ErpTest.create(testObject)


            res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
    }
};





//Anser 5 api. upload attendance pdf format.
export const uploadAttendancePdfFormat = async (req, res) =>{

    console.log("Hello upload attendance erp test")

    const {unqUserObjectId, userId, schoolId, classOfCenter} = req.body;


//     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     const userId = "23VFC0029"
//     const password = "2321"

//     const uploadAttendancePdfFormat = true

//    console.log(unqUserObjectId)



    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

        console.log(response)

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { uploadAttendancePdfFormat:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:true,
            uploadMarksCount:0,
            // techConcern: false,
            // schoolConcern: false,
            // studentRelatedConncern:false,
            // individualConcern: false

            }


            const response = await ErpTest.create(testObject)


            res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
    }
};











// //Answer 6 api. Upload marks c
// export const uploadMarks = async (req, res) =>{

//     console.log("Hello upload marks erp test")

//     const {unqUserObjectId, userId,
//     schoolId, classOfCenter, examId} = req.body;


// //     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
// //     const userId = "23VFC0029"
// //     const password = "2321"
// //     const selfAttendance = true

    
// //     const schoolId = '4025'
// //    const classOfCenter = '9'

// //     const examId = 'English-CBSE_HBSE-9-(SAT)-(2025-09-11)'
// //    console.log(unqUserObjectId)


//     //Fetching student marks count based on schoolId, and clas of student
   
//        const findStudentWithschoolIdandClass = await Student.find({
//            schoolId: schoolId,
//            classofStudent: classOfCenter,
//            isSlcTaken:false
//        })
   
      
   
//        //Storing all student ids from Student collection. 
//        //Then we can use those ids for query in student attendances for fetching attendance count.
   
//         let allStudentId = [];
//            findStudentWithschoolIdandClass.map((eachStudent)=>{
//            allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
//            })
   
//         //    console.log(allStudentId)
   
//        //-----------------------------------------------------------------------------
   
   
   
//        //Now fetching student attendance count (only Present count) from studentattendances
//        //We wil fetch current dates present count only only.
   
//        // Setting dates for querying
//        const startDate = new Date()
//        const endDate = new Date ()
   
//        startDate.setUTCHours(0, 0, 0, 0);
//        endDate.setHours(23, 59, 59, 999);
   
//        console.log("dates are", startDate, endDate)
   
//        const fetchMarksCount = await Marks.find({
//            unqStudentObjectId: {$in:allStudentId},
//            //  date: {$gte:startDate, $lte:endDate},
//            examId: examId,
//             marksObtained: { $ne: null, $exists: true, $type: "number" }
//        })
   
//        const marksCount = fetchMarksCount.length
   
//     //    console.log(marksCount)
//        //--------------------------------------------------------



//     try {

//         //first we will check if the data exist in db using objectId.
//         const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

//         console.log(response)

//         if (response.length > 0){

//             // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { uploadMarksCount:marksCount } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//         } else {

//             const testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             // password: "1234",
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:marksCount,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: false

//             }


//             const response = await ErpTest.create(testObject)


//             res.status(200).json({status: 'Ok', data: response})
//         }
        
//     } catch (error) {
//         console.log("Error::::>", error)

//          res.status(500).json({status: 'Ok', message: 'Error occured!'})
//     }
// };









// // Answer 6 API: Upload marks
// export const uploadMarks = async (req, res) => {
//   console.log("Hello upload marks ERP test");

//   const { unqUserObjectId, userId, schoolId, classOfCenter, examId } = req.body;

//   console.log(req.body)

//   try {
//     // Fetch students for the school and class who haven't taken SLC
//     const students = await Student.find({
//       schoolId,
//       classofStudent: classOfCenter,
//       isSlcTaken: false
//     });

//     if (!students.length) {
//       return res.status(404).json({ status: "Error", message: "No students found for the given school and class." });
//     }

//     // Prepare student IDs for querying Marks
//     const studentIds = students.map((s) => new mongoose.Types.ObjectId(s._id));

//     // Fetch marks for these students for the given exam
//     const marksRecords = await Marks.find({
//       unqStudentObjectId: { $in: studentIds },
//       examId,
//       marksObtained: { $ne: null, $exists: true, $type: "number" }
//     });

//     // Initialize uploadMarksCount object based on schema defaults
//     const uploadMarksCount = {};

//     // Fill default student names from both classes
//     const defaultStudents = [
//       "Shubham","Ripudaman","Sanjeev","Ajay","Jatin","Poshak","Anshu","Gajendra","Vimal","Madhu", // 9th
//       "Akhilesh","Abhinesh","Akshay","Samay","Anjali","Rekha","Srishti","Aayush","Jay","Rohit" // 10th
//     ];

//     defaultStudents.forEach(name => {
//       uploadMarksCount[name] = 0;
//     });

//     // Count marks per student
//     marksRecords.forEach(mark => {
//       const student = students.find(s => s._id.toString() === mark.unqStudentObjectId.toString());
//       if (student && student.firstName in uploadMarksCount) {
//         uploadMarksCount[student.firstName] += 1; // increment count
//       }
//     });

//     // Check if ERP test record exists
//     let erpRecord = await ErpTest.findOne({ unqUserObjectId });

//     if (erpRecord) {
//       // Update existing record
//       erpRecord.uploadMarksCount = uploadMarksCount;
//       await erpRecord.save();

//       res.status(200).json({ status: "Ok", data: erpRecord });
//     } else {
//       // Create new record
//       const newErp = await ErpTest.create({
//         unqUserObjectId,
//         userId,
//         selfAttendance: false,
//         studentAttendanceCount: {}, // default empty
//         uploadMarksCount,
//         downloadAttendancePdfFormat: false,
//         uploadAttendancePdfFormat: false,
//         techConcern: false,
//         schoolConcern: false,
//         studentRelatedConncern: false,
//         individualConcern: false
//       });

//       res.status(200).json({ status: "Ok", data: newErp });
//     }
//   } catch (error) {
//     console.error("Error uploading marks:", error);
//     res.status(500).json({ status: "Error", message: "Error occurred while uploading marks." });
//   }
// };




// // Answer 6 API: Upload marks
// export const uploadMarks = async (req, res) => {
//   console.log("Hello upload marks ERP test");

//   const { unqUserObjectId, userId, schoolId, classOfCenter, examId } = req.body;

//   console.log(req.body)

//   try {
//     // Fetch students for the school and class who haven't taken SLC
//     const students = await Student.find({
//       schoolId,
//       classofStudent: classOfCenter,
//       isSlcTaken: false
//     });

//     if (!students.length) {
//       return res.status(404).json({ status: "Error", message: "No students found for the given school and class." });
//     }

//     // Prepare student IDs for querying Marks
//     const studentIds = students.map((s) => new mongoose.Types.ObjectId(s._id));

//     // Fetch marks for these students for the given exam
//     const marksRecords = await Marks.find({
//       unqStudentObjectId: { $in: studentIds },
//       examId,
//       marksObtained: { $ne: null, $exists: true, $type: "number" }
//     });

//     // Initialize uploadMarksCount object based on schema defaults
//     const uploadMarksCount = {};

//     // Fill default student names from both classes
//     const defaultStudents = [
//       "Shubham","Ripudaman","Sanjeev","Ajay","Jatin","Poshak","Anshu","Gajendra","Vimal","Madhu", // 9th
//       "Akhilesh","Abhinesh","Akshay","Samay","Anjali","Rekha","Srishti","Aayush","Jay","Rohit" // 10th
//     ];

//     defaultStudents.forEach(name => {
//       uploadMarksCount[name] = 0;
//     });

//     // Count marks per student
//     marksRecords.forEach(mark => {
//       const student = students.find(s => s._id.toString() === mark.unqStudentObjectId.toString());
//       if (student && student.firstName in uploadMarksCount) {
//         uploadMarksCount[student.firstName] += 1; // increment count
//       }
//     });

//     // Check if ERP test record exists
//     let erpRecord = await ErpTest.findOne({ unqUserObjectId });

//     if (erpRecord) {
//       // Update existing record
//       // --- FIX: merge counts so updating for one class doesn't zero-out the other class ---
//       const existingCounts = erpRecord.uploadMarksCount && typeof erpRecord.uploadMarksCount === 'object'
//         ? { ...erpRecord.uploadMarksCount }
//         : {};

//       // Ensure all default keys exist in existingCounts (so newly added students are present)
//       defaultStudents.forEach(name => {
//         if (!(name in existingCounts)) existingCounts[name] = 0;
//       });

//       // Only update counts for students belonging to the current classOfCenter.
//       // This prevents overwriting other class counts with zeros.
//       const classStudentNames = students.map(s => s.firstName);

//       classStudentNames.forEach(name => {
//         // set to the newly computed value for that student (or 0 if none)
//         existingCounts[name] = uploadMarksCount[name] || 0;
//       });

//       erpRecord.uploadMarksCount = existingCounts;
//       await erpRecord.save();

//       res.status(200).json({ status: "Ok", data: erpRecord });
//     } else {
//       // Create new record
//       const newErp = await ErpTest.create({
//         unqUserObjectId,
//         userId,
//         selfAttendance: false,
//         studentAttendanceCount: {}, // default empty
//         uploadMarksCount,
//         downloadAttendancePdfFormat: false,
//         uploadAttendancePdfFormat: false,
//         // techConcern: false,
//         // schoolConcern: false,
//         // studentRelatedConncern: false,
//         // individualConcern: false
//       });

//       res.status(200).json({ status: "Ok", data: newErp });
//     }
//   } catch (error) {
//     console.error("Error uploading marks:", error);
//     res.status(500).json({ status: "Error", message: "Error occurred while uploading marks." });
//   }
// };



// Answer 6 API: Upload marks
export const uploadMarks = async (req, res) => {
  console.log("Hello upload marks ERP test");

  const { unqUserObjectId, userId, schoolId, classOfCenter, examId } = req.body;

  console.log(req.body)

  try {
    // Predefined students list from schema with class information
    const predefinedStudents = {
      "class9": ["Shubham", "Ripudaman", "Sanjeev", "Ajay", "Jatin", "Poshak", "Anshu", "Gajendra", "Vimal", "Madhu"],
      "class10": ["Akhilesh", "Abhinesh", "Akshay", "Samay", "Anjali", "Rekha", "Srishti", "Aayush", "Jay", "Rohit"]
    };

    // Get all predefined students
    const allPredefinedStudents = [...predefinedStudents.class9, ...predefinedStudents.class10];

    // Fetch only predefined students for the school and current class
    const students = await Student.find({
      schoolId,
      classofStudent: classOfCenter,
      isSlcTaken: false,
      firstName: { $in: allPredefinedStudents } // ONLY predefined students
    });

    // Initialize uploadMarksCount for current class only
    const currentClassUploadMarksCount = {};
    
    // Determine which class we're processing
    const currentClassStudents = classOfCenter === "9" ? predefinedStudents.class9 : predefinedStudents.class10;
    
    // Initialize only current class students to 0
    currentClassStudents.forEach(name => {
      currentClassUploadMarksCount[name] = 0;
    });

    if (students.length > 0) {
      // Prepare student IDs for querying Marks
      const studentIds = students.map((s) => new mongoose.Types.ObjectId(s._id));

      // Fetch marks for these students for the given exam
      const marksRecords = await Marks.find({
        unqStudentObjectId: { $in: studentIds },
        examId,
        marksObtained: { $ne: null, $exists: true, $type: "number" }
      });

      // Count marks only for current class predefined students
      marksRecords.forEach(mark => {
        const student = students.find(s => s._id.toString() === mark.unqStudentObjectId.toString());
        if (student && currentClassStudents.includes(student.firstName)) {
          currentClassUploadMarksCount[student.firstName] += 1;
        }
      });
    }

    // Check if ERP test record exists
    let erpRecord = await ErpTest.findOne({ unqUserObjectId });

    if (erpRecord) {
      // Update existing record - preserve other class data
      const existingCounts = erpRecord.uploadMarksCount && typeof erpRecord.uploadMarksCount === 'object'
        ? { ...erpRecord.uploadMarksCount }
        : {};

      // Ensure all predefined students exist in the object
      allPredefinedStudents.forEach(name => {
        if (!(name in existingCounts)) {
          existingCounts[name] = 0;
        }
      });

      // Remove any non-predefined students
      Object.keys(existingCounts).forEach(key => {
        if (!allPredefinedStudents.includes(key)) {
          delete existingCounts[key];
        }
      });

      // Update ONLY current class students, preserve other class students
      Object.keys(currentClassUploadMarksCount).forEach(name => {
        existingCounts[name] = currentClassUploadMarksCount[name];
      });
      // Other class students remain unchanged

      erpRecord.uploadMarksCount = existingCounts;
      await erpRecord.save();

      res.status(200).json({ status: "Ok", data: erpRecord });
    } else {
      // Create new record with all predefined students (current class updated, other class as 0)
      const initialUploadMarksCount = {};
      allPredefinedStudents.forEach(name => {
        // If it's current class student, use the computed value, otherwise 0
        initialUploadMarksCount[name] = currentClassUploadMarksCount[name] !== undefined 
          ? currentClassUploadMarksCount[name] 
          : 0;
      });

      const newErp = await ErpTest.create({
        unqUserObjectId,
        userId,
        uploadMarksCount: initialUploadMarksCount
      });

      res.status(200).json({ status: "Ok", data: newErp });
    }
  } catch (error) {
    console.error("Error uploading marks:", error);
    res.status(500).json({ status: "Error", message: "Error occurred while uploading marks." });
  }
};

// //Disciplinary
// export const Disciplinary = async (req, res) =>{

//     console.log("Hello erp test disciplinary!")

//     const {unqUserObjectId, userId, disciplinary} = req.body;

//     console.log(req.body)

//     // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     // const userId = "23VFC0029"
//     // const password = "2321"
   

//     // console.log(unqUserObjectId)

//     try {

//         //first we will check if the data exist in db using objectId.
//         const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
//         // console.log(response[0])

//         if (response.length > 0){

//             // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { disciplinary:true } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//         } else {

//             const testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             // password: "1234",
//             disciplinary:true,
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:0,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: false

//             }


//             const response = await ErpTest.create(testObject)


//             res.status(200).json({status: 'Ok', data: response})
//         }
        
//     } catch (error) {
//         console.log("Error::::>", error)

//          res.status(500).json({status: 'Ok', message: 'Error occured!'})
//     }
// };






// Disciplinary
export const Disciplinary = async (req, res) => {
  console.log("Hello ERP test disciplinary!");

  const { unqUserObjectId, userId, disciplinary } = req.body;

  console.log(req.body);

  try {
    // Check if the ERP record exists
    let erpRecord = await ErpTest.findOne({ unqUserObjectId });

    if (erpRecord) {
      // Update the existing disciplinary object
      const updatedDisciplinary = { ...erpRecord.disciplinary, ...disciplinary };

      erpRecord.disciplinary = updatedDisciplinary;

      await erpRecord.save();

      res.status(200).json({ status: "Ok", data: erpRecord });
    } else {
      // Create new ERP record with disciplinary data
      const newErp = await ErpTest.create({
        unqUserObjectId,
        userId,
        disciplinary: disciplinary,
        selfAttendance: false,
        studentAttendanceCount: {
          count9: 0,
          Ajay: false,
          Jatin: false,
          count10: 0,
          Samay: false,
          Anjali: false
        },
        uploadMarksCount: {
          Shubham: 0,
          Ripudaman: 0,
          Sanjeev: 0,
          Ajay: 0,
          Jatin: 0,
          Poshak: 0,
          Anshu: 0,
          Gajendra: 0,
          Vimal: 0,
          Madhu: 0,
          Akhilesh: 0,
          Abhinesh: 0,
          Akshay: 0,
          Samay: 0,
          Anjali: 0,
          Rekha: 0,
          Srishti: 0,
          Aayush: 0,
          Jay: 0,
          Rohit: 0
        },
        downloadAttendancePdfFormat: false,
        uploadAttendancePdfFormat: false,
        techConcern: false,
        schoolConcern: false,
        studentRelatedConncern: false,
        individualConcern: false
      });

      res.status(200).json({ status: "Ok", data: newErp });
    }
  } catch (error) {
    console.log("Error::::>", error);
    res.status(500).json({ status: "Error", message: "Error occurred!" });
  }
};





// //Copy checking
// export const CopyChecking = async (req, res) =>{

//     console.log("Hello erp test copy checking!")

//     const {unqUserObjectId, userId} = req.body;

//     console.log(req.body)

//     // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     // const userId = "23VFC0029"
//     // const password = "2321"
   

//     // console.log(unqUserObjectId)

//     try {

//         //first we will check if the data exist in db using objectId.
//         const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
//         // console.log(response[0])

//         if (response.length > 0){

//             // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { copyChecking:true } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//         } else {

//             const testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             // password: "1234",
//             disciplinary:false,
//             copyChecking: true,
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:0,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: false

//             }


//             const response = await ErpTest.create(testObject)


//             res.status(200).json({status: 'Ok', data: response})
//         }
        
//     } catch (error) {
//         console.log("Error::::>", error)

//          res.status(500).json({status: 'Ok', message: 'Error occured!'})
//     }
// };




//Copy checking

// export const CopyChecking = async (req, res) =>{

//     console.log("Hello erp test copy checking!")

//     const {unqUserObjectId, userId, copyChecking} = req.body;

//     console.log("incoming copyChecking (from req.body):", copyChecking)

//     // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     // const userId = "23VFC0029"
//     // const password = "2321"
   

//     // console.log(unqUserObjectId)

//     try {

//         //first we will check if the data exist in db using objectId.
//         // Normalize unqUserObjectId for queries (if it's a string)
//         let unqIdFilter = unqUserObjectId;
//         try {
//           // only convert if possible; if it's already ObjectId this will be safe
//           unqIdFilter = mongoose.Types.ObjectId(unqUserObjectId);
//         } catch (err) {
//           // keep as-is if conversion fails
//           unqIdFilter = unqUserObjectId;
//         }

//         const response = await ErpTest.find({unqUserObjectId: unqIdFilter})
//         // console.log(response[0])

//         /**
//          * NEW BEHAVIOR:
//          * - If frontend sends `copyChecking` payload, use that.
//          * - Else, build from Student.todayCopyChecking (existing logic).
//          * - Merge into existing ErpTest.copyChecking or create new doc with defaults overwritten.
//          */

//         // If frontend sent copyChecking and it's a non-empty object -> use it
//         let builtCopyChecking = {};

//         const isObjNonEmpty = (o) => o && typeof o === 'object' && Object.keys(o).length > 0;

//         if (isObjNonEmpty(copyChecking)) {
//           // Use payload directly (trust frontend)
//           builtCopyChecking = copyChecking;
//           console.log("Using copyChecking from request body as builtCopyChecking:", builtCopyChecking);
//         } else {
//           // Fetch students that have any todayCopyChecking entries (non-empty array).
//           const studentsWithCopy = await Student.find({
//             "todayCopyChecking.0": { $exists: true } // at least one element
//           }).select("firstName todayCopyChecking"); // only need these fields

//           // Build the copyChecking object from studentsWithCopy
//           studentsWithCopy.forEach(student => {
//             const fname = student.firstName;
//             const records = Array.isArray(student.todayCopyChecking) ? student.todayCopyChecking : [];

//             records.forEach(rec => {
//               const hasClass = rec.classWorkChecking && rec.classWorkChecking !== "NA";
//               const hasHome = rec.homeWorkChecking && rec.homeWorkChecking !== "NA";

//               if (!hasClass && !hasHome) return; // nothing meaningful to save

//               const subject = rec.subject || "UnknownSubject";
//               const value = hasClass ? rec.classWorkChecking : rec.homeWorkChecking;
//               const statusType = hasClass ? "Class Work" : "Home Work";

//               if (!builtCopyChecking[fname]) builtCopyChecking[fname] = [];

//               const obj = {};
//               obj[subject] = value;
//               obj.status = statusType;

//               builtCopyChecking[fname].push(obj);
//             });
//           });

//           console.log("Built copyChecking from Student.todayCopyChecking:", builtCopyChecking);
//         }

//         // Prepare default copyChecking shape same as model defaults
//         const defaultCopyChecking = {
//           Aalia: [{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
//           Ajay: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
//           Aayush:[{English: null, status: null}, {Hindi: null, status:null}, {Science: null, status: null}], 
//           Abhinesh:[{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
//           Akhilesh: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
//         };

//         // Merge builtCopyChecking into either existing ErpTest.copyChecking or into defaults for new doc
//         if (response.length > 0){
//             // ✅ Update existing
//             const erpRecord = response[0];

//             // start with existing copyChecking if any, else with model defaults
//             const existing = erpRecord.copyChecking && typeof erpRecord.copyChecking === 'object' ? erpRecord.copyChecking : defaultCopyChecking;

//             // merge/overwrite per-student arrays with built values
//             const merged = { ...existing };

//             Object.keys(builtCopyChecking).forEach(fname => {
//               merged[fname] = builtCopyChecking[fname];
//             });

//             console.log("Merged copyChecking to write:", merged);

//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId: unqIdFilter },
//                 { $set: { copyChecking: merged } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//         } else {

//             // Build the initial copyChecking object: start from defaults and overwrite with built values
//             const initialCopyChecking = { ...defaultCopyChecking };

//             Object.keys(builtCopyChecking).forEach(fname => {
//               initialCopyChecking[fname] = builtCopyChecking[fname];
//             });

//             const testObject = {
//             unqUserObjectId: unqIdFilter,
//             userId: userId,
//             // password: "1234",
//             disciplinary:false,
//             copyChecking: initialCopyChecking,
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:0,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: false

//             }


//             const response = await ErpTest.create(testObject)


//             res.status(200).json({status: 'Ok', data: response})
//         }
        
//     } catch (error) {
//         console.log("Error::::>", error)

//          res.status(500).json({status: 'Ok', message: 'Error occured!'})
//     }
// };



//Copy checking
export const CopyChecking = async (req, res) =>{

    console.log("Hello erp test copy checking!")

    const {unqUserObjectId, userId, copyChecking} = req.body;

    console.log(copyChecking)

    // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
    // const userId = "23VFC0029"
    // const password = "2321"
   

    // console.log(unqUserObjectId)

    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
        // console.log(response[0])

        /**
         * NEW BEHAVIOR:
         * Instead of blindly setting copyChecking: true/false,
         * this controller will:
         * 1) prefer `copyChecking` from req.body (if provided and non-empty),
         * 2) else look for Student documents that have today's copy-checking entries (student.todayCopyChecking),
         * 3) build a `copyChecking` object shaped like the schema:
         *      { FirstName: [{<Subject>: <Complete|Incomplete|Unavailable>, status: <"Class Work"|"Home Work">}, ...], ... }
         * 4) merge these values into existing ErpTest.copyChecking (if record exists) or create a new ErpTest with these values.
         *
         * This ensures the stored `copyChecking` object always has the full shape matching your model defaults,
         * so other controllers that expect those keys won't break.
         *
         * NOTE: This implementation assumes your Student documents store today's copy-checking records in an array
         * called `todayCopyChecking` with elements shaped like:
         *   {
         *     subject: "English",
         *     classWorkChecking: "Complete" | "Incomplete" | "Unavailable" | "NA",
         *     homeWorkChecking:  "Complete" | "Incomplete" | "Unavailable" | "NA",
         *   }
         *
         */

        // Helper to detect non-empty plain object
        const isObjNonEmpty = (o) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length > 0;

        // Prepare default copyChecking shape same as model defaults (keeps existing keys and structure)
        const defaultCopyChecking = {
          Aalia: [{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
          Ajay: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
          Aayush:[{English: null, status: null}, {Hindi: null, status:null}, {Science: null, status: null}], 
          Abhinesh:[{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
          Akhilesh: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
        };

        // Determine source of truth for builtCopyChecking:
        // 1) prefer req.body.copyChecking if provided
        // 2) otherwise build from Student.todayCopyChecking
        let builtCopyChecking = {};

        if (isObjNonEmpty(copyChecking)) {
          // Use payload directly (frontend)
          builtCopyChecking = copyChecking;
          console.log("Using copyChecking from request body:", builtCopyChecking);
        } else {
          // Build from Student.todayCopyChecking (existing behavior)
          const studentsWithCopy = await Student.find({
            "todayCopyChecking.0": { $exists: true } // at least one element
          }).select("firstName todayCopyChecking");

          studentsWithCopy.forEach(student => {
            const fname = student.firstName;
            const records = Array.isArray(student.todayCopyChecking) ? student.todayCopyChecking : [];

            records.forEach(rec => {
              const hasClass = rec.classWorkChecking && rec.classWorkChecking !== "NA";
              const hasHome = rec.homeWorkChecking && rec.homeWorkChecking !== "NA";

              if (!hasClass && !hasHome) return;

              const subject = rec.subject || "UnknownSubject";
              const value = hasClass ? rec.classWorkChecking : rec.homeWorkChecking;
              const statusType = hasClass ? "Class Work" : "Home Work";

              if (!builtCopyChecking[fname]) builtCopyChecking[fname] = [];

              const obj = {};
              obj[subject] = value;
              obj.status = statusType;

              builtCopyChecking[fname].push(obj);
            });
          });

          console.log("Built copyChecking from Student.todayCopyChecking:", builtCopyChecking);
        }

        // Merge builtCopyChecking into either existing ErpTest.copyChecking or into defaults for new doc
        if (response.length > 0){
            // ✅ Update existing
            const erpRecord = response[0];

            // start with a safe baseline: model defaults
            const merged = JSON.parse(JSON.stringify(defaultCopyChecking));

            // If existing has object, merge its keys on top of defaults (preserve existing non-defaults)
            if (erpRecord.copyChecking && typeof erpRecord.copyChecking === 'object') {
              Object.keys(erpRecord.copyChecking).forEach(k => {
                merged[k] = erpRecord.copyChecking[k];
              });
            }

            // Overwrite with builtCopyChecking (either from req.body or built from students)
            Object.keys(builtCopyChecking).forEach(fname => {
              merged[fname] = builtCopyChecking[fname];
            });

            console.log("Final merged copyChecking to write:", merged);

            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { copyChecking: merged } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            // Build the initial copyChecking object: start from defaults and overwrite with built values
            const initialCopyChecking = JSON.parse(JSON.stringify(defaultCopyChecking));

            Object.keys(builtCopyChecking).forEach(fname => {
              initialCopyChecking[fname] = builtCopyChecking[fname];
            });

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            // disciplinary:false,
            // copyChecking: initialCopyChecking,
            selfAttendance: false,
            // studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            // uploadMarksCount:0,
            // techConcern: false,
            // schoolConcern: false,
            // studentRelatedConncern:false,
            // individualConcern: false

            }


            const response = await ErpTest.create(testObject)


            res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
    }
};






// //Answer 7 api. Tech concern controller
// export const handlingConcern = async (req, res) =>{

//     console.log("Hello handling concern")

// const {unqUserObjectId, userId, concernType} = req.body;
// //     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
// //     const userId = "23VFC0029"
// //     const password = "2321"
// //     const selfAttendance = true
// //     const schoolId = '4025'
// //    const classOfCenter = '9'


// //     const examId = 'English-CBSE_HBSE-9-(SAT)-(2025-09-11)'

// //     const concernType = 'School-Concern'   //School-Concern, //Student-Concern, //Individual-Concern

// //    console.log(unqUserObjectId)




//     try {

//         //first we will check if the data exist in db using objectId.
//         const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

//         // console.log(response)

//         if (response.length > 0){


//             if (concernType === "Tech-Concern"){

//                  // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { techConcern:true } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//             } else if (concernType === "School-Concern"){

//                  // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { schoolConcern:true } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//             } else if (concernType === "Student-Concern"){

//                  // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { studentRelatedConncern:true } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//             } else if (concernType === "Individual-Concern"){

//                  // ✅ Update existing
//             const updateResponse = await ErpTest.findOneAndUpdate(
//                 { unqUserObjectId },
//                 { $set: { individualConcern:true } },
//                 { new: true }   // returns updated doc
//             );

//             res.status(200).json({ status: "Ok", data: updateResponse });

//             }

//         } else {

//             let testObject;

//             if (concernType === "School-Concern"){
//             testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             password: "1234",
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:marksCount,
//             techConcern: true,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: false
//             }
//             } else if (concernType === "Tech-Concern"){
//                 testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             password: "1234",
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:marksCount,
//             techConcern: false,
//             schoolConcern: true,
//             studentRelatedConncern:false,
//             individualConcern: false
//             }

//             } else if (concernType === "School-Concern"){
//                 testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             password: "1234",
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:marksCount,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:true,
//             individualConcern: false
//             }

//             } else if (concernType === "Individual-Concern"){
//                 testObject = {
//             unqUserObjectId: unqUserObjectId,
//             userId: userId,
//             password: "1234",
//             selfAttendance: false,
//             studentAttendanceCount: 0,
//             downloadAttendancePdfFormat: false,
//             uploadAttendancePdfFormat:false,
//             uploadMarksCount:marksCount,
//             techConcern: false,
//             schoolConcern: false,
//             studentRelatedConncern:false,
//             individualConcern: true
//             }

//             }


           


//         const response = await ErpTest.create(testObject)


//         res.status(200).json({status: 'Ok', data: response})
//         }
        
//     } catch (error) {
//         console.log("Error::::>", error)

//          res.status(500).json({status: 'Ok', message: 'Error occured!'})
//     }
// };








//Answer 7 api. Tech concern controller
export const handlingConcern = async (req, res) =>{

    console.log("Hello handling concern")

const {unqUserObjectId, userId, concernType, remark, classOfConcern, schoolId, dateOfSubmission, concern, comment, studentSrn} = req.body;
//     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     const userId = "23VFC0029"
//     const password = "2321"
//     const selfAttendance = true
//     const schoolId = '4025'
//    const classOfCenter = '9'


//     const examId = 'English-CBSE_HBSE-9-(SAT)-(2025-09-11)'

//     const concernType = 'School-Concern'   //School-Concern, //Student-Concern, //Individual-Concern

//    console.log(unqUserObjectId)




    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

        // console.log(response)

        // Build a standardized concern item to push into arrays
        const concernItem = {
          concern: concern || null,                 // e.g. "Screen" (for tech) or "School" (for school)
          remark: remark || null,                   // the remark selected by user (e.g. "Not working")
          classOfConcern: classOfConcern || null,   // class (9/10)
          schoolId: schoolId || null,
          studentSrn: studentSrn || null,           // for student concerns
          comment: comment || null,
          createdBy: userId || null,
          dateOfSubmission: dateOfSubmission || new Date().toISOString().split("T")[0]
        };

        if (response.length > 0){


            if (concernType === "Tech-Concern"){

                 // append to techConcern.concerns array (ensure object shape)
                 const erp = response[0];
                 const current = (erp.techConcern && Array.isArray(erp.techConcern.concerns)) ? erp.techConcern.concerns : [];
                 current.push(concernItem);

                 const updateResponse = await ErpTest.findOneAndUpdate(
                    { unqUserObjectId },
                    { $set: { "techConcern.concerns": current } },
                    { new: true }   // returns updated doc
                 );

                res.status(200).json({ status: "Ok", data: updateResponse });

            } else if (concernType === "School-Concern"){

                 // append to schoolConcern.concerns array
                 const erp = response[0];
                 const current = (erp.schoolConcern && Array.isArray(erp.schoolConcern.concerns)) ? erp.schoolConcern.concerns : [];
                 // store remark value
                 current.push(concernItem);

                 const updateResponse = await ErpTest.findOneAndUpdate(
                    { unqUserObjectId },
                    { $set: { "schoolConcern.concerns": current } },
                    { new: true }   // returns updated doc
                 );

                res.status(200).json({ status: "Ok", data: updateResponse });

            } else if (concernType === "Student-Concern"){

                 // append to studentRelatedConncern.concerns array
                 const erp = response[0];
                 const current = (erp.studentRelatedConncern && Array.isArray(erp.studentRelatedConncern.concerns)) ? erp.studentRelatedConncern.concerns : [];
                 current.push(concernItem);

                 const updateResponse = await ErpTest.findOneAndUpdate(
                    { unqUserObjectId },
                    { $set: { "studentRelatedConncern.concerns": current } },
                    { new: true }   // returns updated doc
                 );

                res.status(200).json({ status: "Ok", data: updateResponse });

            } else if (concernType === "Individual-Concern"){

                 // if you later add an individualConcerns array, handle similarly.
                 // For now, we'll store in schoolConcern.concerns as fallback (or you can change to a different field).
                 const erp = response[0];
                 const current = (erp.schoolConcern && Array.isArray(erp.schoolConcern.concerns)) ? erp.schoolConcern.concerns : [];
                 current.push(concernItem);

                 const updateResponse = await ErpTest.findOneAndUpdate(
                    { unqUserObjectId },
                    { $set: { "schoolConcern.concerns": current } },
                    { new: true }   // returns updated doc
                 );

                res.status(200).json({ status: "Ok", data: updateResponse });

            } else {
                // Unknown concernType: return 400
                return res.status(400).json({ status: "Error", message: "Unknown concernType" });
            }

        } else {

            // If no ErpTest doc exists, create new one and seed the proper concerns array
            // create default shaped concerns arrays
            const defaultSchoolConcerns = { concerns: [] };
            const defaultTechConcerns = { concerns: [] };
            const defaultStudentConcerns = { concerns: [] };

            if (concernType === "School-Concern"){
                defaultSchoolConcerns.concerns.push(concernItem);
            } else if (concernType === "Tech-Concern"){
                defaultTechConcerns.concerns.push(concernItem);
            } else if (concernType === "Student-Concern"){
                defaultStudentConcerns.concerns.push(concernItem);
            } else if (concernType === "Individual-Concern"){
                defaultSchoolConcerns.concerns.push(concernItem);
            }

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:0,
            techConcern: defaultTechConcerns,
            schoolConcern: defaultSchoolConcerns,
            studentRelatedConncern: defaultStudentConcerns,
            // keep other model fields with defaults to match schema
            disciplinary: { Aalia:null, Ajay:null, Aayush:null, Abhinesh:null, Akhilesh:null },
            copyChecking: {
              Aalia: [{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
              Ajay: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
              Aayush:[{English: null, status: null}, {Hindi: null, status:null}, {Science: null, status: null}], 
              Abhinesh:[{English: null, status: null}, {Hindi: null, status:null}, {Maths: null, status: null}], 
              Akhilesh: [{English: null, status: null}, {Maths: null, status:null}, {Science: null, status: null}, {SST: null, status: null}], 
            },
            techConcern: defaultTechConcerns,
            schoolConcern: defaultSchoolConcerns,
            studentRelatedConncern: defaultStudentConcerns,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat: false,
            schoolConcern: defaultSchoolConcerns,
            studentRelatedConncern: defaultStudentConcerns,
            techConcern: defaultTechConcerns
            }

        const response = await ErpTest.create(testObject)


        res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
    }
};







// POST /api/erp/absenteecalling
export const absenteeCalling = async (req, res) => {
  console.log("Hello absentee calling");

  const {
    unqUserObjectId,
    userId,
    studentSrn,
    studentName,
    status,       // "Connected" | "Not-Connected"
    remark1,      // e.g. "Student Wants SLC"
    remark2       // e.g. phone number when Wrong Number, else ''
  } = req.body;

  console.log("payload:", {
    unqUserObjectId,
    userId,
    studentSrn,
    studentName,
    status,
    remark1,
    remark2,
  });

  try {
    if (!unqUserObjectId || !userId || !studentSrn) {
      return res.status(400).json({ status: "Error", message: "Missing required fields." });
    }

    // normalize unqUserObjectId
    let unqIdFilter = unqUserObjectId;
    try {
      unqIdFilter = mongoose.Types.ObjectId(unqUserObjectId);
    } catch (err) {
      unqIdFilter = unqUserObjectId;
    }

    // Build the student entry object to store
    const studentEntry = {
      studentSrn,
      studentName: studentName || null,
      status: status || null,
      remark1: remark1 || null,
      remark2: remark2 || null,
      updatedBy: userId || null,
      updatedAt: new Date(),
    };

    // Try find existing ErpTest doc
    let erp = await ErpTest.findOne({ unqUserObjectId: unqIdFilter });

    if (!erp) {
      // Create a new doc with default model-shape and the students array seeded
      const defaultObj = {
        unqUserObjectId: unqIdFilter,
        userId,
        selfAttendance: false,
        studentAttendanceCount: {
          count9: 0,
          Ajay: false,
          Jatin: false,
          count10: 0,
          Samay: false,
          Anjali: false,
        },
        uploadMarksCount: {
          Shubham: 0,
          Ripudaman: 0,
          Sanjeev: 0,
          Ajay: 0,
          Jatin: 0,
          Poshak: 0,
          Anshu: 0,
          Gajendra: 0,
          Vimal: 0,
          Madhu: 0,
          Akhilesh: 0,
          Abhinesh: 0,
          Akshay: 0,
          Samay: 0,
          Anjali: 0,
          Rekha: 0,
          Srishti: 0,
          Aayush: 0,
          Jay: 0,
          Rohit: 0,
        },
        disciplinary: {
          Aalia: null,
          Ajay: null,
          Aayush: null,
          Abhinesh: null,
          Akhilesh: null,
        },
        copyChecking: {
          Aalia: [{ English: null, status: null }, { Hindi: null, status: null }, { Maths: null, status: null }],
          Ajay: [{ English: null, status: null }, { Maths: null, status: null }, { Science: null, status: null }, { SST: null, status: null }],
          Aayush: [{ English: null, status: null }, { Hindi: null, status: null }, { Science: null, status: null }],
          Abhinesh: [{ English: null, status: null }, { Hindi: null, status: null }, { Maths: null, status: null }],
          Akhilesh: [{ English: null, status: null }, { Maths: null, status: null }, { Science: null, status: null }, { SST: null, status: null }],
        },
        absenteeCalling: { students: [studentEntry] },
        downloadAttendancePdfFormat: false,
        uploadAttendancePdfFormat: false,
        schoolConcern: { concerns: [] },
        studentRelatedConncern: { concerns: [] },
        techConcern: { concerns: [] },
        closeSchoolConcerns: { concerns: [] },
        closeStudentConcerns: { concerns: [] },
        closeTechConcerns: { concerns: [] },
      };

      erp = await ErpTest.create(defaultObj);
      return res.status(201).json({ status: "Ok", data: erp });
    }

    // ErpTest exists -> update its absenteeCalling.students array
    const studentsArr = (erp.absenteeCalling && Array.isArray(erp.absenteeCalling.students)) ? erp.absenteeCalling.students.slice() : [];

    // Replace existing entry if studentSrn matches, else append
    const idx = studentsArr.findIndex(s => s.studentSrn === studentSrn);

    if (idx >= 0) {
      // replace the entry (update)
      studentsArr[idx] = { ...studentsArr[idx], ...studentEntry };
    } else {
      studentsArr.push(studentEntry);
    }

    // Persist
    erp.absenteeCalling = { students: studentsArr };
    const saved = await erp.save();

    return res.status(200).json({ status: "Ok", data: saved });
  } catch (err) {
    console.error("Error in absenteeCalling:", err);
    return res.status(500).json({ status: "Error", message: "Error occured!" });
  }
};



// closeConcern.controller.js
// POST /api/erp/close-concern

export const closeConcernController = async (req, res) => {
  console.log("Hello close concern");

  const {
    unqUserObjectId,
    userId,
    concernType,      // "School-Concern" | "Tech-Concern" | "Student-Concern" | "Individual-Concern"
    concernId,        // original concern _id (string)
    concern,          // e.g. "Screen" / "School"
    remark,           // remark string from UI
    classOfConcern,
    schoolId,
    studentSrn,
    status,           // "Resolved" | "Still Not Resolved"
    comment,
    dateOfSubmission  // optional; if not provided will default to today
  } = req.body;

console.log(req.body)

  try {
    // basic validation
    if (!unqUserObjectId || !userId || !concernType || !concernId || !status) {
      return res.status(400).json({ status: "Error", message: "Missing required fields." });
    }

    // normalize unqUserObjectId
    let unqIdFilter = unqUserObjectId;
    try {
      unqIdFilter = mongoose.Types.ObjectId(unqUserObjectId);
    } catch (err) {
      // keep string if not convertible
      unqIdFilter = unqUserObjectId;
    }

    // Build close item
    const closeItem = {
      concernId: String(concernId),
      concern: concern || null,
      remark: remark || null,
      classOfConcern: classOfConcern || null,
      schoolId: schoolId || null,
      studentSrn: studentSrn || null,
      status: status || null,
      comment: comment || null,
      resolvedBy: userId || null,
      resolvedAt: new Date(),
      dateOfSubmission: dateOfSubmission || new Date().toISOString().split("T")[0]
    };

    // Decide which field to push into
    let pushField;
    if (concernType === "Tech-Concern") pushField = "closeTechConcerns.concerns";
    else if (concernType === "School-Concern") pushField = "closeSchoolConcerns.concerns";
    else if (concernType === "Student-Concern") pushField = "closeStudentConcerns.concerns";
    else if (concernType === "Individual-Concern") pushField = "closeSchoolConcerns.concerns"; // fallback
    else return res.status(400).json({ status: "Error", message: "Unknown concernType" });



//     let pushField;
// if (concernType === "Tech-Concern") pushField = "closeTechConcerns.concerns";
// else if (concernType === "School-Concern" || concernType === "School-Individual-Student") pushField = "closeSchoolConcerns.concerns";
// else if (concernType === "Student-Concern") pushField = "closeStudentConcerns.concerns";
// else if (concernType === "Individual-Concern") pushField = "closeSchoolConcerns.concerns"; // fallback
// else return res.status(400).json({ status: "Error", message: "Unknown concernType" });



    // Use atomic update with upsert so we avoid read-modify-write race conditions.
    // $setOnInsert seeds required defaults so the document still conforms to schema.
    const setOnInsertDefaults = {
      unqUserObjectId: unqIdFilter,
      userId,
      selfAttendance: false,
      studentAttendanceCount: {
        count9: 0,
        Ajay: false,
        Jatin: false,
        count10: 0,
        Samay: false,
        Anjali: false,
      },
      uploadMarksCount: {
        Shubham: 0,
        Ripudaman: 0,
        Sanjeev: 0,
        Ajay: 0,
        Jatin: 0,
        Poshak: 0,
        Anshu: 0,
        Gajendra: 0,
        Vimal: 0,
        Madhu: 0,
        Akhilesh: 0,
        Abhinesh: 0,
        Akshay: 0,
        Samay: 0,
        Anjali: 0,
        Rekha: 0,
        Srishti: 0,
        Aayush: 0,
        Jay: 0,
        Rohit: 0,
      },
      disciplinary: { Aalia: null, Ajay: null, Aayush: null, Abhinesh: null, Akhilesh: null },
      copyChecking: {
        Aalia: [{ English: null, status: null }, { Hindi: null, status: null }, { Maths: null, status: null }],
        Ajay: [{ English: null, status: null }, { Maths: null, status: null }, { Science: null, status: null }, { SST: null, status: null }],
        Aayush: [{ English: null, status: null }, { Hindi: null, status: null }, { Science: null, status: null }],
        Abhinesh: [{ English: null, status: null }, { Hindi: null, status: null }, { Maths: null, status: null }],
        Akhilesh: [{ English: null, status: null }, { Maths: null, status: null }, { Science: null, status: null }, { SST: null, status: null }]
      },
      absenteeCalling: { students: [] },
      downloadAttendancePdfFormat: false,
      uploadAttendancePdfFormat: false,
      schoolConcern: { concerns: [] },
      studentRelatedConncern: { concerns: [] },
      techConcern: { concerns: [] },
      closeSchoolConcerns: { concerns: [] },
      closeStudentConcerns: { concerns: [] },
      closeTechConcerns: { concerns: [] }
    };

    // Build update object
    // const updateObj = {
    //   $push: { [pushField]: closeItem },
    //   $setOnInsert: setOnInsertDefaults
    // };


    // Build update object
const updateObj = {
  $push: { [pushField]: closeItem },   // push into concerns array
  $setOnInsert: {
    unqUserObjectId: unqIdFilter,
    userId,
    selfAttendance: false,
    downloadAttendancePdfFormat: false,
    uploadAttendancePdfFormat: false
    // remove closeSchoolConcerns, closeStudentConcerns, closeTechConcerns
  }
};



    const options = { new: true, upsert: true };

    const updated = await ErpTest.findOneAndUpdate(
      { unqUserObjectId: unqIdFilter }, 
      updateObj,
      options
    );

    return res.status(200).json({ status: "Ok", data: updated });
  } catch (err) {
    console.error("Error in closeConcernController:", err);
    return res.status(500).json({ status: "Error", message: "Error occured!" });
  }
};








//Get ErpTest data by unqUserObjectId
export const GetErpTestByUnqUserObjectId = async (req, res) => {

console.log("Hello get erp test data")

const {unqUserObjectId} = req.body;


    // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"

    try {
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

        res.status(200).json({status: 'Success', data: response})
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Success', message: 'Error Occured!'})
    }


}






// New api for answers//

// controllers/erpTest.controller.js

/**
 * Single, generic controller to update any ErpTest "answer" field.
 * Expects: req.params.id (ErpTest _id) and req.body { field, value }
 *
 * NOTE: This controller aims to be safely generic while supporting
 * partial/atomic updates for common structured fields.
 */
export const updateErpTestAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing ErpTest id' });
    }
    if (!field) {
      return res.status(400).json({ success: false, error: 'Missing "field" in request body' });
    }

    // Allowed top-level fields from your schema
    const ALLOWED = [
      'selfAttendance',
      'studentAttendanceCount',
      'uploadMarksCount',
      'disciplinary',
      'copyChecking',
      'downloadAttendancePdfFormat',
      'uploadAttendancePdfFormat',
      'schoolConcern',
      'studentRelatedConncern',
      'techConcern',
      'absenteeCalling',
      'closeSchoolConcerns',
      'closeStudentConcerns',
      'closeTechConcerns'
    ];

    if (!ALLOWED.includes(field)) {
      return res.status(400).json({ success: false, error: 'Invalid field' });
    }

    // Helper validators and update builders
    const validators = {
      selfAttendance: (v) => typeof v === 'boolean',
      downloadAttendancePdfFormat: (v) => typeof v === 'boolean',
      uploadAttendancePdfFormat: (v) => typeof v === 'boolean',
      // For object-based fields we allow object payloads (partial updates) - validate below per-field
      studentAttendanceCount: (v) => v && typeof v === 'object',
      uploadMarksCount: (v) => v && typeof v === 'object',
      disciplinary: (v) => v && typeof v === 'object',
      copyChecking: (v) => v && typeof v === 'object',
      schoolConcern: (v) => v && typeof v === 'object',
      studentRelatedConncern: (v) => v && typeof v === 'object',
      techConcern: (v) => v && typeof v === 'object',
      absenteeCalling: (v) => v && typeof v === 'object',
      closeSchoolConcerns: (v) => v && typeof v === 'object',
      closeStudentConcerns: (v) => v && typeof v === 'object',
      closeTechConcerns: (v) => v && typeof v === 'object',
    };

    if (validators[field] && !validators[field](value)) {
      return res.status(400).json({ success: false, error: `Invalid value for field ${field}` });
    }

    const update = {}; // will collect atomic operations ($set, $push, etc.)
    const setOps = {}; // for $set
    const pushOps = {}; // for $push / $addToSet

    // Load existing document when we need to inspect structure (for index-based updates, etc.)
    let existing = null;
    const needsExisting = ['schoolConcern', 'studentRelatedConncern', 'techConcern', 'absenteeCalling', 'closeSchoolConcerns', 'closeStudentConcerns', 'closeTechConcerns'];
    if (needsExisting.includes(field)) {
      existing = await ErpTest.findById(id).lean();
      if (!existing) return res.status(404).json({ success:false, error: 'ErpTest not found' });
    }

    // Handlers per field
    switch (field) {
      // Simple booleans
      case 'selfAttendance':
      case 'downloadAttendancePdfFormat':
      case 'uploadAttendancePdfFormat':
        setOps[field] = value;
        break;

      // studentAttendanceCount: accept partial updates like { count9: 13 } or { Ajay: false }
      case 'studentAttendanceCount': {
        // allowed subkeys: count9, count10, Ajay, Jatin, Samay, Anjali
        const allowedSub = new Set(['count9','count10','Ajay','Jatin','Samay','Anjali']);
        Object.keys(value).forEach((k) => {
          if (allowedSub.has(k)) {
            const path = `studentAttendanceCount.${k}`;
            setOps[path] = value[k];
          }
        });
        break;
      }

      // uploadMarksCount: accept partial object mapping student names to marks or "Absent"
      case 'uploadMarksCount': {
        if (typeof value !== 'object') {
          return res.status(400).json({ success:false, error:'uploadMarksCount value must be an object' });
        }
        Object.keys(value).forEach((studentKey) => {
          // Do minimal validation: marks should be number or 'Absent' string
          const v = value[studentKey];
          if (typeof v === 'number' || (typeof v === 'string' && v.toLowerCase() === 'absent')) {
            setOps[`uploadMarksCount.${studentKey}`] = v;
          }
        });
        break;
      }

      // disciplinary and copyChecking: partial updates of student keys to status/null
      case 'disciplinary':
      case 'copyChecking': {
        Object.keys(value).forEach((studentKey) => {
          setOps[`${field}.${studentKey}`] = value[studentKey];
        });
        break;
      }

      // Concerns arrays + absenteeCalling: flexible operations (add/update/replace)
      case 'schoolConcern':
      case 'studentRelatedConncern':
      case 'techConcern': {
        // value may be:
        // 1) { action: 'add', text: '...' }
        // 2) { action: 'update', index: 0, status: 'Resolved' } // update existing by index
        // 3) { concerns: [...] } // replace full concerns array
        // 4) { action: 'addUnique', text: '...' } // add if not exists
        if (value.concerns && Array.isArray(value.concerns)) {
          setOps[`${field}.concerns`] = value.concerns;
        } else if (value.action === 'add' && value.text) {
          const newItem = { text: value.text, status: value.status || 'Open', createdAt: new Date() };
          // push to array
          pushOps[`${field}.concerns`] = { $each: [newItem] };
        } else if (value.action === 'addUnique' && value.text) {
          // use $addToSet to avoid duplicates (simple check by text)
          pushOps[`${field}.concerns`] = { $each: [{ text: value.text, status: value.status || 'Open', createdAt: new Date() }], $slice: 0 };
          // Note: $addToSet with objects compares whole object; for robust uniqueness implement server-side check.
        } else if (value.action === 'update' && Number.isInteger(value.index)) {
          const arr = existing[field] && existing[field].concerns ? existing[field].concerns : [];
          if (arr.length > value.index) {
            if (typeof value.status !== 'undefined') {
              setOps[`${field}.concerns.${value.index}.status`] = value.status;
            }
            if (typeof value.text !== 'undefined') {
              setOps[`${field}.concerns.${value.index}.text`] = value.text;
            }
          } else {
            return res.status(400).json({ success:false, error:'Invalid concern index' });
          }
        } else {
          return res.status(400).json({ success:false, error:'Invalid payload for concerns. Use {action, text} or {concerns: [...] } or {action:"update", index, status}'});
        }
        break;
      }

      // absenteeCalling: flexible: { action: 'set', students: ['Ajay','Jatin'] } or { action:'add', student:'Ajay' }
      case 'absenteeCalling': {
        // existing.absenteeCalling.students is an array
        if (value.action === 'set' && Array.isArray(value.students)) {
          setOps['absenteeCalling.students'] = value.students;
        } else if (value.action === 'add' && value.student) {
          // push unique
          pushOps['absenteeCalling.students'] = { $each: [value.student] };
        } else if (value.action === 'addUnique' && value.student) {
          // addToSet style
          // Because $addToSet not supported inside pushOps as structured here, move to special-case below
          update.$addToSet = update.$addToSet || {};
          update.$addToSet['absenteeCalling.students'] = value.student;
        } else if (value.action === 'remove' && value.student) {
          update.$pull = update.$pull || {};
          update.$pull['absenteeCalling.students'] = value.student;
        } else if (value.students && Array.isArray(value.students)) {
          // fallback: partial set of students array
          setOps['absenteeCalling.students'] = value.students;
        } else {
          return res.status(400).json({ success:false, error:'Invalid payload for absenteeCalling' });
        }
        break;
      }

      // closeSchoolConcerns/closeStudentConcerns/closeTechConcerns - replace or partial
      case 'closeSchoolConcerns':
      case 'closeStudentConcerns':
      case 'closeTechConcerns': {
        if (value.concerns && Array.isArray(value.concerns)) {
          setOps[`${field}.concerns`] = value.concerns;
        } else {
          return res.status(400).json({ success:false, error:`Invalid payload. Send { concerns: [...] } to replace ${field}`});
        }
        break;
      }

      default:
        return res.status(400).json({ success: false, error: 'Unhandled field' });
    }

    // Add $set and $push operations to update if present
    if (Object.keys(setOps).length) update.$set = { ...(update.$set || {}), ...setOps };
    if (Object.keys(pushOps).length) {
      // convert our pushOps to actual $push usage
      update.$push = update.$push || {};
      Object.keys(pushOps).forEach((k) => {
        update.$push[k] = pushOps[k];
      });
    }

    // Finally, perform the update atomically
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'No update operations were built; check payload' });
    }

    const updated = await ErpTest.findByIdAndUpdate(id, update, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'ErpTest not found' });
    }

    return res.json({ success: true, message: `${field} updated successfully`, data: updated });
  } catch (err) {
    console.error('updateErpTestAnswer error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};









// export const UpdateMarks = async (req, res) => {
//   console.log("hello UpdateMarks called");
//   const { unqUserObjectId, userId, marks } = req.body;

//   if (!unqUserObjectId) {
//     return res.status(400).json({ status: "Error", message: "unqUserObjectId is required" });
//   }

//   try {
//     let erpRecord = await ErpTest.findOne({ unqUserObjectId });

//     if (erpRecord) {
//       // Merge existing marks with incoming marks (overwrite provided fields)
//       erpRecord.marks = { ...erpRecord.marks, ...(marks || {}) };

//       await erpRecord.save();
//       return res.status(200).json({ status: "Ok", data: erpRecord });
//     } else {
//       // Create default document and set marks
//       const newErp = await ErpTest.create({
//         unqUserObjectId,
//         userId,
//         selfAttendance: false,
//         studentAttendanceCount: {
//           count9: 0,
//           Ajay: false,
//           Jatin: false,
//           count10: 0,
//           Samay: false,
//           Anjali: false,
//         },
//         uploadMarksCount: {
//           Shubham: 0,
//           Ripudaman: 0,
//           Sanjeev: 0,
//           Ajay: 0,
//           Jatin: 0,
//           Poshak: 0,
//           Anshu: 0,
//           Gajendra: 0,
//           Vimal: 0,
//           Madhu: 0,
//           Akhilesh: 0,
//           Abhinesh: 0,
//           Akshay: 0,
//           Samay: 0,
//           Anjali: 0,
//           Rekha: 0,
//           Srishti: 0,
//           Aayush: 0,
//           Jay: 0,
//           Rohit: 0,
//         },
//         downloadAttendancePdfFormat: false,
//         uploadAttendancePdfFormat: false,
//         techConcern: { concerns: [] },
//         schoolConcern: { concerns: [] },
//         studentRelatedConncern: { concerns: [] },
//         individualConcern: false,
//         marks: {
//           q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0,
//           q8: 0, q9: 0, q10: 0, q11: 0, q12: 0, q13: 0, q14: 0,
//           ... (marks || {})
//         },
//       });

//       return res.status(200).json({ status: "Ok", data: newErp });
//     }
//   } catch (error) {
//     console.error("UpdateMarks error:", error);
//     return res.status(500).json({ status: "Error", message: "Server error updating marks" });
//   }
// };





export const UpdateMarks = async (req, res) => {
  console.log("hello UpdateMarks called");
  const { unqUserObjectId, userId, marks, isTestSubmitted } = req.body;

  if (!unqUserObjectId) {
    return res.status(400).json({ status: "Error", message: "unqUserObjectId is required" });
  }

  try {
    let erpRecord = await ErpTest.findOne({ unqUserObjectId });

    if (erpRecord) {
      // Merge existing marks with incoming marks (overwrite provided fields)
      erpRecord.marks = { ...erpRecord.marks, ...(marks || {}) };

      // If the request explicitly sets isTestSubmitted, update it on the marks object
      if (typeof isTestSubmitted === "boolean") {
        erpRecord.marks.isTestSubmitted = isTestSubmitted;
      }

      await erpRecord.save();
      return res.status(200).json({ status: "Ok", data: erpRecord });
    } else {
      // Create default document and set marks
      const newErp = await ErpTest.create({
        unqUserObjectId,
        userId,
        selfAttendance: false,
        studentAttendanceCount: {
          count9: 0,
          Ajay: false,
          Jatin: false,
          count10: 0,
          Samay: false,
          Anjali: false,
        },
        uploadMarksCount: {
          Shubham: 0,
          Ripudaman: 0,
          Sanjeev: 0,
          Ajay: 0,
          Jatin: 0,
          Poshak: 0,
          Anshu: 0,
          Gajendra: 0,
          Vimal: 0,
          Madhu: 0,
          Akhilesh: 0,
          Abhinesh: 0,
          Akshay: 0,
          Samay: 0,
          Anjali: 0,
          Rekha: 0,
          Srishti: 0,
          Aayush: 0,
          Jay: 0,
          Rohit: 0,
        },
        downloadAttendancePdfFormat: false,
        uploadAttendancePdfFormat: false,
        techConcern: { concerns: [] },
        schoolConcern: { concerns: [] },
        studentRelatedConncern: { concerns: [] },
        individualConcern: false,
        marks: {
          q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0,
          q8: 0, q9: 0, q10: 0, q11: 0, q12: 0, q13: 0, q14: 0,
          ...(marks || {}),
          // ensure isTestSubmitted is present and respects incoming flag or marks.isTestSubmitted
          isTestSubmitted: typeof isTestSubmitted === "boolean" ? isTestSubmitted : Boolean((marks && marks.isTestSubmitted) || false)
        },
      });

      return res.status(200).json({ status: "Ok", data: newErp });
    }
  } catch (error) {
    console.error("UpdateMarks error:", error);
    return res.status(500).json({ status: "Error", message: "Server error updating marks" });
  }
};
