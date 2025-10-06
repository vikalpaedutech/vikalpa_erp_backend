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

//Disciplinary
export const Disciplinary = async (req, res) =>{

    console.log("Hello erp test disciplinary!")

    const {unqUserObjectId, userId, disciplinary} = req.body;

    console.log(req.body)

    // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
    // const userId = "23VFC0029"
    // const password = "2321"
   

    // console.log(unqUserObjectId)

    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
        // console.log(response[0])

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { disciplinary:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            disciplinary:true,
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




//Copy checking
export const CopyChecking = async (req, res) =>{

    console.log("Hello erp test copy checking!")

    const {unqUserObjectId, userId} = req.body;

    console.log(req.body)

    // const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
    // const userId = "23VFC0029"
    // const password = "2321"
   

    // console.log(unqUserObjectId)

    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})
        // console.log(response[0])

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { copyChecking:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            disciplinary:false,
            copyChecking: true,
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

//Answer 3 api


export const studentAttendance = async (req, res) =>{

    console.log("Hello erp test student attendance.")

    const {unqUserObjectId, userId, schoolId, classOfCenter} = req.body;


//     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     const userId = "23VFC0029"
//     const password = "2321"
//     const selfAttendance = true

    
//     const schoolId = '4025'
//    const classOfCenter = '9'

   console.log(unqUserObjectId)


   //Fetching student attendance count.


   //Fetching student attendance count based on schoolId, and clas of student
   
       const findStudentWithschoolIdandClass = await Student.find({
           schoolId: schoolId,
           classofStudent: classOfCenter,
           isSlcTaken:false
       })
   
       //Storing all student ids from Student collection. 
       //Then we can use those ids for query in student attendances for fetching attendance count.
   
        let allStudentId = [];
           findStudentWithschoolIdandClass.map((eachStudent)=>{
           allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
           })
   

        //    console.log(allStudentId)

       //-----------------------------------------------------------------------------
   
       //Now fetching student attendance count (only Present count) from studentattendances
       //We wil fetch current dates present count only only.
   
       // Setting dates for querying
       const startDate = new Date()
       const endDate = new Date ()
   
       startDate.setUTCHours(0, 0, 0, 0);
       endDate.setHours(23, 59, 59, 999);
   
       // console.log("dates are", startDate, endDate)
   
       const fetchPresentStudentCountFromStudentAttendances = await StudentAttendance.find({
           unqStudentObjectId: {$in:allStudentId},
           date: {$gte:startDate, $lte:endDate},
           status: 'Present'
       })
   
       const PresentCount = fetchPresentStudentCountFromStudentAttendances.length
   
    //    console.log(PresentCount)


       //--------------------------------------------------------------------



    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

        // console.log(response)

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { studentAttendanceCount:PresentCount } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

        } else {

            const testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            // password: "1234",
            selfAttendance: false,
            studentAttendanceCount: PresentCount,
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








//Answer 6 api. Upload marks c


export const uploadMarks = async (req, res) =>{

    console.log("Hello upload marks erp test")

    const {unqUserObjectId, userId,
    schoolId, classOfCenter, examId} = req.body;


//     const unqUserObjectId = "68c1f6bb42aa3b998a0ad867"
//     const userId = "23VFC0029"
//     const password = "2321"
//     const selfAttendance = true

    
//     const schoolId = '4025'
//    const classOfCenter = '9'

//     const examId = 'English-CBSE_HBSE-9-(SAT)-(2025-09-11)'
//    console.log(unqUserObjectId)


    //Fetching student marks count based on schoolId, and clas of student
   
       const findStudentWithschoolIdandClass = await Student.find({
           schoolId: schoolId,
           classofStudent: classOfCenter,
           isSlcTaken:false
       })
   
      
   
       //Storing all student ids from Student collection. 
       //Then we can use those ids for query in student attendances for fetching attendance count.
   
        let allStudentId = [];
           findStudentWithschoolIdandClass.map((eachStudent)=>{
           allStudentId.push(new mongoose.Types.ObjectId(eachStudent._id))
           })
   
        //    console.log(allStudentId)
   
       //-----------------------------------------------------------------------------
   
   
   
       //Now fetching student attendance count (only Present count) from studentattendances
       //We wil fetch current dates present count only only.
   
       // Setting dates for querying
       const startDate = new Date()
       const endDate = new Date ()
   
       startDate.setUTCHours(0, 0, 0, 0);
       endDate.setHours(23, 59, 59, 999);
   
       console.log("dates are", startDate, endDate)
   
       const fetchMarksCount = await Marks.find({
           unqStudentObjectId: {$in:allStudentId},
           //  date: {$gte:startDate, $lte:endDate},
           examId: examId,
            marksObtained: { $ne: null, $exists: true, $type: "number" }
       })
   
       const marksCount = fetchMarksCount.length
   
    //    console.log(marksCount)
       //--------------------------------------------------------



    try {

        //first we will check if the data exist in db using objectId.
        const response = await ErpTest.find({unqUserObjectId: unqUserObjectId})

        console.log(response)

        if (response.length > 0){

            // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { uploadMarksCount:marksCount } },
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
            uploadAttendancePdfFormat:false,
            uploadMarksCount:marksCount,
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







//Answer 7 api. Tech concern controller


export const handlingConcern = async (req, res) =>{

    console.log("Hello handling concern")

    const {unqUserObjectId, userId, concernType} = req.body;


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

        if (response.length > 0){


            if (concernType === "Tech-Concern"){

                 // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { techConcern:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

            } else if (concernType === "School-Concern"){

                 // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { schoolConcern:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

            } else if (concernType === "Student-Concern"){

                 // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { studentRelatedConncern:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

            } else if (concernType === "Individual-Concern"){

                 // ✅ Update existing
            const updateResponse = await ErpTest.findOneAndUpdate(
                { unqUserObjectId },
                { $set: { individualConcern:true } },
                { new: true }   // returns updated doc
            );

            res.status(200).json({ status: "Ok", data: updateResponse });

            }



           

            

        } else {


            let testObject;

            if (concernType === "School-Concern"){
            testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:marksCount,
            techConcern: true,
            schoolConcern: false,
            studentRelatedConncern:false,
            individualConcern: false
            }
            } else if (concernType === "Tech-Concern"){
                testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:marksCount,
            techConcern: false,
            schoolConcern: true,
            studentRelatedConncern:false,
            individualConcern: false
            }

            } else if (concernType === "School-Concern"){
                testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:marksCount,
            techConcern: false,
            schoolConcern: false,
            studentRelatedConncern:true,
            individualConcern: false
            }

            } else if (concernType === "Individual-Concern"){
                testObject = {
            unqUserObjectId: unqUserObjectId,
            userId: userId,
            password: "1234",
            selfAttendance: false,
            studentAttendanceCount: 0,
            downloadAttendancePdfFormat: false,
            uploadAttendancePdfFormat:false,
            uploadMarksCount:marksCount,
            techConcern: false,
            schoolConcern: false,
            studentRelatedConncern:false,
            individualConcern: true
            }

            }


           


            const response = await ErpTest.create(testObject)


            res.status(200).json({status: 'Ok', data: response})
        }
        
    } catch (error) {
        console.log("Error::::>", error)

         res.status(500).json({status: 'Ok', message: 'Error occured!'})
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