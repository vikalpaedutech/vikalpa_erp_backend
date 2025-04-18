//Writing controllers, Business logic, res APIs for district.model.js.


import { Block } from "../models/block.model.js"; 

// Post api
export const createPost = async (req, res) => {

    console.log("i am inside block controller, createPost api")

  try {
    const { blockId, blockName, districtId } = req.body;
    const block = new Block({ blockId, blockName, districtId });
    await block.save();
    res.status(201).json(block);
  } catch (error) {
    res.status(500).json({ message: "Error creating block", error });
  }
};      



//Get API for Blocks
export const getBlock = async (req, res) => {

    console.log("i am inside district controller, getDisgtrict api")

    try {

        

        const block = await Block.find()

        res.status(201).json({status:"Success", data: block});
        
    } catch (error) {

        res.status(500).json({status: "Failed", message: error.message});
        
    }

}
//_________________________________________________________________________________


//Get API for Blocks by district Id
export const getBlocksByDistrictId = async (req, res) => {

  console.log("i am inside block controller, getBlocksByDistrictId api")

  try {

      
      const {districtId} = req.params;
      console.log(" i am district id")
      console.log(districtId)

      const block = await Block.find({ districtId: { $in: [...districtId]   } })

      res.status(201).json({status:"Success", data: block});
      console.log(block)
      
  } catch (error) {

      res.status(500).json({status: "Failed", message: error.message});
      
  }

}
//_________________________________________________________________________________


