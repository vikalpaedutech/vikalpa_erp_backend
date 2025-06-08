//All the business logic, APIs and Rest APIs are in this script.

import mongoose from "mongoose";
import { StudentDisciplinary } from "../models/studentDisciplinary.model.js";


export const createDisciplinaryOrInteraction = async (req, res) => {

    console.log('I am inside the createDisciplinaryOrInteraction interaction')

    const { studentSrn,
    firstName,
    fatherName,
    classofStudent,
    districtId,
    blockId,
    schoolId,
    subject,
    status, // this holds the values like Disciplinary issue, Interaction
    remark,
    classWorkChecking,
    homeWorkChecking,

    comment,
    userId


} = req.body


try {
    
    const studentDisciplinaryOrInteraction = await StudentDisciplinary.create(req.body)

    res.status(200).json({status: "success", data: studentDisciplinaryOrInteraction})


} catch (error) {
    console.log("Error Occured While Creating StudentDisciplinaryOrInteraction", error.message);
}




}