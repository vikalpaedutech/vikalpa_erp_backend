//Writing controllers, Business logic, res APIs for district.model.js.

import { District_Block_School } from "../models/district_block_school.model.js";





export const createPost = async (req, res) => {
  console.log("I am inside District_Block_School controller, createPost API");

  try {
    const {
      districtId,
      districtName,
      blockId,
      blockName,
      schoolId,
      schoolName
    } = req.body;

    console.log(req.body)

    const newEntry = await District_Block_School.create({
      districtId,
      districtName,
      blockId,
      blockName,
      schoolId,
      schoolName
    });

    res.status(201).json({
      status: "Success",
      data: newEntry
    });

  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message
    });
  }
};



//Get district_block_schools

export const GetDistrictBlockSchoolByParams = async (req, res) =>{

  //user ke role basis pr, dynamically centerId, blockId, districtId query krunga.





  const {districtId, blockId, schoolId, role} = req.body;


  console.log(districtId)
console.log('I am inside district_block_school.controller.js and api: GetDistrictBlockSchoolByParams ')

  

  try {
    

    // const response = await District_Block_School.find({schoolId:{
    //   $in:schoolId
    // }, isCenterClosed:false})


    const response = await District_Block_School.find({isCenterClosed:false})


    res.status(200).json({status:"Success", data:response})


  } catch (error) {
    console.log('Error fetching data')
  }




}