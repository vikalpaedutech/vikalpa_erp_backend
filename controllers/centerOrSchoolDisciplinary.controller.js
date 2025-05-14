// /Backend/controller/centerOrDisciplinary.controller.js

//This is the controller for centerOrSchoolDiscipllinary.model.js

import { CenterOrSchoolDisciplinary } from "../models/centersOrSchoolsDisciplinary.model.js";


//Post Api
export const createCenterOrSchoolDisciplinary = async (req, res) => {

    const {districtName, blockName, schoolName, dateOfRecord, subject, classOfStudent,
        disciplinaryOrInteraction, disciplinaryOrInteractiionRemark,
        remark, userId
    } = req.body;

    try {
        console.log("I am inside try block of createCenterOrSchoolDisciplinary api");

        const centerOrSchoolDiscipllinary = await CenterOrSchoolDisciplinary.create(req.body);

        res.status(200).json({status: "Success", data: centerOrSchoolDiscipllinary})
        
    } catch (error) {
        console.log("Error occured while posting centersOrSchoolDisciplinary record", error.message);

        res.status(500).json({statu: "Failed", message: error})
    }
};


export const getCenterOrSchoolDisciplinaryDataByUserId = async (req, res) => {

    // const {userId} = req.params;
    const {userId, dateOfRecord, districtName, blockName, schoolName} = req.query;
    // console.log(req.params)
    console.log(req.query)
    
    try {
        console.log("I am inside try block of getCenterOrSchoolDisciplinaryDataByUserId api");

        const centerOrSchoolDiscipllinary = await CenterOrSchoolDisciplinary.find(req.query);

        res.status(200).json({status: "Success", data: centerOrSchoolDiscipllinary})
        //console.log(centerOrSchoolDiscipllinary)
        
    } catch (error) {
        console.log("Error occured while posting centersOrSchoolDisciplinary record", error.message);

        res.status(500).json({statu: "Failed", message: error})
    }
};