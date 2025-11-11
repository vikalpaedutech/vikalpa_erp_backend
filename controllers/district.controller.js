//Writing controllers, Business logic, res APIs for district.model.js.

import {District} from "../models/district.model.js";




export const createPost = async (req, res) => {

    //console.log("i am inside district controller, createDistrict api")

    try {

        const {districtId, districtName} = req.body;

        const district = await District.create({
            districtId, districtName
        });

        res.status(201).json({status:"Success", data: district});
        
    } catch (error) {

        res.status(500).json({status: "Failed", message: error.message});
        
    }

}

//__________________________________________________________________________

//Get API for districts
export const getDistrict = async (req, res) => {

    //console.log("i am inside district controller, getDisgtrict api")

    try {

        

        const district = await District.find()

        res.status(201).json({status:"Success", data: district});
        
    } catch (error) {

        res.status(500).json({status: "Failed", message: error.message});
        
    }

}
//_________________________________________________________________________________



//Get API for districts
export const getDistrictById = async (req, res) => {

    // //console.log("i am inside district controller, getDistrictById api")

    const {districtId} = req.params
    // //console.log(...districtId)

    //console.log('hey there')
    //console.log(req.params)

 const arrayDistrictIds = districtId.split(','); // split by ',' not ', '
//console.log(arrayDistrictIds);
    try {


    
        const district = await District.find({districtId: {$in: arrayDistrictIds}})

        res.status(201).json({status:"Success", data: district});
        // //console.log(" i am fetched data")
        // //console.log(district)
        
    } catch (error) {

        res.status(500).json({status: "Failed", message: error.message});
        
    }

}
//_________________________________________________________________________________