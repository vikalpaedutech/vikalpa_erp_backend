//Writing controllers, Business logic, res APIs for district.model.js.

import { District_Block_School } from "../models/district_block_buniyaadCenters.model.js";





export const createPost = async (req, res) => {
  console.log("I am inside District_Block_School controller, createPost API");

  try {
    const {
      districtId,
      districtName,
      blockId,
      blockName,
      centerId,
      centerName
    } = req.body;

    console.log(req.body)

    const newEntry = await District_Block_School.create({
      districtId,
      districtName,
      blockId,
      blockName,
      centerId,
      centerName
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