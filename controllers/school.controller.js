//Writing controllers, Business logic, res APIs for school.model.js.





import { School } from "../models/school.model.js"; 

// Create a new school
export const createPost = async (req, res) => {
  try {
    const {
      schoolId,
      schoolName,
      schoolCode,
      blockId,
      districtId,
      address,
      pincode,
      contactNumber,
      principalName,
      totalStudents,
      totalTeachers,
    } = req.body;

    const school = new School({
      schoolId,
      schoolName,
      schoolCode,
      blockId,
      districtId,
      address,
      pincode,
      contactNumber,
      principalName,
      totalStudents,
      totalTeachers,
    });

    await school.save();
    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ message: "Error creating school", error });
  }
};



//Get API for Schools
export const getSchool = async (req, res) => {

    console.log("i am inside district controller, getDisgtrict api")

    try {

        

        const school = await School.find()

        res.status(201).json({status:"Success", data: school});
        
    } catch (error) {

        res.status(500).json({status: "Failed", message: error.message});
        
    }

}
//_________________________________________________________________________________




//Get API for Schools by blockId
export const getSchoolsByBlockId = async (req, res) => {

  console.log("i am inside school controller, getSchoolsByBlockId api")

  try {

      
      const {blockId} = req.params;

      const blockIdsArray = blockId.split(','); // ['11', '15', '14', '10', '16', '9', '13']

      console.log(" i am block id")
      console.log(blockId)

      const school = await School.find( {blockId: {$in : blockIdsArray}})  //{blockId:{$in: [...blockId]}}

      res.status(201).json({status:"Success", data: school});
      console.log(school)
      
  } catch (error) {

      res.status(500).json({status: "Failed", message: error.message});
      
  }

}
//_________________________________________________________________________________

//Get API for Schools by blockId
export const getSchoolsBySchoolId = async (req, res) => {

  console.log("i am inside school controller, getschoolsbyschoolid api")

  try {

      
      const {schoolId} = req.query;
      console.log(req.query)

      const schoolIdsArray = schoolId.split(','); // ['11', '15', '14', '10', '16', '9', '13']

      console.log(" i am school id")
      console.log(schoolIdsArray)

      const school = await School.find( {schoolId: {$in : schoolIdsArray}})  //{blockId:{$in: [...blockId]}}

      res.status(201).json({status:"Success", data: school});
      console.log(school)
      
  } catch (error) {

      res.status(500).json({status: "Failed", message: error.message});
      
  }

}
//_________________________________________________________________________________

