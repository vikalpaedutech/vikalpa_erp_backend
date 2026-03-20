//Writing all the Business logic, Rest APIs, for user.model.js;

import mongoose from "mongoose"; 
import { User, UserAccess } from "../models/user.model.js";

// Create a new user (POST)
// export const createUser = async (req, res) => {
//     console.log("I am inside user controller, createUser API");

//     try {
//         const { userId, name, email, password, contact1, contact2, department, role, assignmentLevel, 
//                 isAdmin, assignedDistricts, assignedBlocks, assignedSchools, districtIds, blockIds, schoolIds,
//                 classId, studentId, permission, accessModules, isActive, profileImage, longitude, latitude } = req.body;
        
//                 console.log(req.body)
//         const user = await User.create({
//             userId, name, email, password, contact1, contact2, department, role, assignmentLevel, 
//             isAdmin, assignedDistricts, assignedBlocks, assignedSchools, districtIds, blockIds, schoolIds,
//             classId, studentId, permission, accessModules, isActive, profileImage, longitude, latitude
//         });

//         res.status(201).json({ status: "Success", data: user });
//     } catch (error) {
//         console.log("Error creating user", error.message);
//         res.status(500).json({ status: "Error", message: "Server error" });
//     }
// };












// Create a new user (POST)
export const createUser = async (req, res) => {
  console.log("I am inside user controller, createUser API");

  try {
    const {
      userId,
      name,
      email,
      password,
      contact1,
      contact2,
      department,
      role,
      isActive,
      profileImage,
      longitude,
      latitude,
    } = req.body;

    console.log(req.body);

    // Create user
    const user = await User.create({
      userId,
      name,
      email,
      password,
      contact1,
      contact2,
      department,
      role,
      isActive,
      profileImage,
      longitude,
      latitude,
    });

    res.status(201).json({ status: "Success", data: user });
  } catch (error) {
    console.log("Error creating user", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }
};









//--------------------------------------------------------------

// Partially update user by ID (PATCH)
export const patchUserById = async (req, res) => {
    console.log("I am inside user controller, patchUserById API");

    try {
        const { userId } = req.params;
        const {longitude, latitude} = req.body;
        console.log(req.params)
       
         console.log(req.body)

        

        if (longitude === null && latitude === null) {
            
        res.status(404).json({ status: "Error", message: "Coordinates not updated" });

        return ;
        }

        

        const user = await User.findOneAndUpdate(
            { userId },
            req.body,  // Partially update with the request data
            { new: true, runValidators: true }
        );

         if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }
       

        res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        console.log("Error partially updating user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//--------------------------------------

// Update an existing user (PATCH)
export const patchUser = async (req, res) => {
    console.log("I am inside user controller, patch user API");

    try {
        const { userId } = req.params; // Assuming userId is passed in the URL params
        const updateData = req.body;

        console.log(req.body)
        console.log("Updating user:", userId);
        console.log("Update data:", updateData);

        const updatedUser = await User.findOneAndUpdate(
            { userId },              // Query condition
            { $set: updateData },    // Fields to update
            { new: true }            // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", data: updatedUser });
    } catch (error) {
        console.log("Error updating user:", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//----------------------------------------------

// Get all users
export const getAllUsers = async (req, res) => {
    console.log("I am inside user controller, getAllUsers API");

    try {
        const users = await User.find();
        
        if (!users) {
            return res.status(404).json({ status: "Error", message: "No users found" });
        }

        res.status(200).json({ status: "Success", data: users });
    } catch (error) {
        console.log("Error fetching users", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    console.log("I am inside user controller, getUserById API");

    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        console.log("Error fetching user by ID", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Get user by mobile/contact1

export const getUserByContact1 = async (req, res) => {
    console.log("I am inside user controller, getUserByContact1 API");

    try {
        const { contact1 } = req.params;
        console.log(contact1);

        // Finding user by contact1
        const user = await User.find({ contact1: contact1 });

        // Check if user array is empty
        if (user.length === 0) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        // If user found, send back the user details
        return res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        console.log("Error fetching user by contact1", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//____________________________________________



//User login api.

export const userSignIn = async (req, res) => {
    console.log("I am inside userSignIn API");

    try {
        const { contact1, password } = req.body;
        console.log("Request:", req.body);

        // Aggregation pipeline
        const user = await User.aggregate([
            {
                $match: { contact1, password }
            },
            {
                $lookup: {
                    from: "useraccesses", // collection name in MongoDB
                    localField: "_id",
                    foreignField: "unqObjectId",
                    as: "userAccess"
                }
            },
            {
                $unwind: {
                    path: "$userAccess",
                    preserveNullAndEmptyArrays: true // in case no access is defined
                }
            }
        ]);

        // If no user found
        if (!user || user.length === 0) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        
        console.log(user)

        // Return combined object
        return res.status(200).json({
            status: "Success",
            data: user[0]
        });

    } catch (error) {
        console.error("Error in userSignIn:", error.message);
        return res.status(500).json({ status: "Error", message: "Server Error" });
    }
};
//------------------------------------------------------






// Update user by ID (PUT)
export const updateUserById = async (req, res) => {
    console.log("I am inside user controller, updateUserById API");

    try {
        const { userId } = req.params;

        console.log(req.params)
        console.log(req.body)
        const user = await User.findOneAndUpdate(
            { userId },
            req.body,  // Update with data from the request body
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        console.log("Error updating user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};



// Delete user by ID (DELETE)
export const deleteUserById = async (req, res) => {
    console.log("I am inside user controller, deleteUserById API");

    try {
        const { userId } = req.params;

        const user = await User.findOneAndDelete({ userId });

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", message: "User deleted successfully" });
    } catch (error) {
        console.log("Error deleting user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Get all users by role (filter users by role)
export const getUsersByRole = async (req, res) => {
    console.log("I am inside user controller, getUsersByRole API");

    try {
        const { role } = req.params;

        const users = await User.find({ role });

        if (!users) {
            return res.status(404).json({ status: "Error", message: `No users found for role ${role}` });
        }

        res.status(200).json({ status: "Success", data: users });
    } catch (error) {
        console.log("Error fetching users by role", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Activate or deactivate user (PATCH)
export const toggleUserStatus = async (req, res) => {
    console.log("I am inside user controller, toggleUserStatus API");

    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        console.log("Error toggling user status", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};






//PATCH USER BY USER CONTACT

// Partially update user by ID (PATCH)
export const patchUserByContact = async (req, res) => {
    console.log("I am inside user controller, patchUserById API");

    try {
        const { contact1 } = req.params;
        console.log(req.params)
        console.log(req.body)

        
        const user = await User.findOneAndUpdate(
            { contact1 },
            req.body,  // Partially update with the request data
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        console.log("Error partially updating user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//--------------------------------------------------------




//User access controller api to update useraccess.
// Create or update UserAccess
export const setUserAccess = async (req, res) => {
  try {
    const { unqObjectId, userId, modules, region, classId } = req.body;

    if (!unqObjectId) {
      return res.status(400).json({ message: "unqObjectId (User ID) is required" });
    }

    // Use upsert: true → creates if not exists, updates if exists
    const updatedAccess = await UserAccess.findOneAndUpdate(
      { unqObjectId }, // match by user reference
      {
        $set: {
          userId,
          modules,
          region,
          classId,
        },
      },
      {
        new: true, // return updated doc
        upsert: true, // create if not exist
      }
    );

    res.status(200).json({
      message: "User access set successfully",
      data: updatedAccess,
    });
  } catch (error) {
    console.error("Error in setUserAccess:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//--------------------------------------------------------------






//get all users for admin side.

export const getAllUsersWithAccess = async (req, res) =>{

    console.log('Hello get all users')


    try {
        const {page,
            name,
            userId,
            contact1,
            contact2,
            department,
            role,
            isActive
        } = req.query;

        console.log(req.query)

        const filters = {};

        if (name) {
            filters.name = {$regex: name, $options: "i"}; //case-insensitive regex
        }
        if (userId) filters.userId = userId;
        if (contact1) filters.contact1 = contact1;
        if (contact2) filters.contact2 = contact2;
        if (department) filters.department = department;
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === "true";

        const perPage = 50;
        const skip = (parseInt(page) - 1) * perPage;


        const pipeline = [
            {$match: filters},

            {
                $lookup: {
                    from:"useraccesses", 
                    localField: "_id",
                    foreignField:"unqObjectId",
                    as: "access",

                },
            },
            {$unwind: {path: "$access", preserveNullAndEmptyArrays: true}},

            {
                $project: {
                    userId: 1,
                    name: 1,
                    email: 1,
                    contact1: 1,
                    contact2: 1,
                    department: 1,
                    role: 1,
                    isActive: 1,
                    createdAt: 1,
                    "access.modules":1,
                    "access.region": 1,
                    "access.classId": 1,

                },
            },
            {$sort:{createdAt: -1}},
            {$skip: skip},
            {$limit:perPage},
        ];

        const users = await User.aggregate(pipeline);

        //Count total users matching filters
        const totalUsers = await User.countDocuments(filters);

      

        res.json({
            success: true,
            page: parseInt(page),
            perPage,
            totalUsers,
            totalPages: Math.ceil(totalUsers / perPage),
            data: users,

        })

    } catch (error) {
        console.error("Error fetching users", error);
        res.status(500).json({success: false, message: "Server Error"})
    }
};







export const getAllUsersWithAccesswithoutPagination = async (req, res) =>{

    console.log('Hello get all users')


    try {
        const {page,
            name,
            userId,
            contact1,
            contact2,
            department,
            role,
            isActive
        } = req.query;

        console.log(req.query)

        const filters = {};

        if (name) {
            filters.name = {$regex: name, $options: "i"}; //case-insensitive regex
        }
        if (userId) filters.userId = userId;
        if (contact1) filters.contact1 = contact1;
        if (contact2) filters.contact2 = contact2;
        if (department) filters.department = department;
        // Force role to "CC" (fetch only users whose role is "CC")
        filters.role = "CC";
        // Force isActive to true (fetch only active users)
        filters.isActive = true;

        const pipeline = [
            {$match: filters},

            {
                $lookup: {
                    from:"useraccesses", 
                    localField: "_id",
                    foreignField:"unqObjectId",
                    as: "access",

                },
            },
            // Only keep documents that have an access (remove preserveNullAndEmptyArrays)
            {$unwind: {path: "$access", preserveNullAndEmptyArrays: false}},

            {
                $project: {
                    userId: 1,
                    name: 1,
                    email: 1,
                    contact1: 1,
                    contact2: 1,
                    department: 1,
                    role: 1,
                    isActive: 1,
                    createdAt: 1,
                    avgScore:1,
                    rank:1,
                    "access.modules":1,
                    "access.region": 1,
                    "access.classId": 1,

                },
            },
            {$sort:{createdAt: -1}},
        ];

        const users = await User.aggregate(pipeline);

        //Count total users matching filters
        const totalUsers = await User.countDocuments(filters);



        res.json({
            success: true,
            totalUsers,
            data: users,

        })

    } catch (error) {
        console.error("Error fetching users", error);
        res.status(500).json({success: false, message: "Server Error"})
    }
};


//Update users data role and access.

export const updateUserWithAccess = async (req, res) => {

    console.log('hello update user with access')
  try {
    const { _id, userData, userAccess } = req.body;

    console.log(req.body)

    if (!_id) {
      return res.status(400).json({ success: false, message: "_id is required" });
    }

    // ✅ Ensure _id is ObjectId
    const objectId = new mongoose.Types.ObjectId(_id);

    // ✅ Update Users collection
    let updatedUser = null;
    if (userData && Object.keys(userData).length > 0) {
      updatedUser = await User.findOneAndUpdate(
        { _id: objectId }, // match with User _id
        { ...userData, updatedAt: new Date() },
        { new: true }
      );
    }

    

    // ✅ Update UserAccess collection
    let updatedAccess = null;
    if (userAccess && Object.keys(userAccess).length > 0) {
      updatedAccess = await UserAccess.findOneAndUpdate(
        { unqObjectId: objectId }, // match with UserAccess.unqObjectId
        { ...userAccess, updatedAt: new Date() },
        { new: true }
      );
    }

    return res.json({
      success: true,
      message: "User and access updated successfully",
      user: updatedUser,
      access: updatedAccess,
    });
  } catch (error) {
    console.error("Error updating user with access:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};






// export const getUsersByObjectId = async (req, res) => {
//   console.log("Hello user by object id");

//   try {
//     const { _id } = req.body;
//     console.log(req.body);

//     const user = await User.aggregate([
//       {
//         $match: {
//           _id: new mongoose.Types.ObjectId(_id) // convert to ObjectId
//         }
//       },
//       {
//         $lookup: {
//           from: "useraccesses",
//           localField: "_id",
//           foreignField: "unqObjectId",
//           as: "accessDetails"
//         }
//       },
//       {
//         $unwind: {
//           path: "$accessDetails",
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           name: 1,
//           email: 1,
//           role: 1,
//           department: 1,
//           contact1: 1,
//           contact2: 1,
//           isActive: 1,
//           longitude: 1,
//           latitude: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           "accessDetails.classId": 1,
//           "accessDetails.modules": 1,
//           "accessDetails.region": 1,
//           "accessDetails.createdAt": 1,
//           "accessDetails.updatedAt": 1
//         }
//       }
//     ]);

//     if (!user.length) {
//       return res.status(404).json({ status: "Error", message: "User not found" });
//     }

//     res.status(200).json({ status: "Success", data: user }); // return first user
//   } catch (error) {
//     console.log("Error fetching user by ID", error.message);
//     res.status(500).json({ status: "Error", message: "Server error" });
//   }
// };






export const getUsersByObjectId = async (req, res) => {
  console.log("Hello user by object id");

  try {
    const { _id } = req.body;
    console.log(req.body);

    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id) // convert to ObjectId
        }
      },
      {
        $lookup: {
          from: "useraccesses",
          localField: "_id",
          foreignField: "unqObjectId",
          as: "accessDetails"
        }
      },
      {
        $unwind: {
          path: "$accessDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          "accessDetails.region": {
            $map: {
              input: { $ifNull: ["$accessDetails.region", []] },
              as: "regionItem",
              in: {
                districtId: "$$regionItem.districtId",
                blockIds: {
                  $map: {
                    input: { $ifNull: ["$$regionItem.blockIds", []] },
                    as: "blockItem",
                    in: {
                      blockId: "$$blockItem.blockId",
                      schoolIds: {
                        $map: {
                          input: { $ifNull: ["$$blockItem.schoolIds", []] },
                          as: "schoolItem",
                          in: {
                            schoolId: "$$schoolItem.schoolId"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "district_block_schools",
          let: { 
            region: "$accessDetails.region"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$districtId", "$$region.districtId"]
                }
              }
            },
            {
              $group: {
                _id: "$districtId",
                districtName: { $first: "$districtName" },
                blocks: {
                  $push: {
                    blockId: "$blockId",
                    blockName: "$blockName",
                    centerId: "$centerId",
                    centerName: "$centerName"
                  }
                }
              }
            }
          ],
          as: "districtDetails"
        }
      },
      {
        $addFields: {
          "accessDetails.region": {
            $map: {
              input: { $ifNull: ["$accessDetails.region", []] },
              as: "regionItem",
              in: {
                $mergeObjects: [
                  "$$regionItem",
                  {
                    districtName: {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$districtDetails",
                                as: "district",
                                cond: { $eq: ["$$district._id", "$$regionItem.districtId"] }
                              }
                            },
                            as: "matchedDistrict",
                            in: "$$matchedDistrict.districtName"
                          }
                        },
                        0
                      ]
                    },
                    blockIds: {
                      $map: {
                        input: { $ifNull: ["$$regionItem.blockIds", []] },
                        as: "blockItem",
                        in: {
                          $mergeObjects: [
                            "$$blockItem",
                            {
                              blockName: {
                                $arrayElemAt: [
                                  {
                                    $map: {
                                      input: {
                                        $filter: {
                                          input: {
                                            $reduce: {
                                              input: "$districtDetails",
                                              initialValue: [],
                                              in: { $concatArrays: ["$$value", "$$this.blocks"] }
                                            }
                                          },
                                          as: "block",
                                          cond: { 
                                            $and: [
                                              { $eq: ["$$block.blockId", "$$blockItem.blockId"] },
                                              { $eq: ["$$block.centerId", { $ifNull: ["$$blockItem.schoolIds.schoolId", null] }] }
                                            ]
                                          }
                                        }
                                      },
                                      as: "matchedBlock",
                                      in: "$$matchedBlock.blockName"
                                    }
                                  },
                                  0
                                ]
                              },
                              schoolIds: {
                                $map: {
                                  input: { $ifNull: ["$$blockItem.schoolIds", []] },
                                  as: "schoolItem",
                                  in: {
                                    $mergeObjects: [
                                      "$$schoolItem",
                                      {
                                        centerName: {
                                          $arrayElemAt: [
                                            {
                                              $map: {
                                                input: {
                                                  $filter: {
                                                    input: {
                                                      $reduce: {
                                                        input: "$districtDetails",
                                                        initialValue: [],
                                                        in: { $concatArrays: ["$$value", "$$this.blocks"] }
                                                      }
                                                    },
                                                    as: "block",
                                                    cond: { 
                                                      $and: [
                                                        { $eq: ["$$block.blockId", "$$blockItem.blockId"] },
                                                        { $eq: ["$$block.centerId", "$$schoolItem.schoolId"] }
                                                      ]
                                                    }
                                                  }
                                                },
                                                as: "matchedBlock",
                                                in: "$$matchedBlock.centerName"
                                              }
                                            },
                                            0
                                          ]
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          name: 1,
          email: 1,
          role: 1,
          department: 1,
          contact1: 1,
          contact2: 1,
          isActive: 1,
          longitude: 1,
          latitude: 1,
          createdAt: 1,
          updatedAt: 1,
          "accessDetails.classId": 1,
          "accessDetails.modules": 1,
          "accessDetails.region": 1,
          "accessDetails.createdAt": 1,
          "accessDetails.updatedAt": 1
        }
      }
    ]);

    if (!user.length) {
      return res.status(404).json({ status: "Error", message: "User not found" });
    }

    // Remove temporary fields from the final output
    if (user[0].accessDetails && user[0].accessDetails.region) {
      user[0].accessDetails.region = user[0].accessDetails.region.map(region => ({
        districtId: region.districtId,
        districtName: region.districtName,
        blockIds: region.blockIds.map(block => ({
          blockId: block.blockId,
          blockName: block.blockName,
          schoolIds: block.schoolIds.map(school => ({
            schoolId: school.schoolId,
            centerName: school.centerName
          }))
        }))
      }));
    }

    res.status(200).json({ status: "Success", data: user }); // return first user
  } catch (error) {
    console.log("Error fetching user by ID", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }
};





export const updateUser = async (req, res) => {
  try {
    const { 
      _id,
      userId,
      name,
      email,
      password,
      contact1,
      contact2,
      department,
      role,
      isActive,
      profileImage,
      longitude,
      latitude,
      avgScore,
      totalPoints,
      rank 
    } = req.body;



    console.log('inside update user')
    console.log(req.body)

    // Validate if _id is provided
    if (!_id) {
      return res.status(400).json({ 
        status: "Error", 
        message: "User ID (_id) is required" 
      });
    }

    // Check if the user exists
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User not found" 
      });
    }

    // Check for unique fields if they are being updated
    if (userId && userId !== existingUser.userId) {
      const userWithSameUserId = await User.findOne({ userId });
      if (userWithSameUserId) {
        return res.status(400).json({ 
          status: "Error", 
          message: "User ID already exists" 
        });
      }
    }

    if (email && email !== existingUser.email) {
      const userWithSameEmail = await User.findOne({ email });
      if (userWithSameEmail) {
        return res.status(400).json({ 
          status: "Error", 
          message: "Email already exists" 
        });
      }
    }

    // Build update object with only provided fields
    const updateFields = {};
    
    if (userId !== undefined) updateFields.userId = userId;
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (password !== undefined) {
      // You might want to hash the password here if needed
      // const hashedPassword = await bcrypt.hash(password, 10);
      // updateFields.password = hashedPassword;
      updateFields.password = password; // Consider hashing in production
    }
    if (contact1 !== undefined) updateFields.contact1 = contact1;
    if (contact2 !== undefined) updateFields.contact2 = contact2;
    if (department !== undefined) updateFields.department = department;
    if (role !== undefined) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;
    if (longitude !== undefined) updateFields.longitude = longitude;
    if (latitude !== undefined) updateFields.latitude = latitude;
    if (avgScore !== undefined) updateFields.avgScore = avgScore;
    if (totalPoints !== undefined) updateFields.totalPoints = totalPoints;
    if (rank !== undefined) updateFields.rank = rank;

    // Check if there's anything to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        status: "Error", 
        message: "No fields provided for update" 
      });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true, runValidators: true } // Return updated document and run schema validators
    ).select('-password'); // Exclude password from response

    res.status(200).json({ 
      status: "Success", 
      message: "User updated successfully",
      data: updatedUser 
    });

  } catch (error) {
    console.log("Error updating user:", error.message);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        status: "Error", 
        message: `${field} already exists` 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        status: "Error", 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      status: "Error", 
      message: "Server error while updating user" 
    });
  }
};










// export const updateUserAccesses = async (req, res) => {
//   try {
//     const { 
//       unqObjectId,
//       modules,
//       classId,
//       // Region operations
//       addDistrict,
//       removeDistrict,
//       addBlock,
//       removeBlock,
//       addSchool,
//       removeSchool,
//       // Full region replacement
//       region 
//     } = req.body;

//     console.log('i am update user access')
//     console.log(req.body)

//     // Validate if unqObjectId is provided
//     if (!unqObjectId) {
//       return res.status(400).json({ 
//         status: "Error", 
//         message: "unqObjectId is required" 
//       });
//     }

//     // Check if user access exists
//     const existingUserAccess = await UserAccess.findOne({ unqObjectId });
    
//     if (!existingUserAccess) {
//       return res.status(404).json({ 
//         status: "Error", 
//         message: "User access not found" 
//       });
//     }

//     let updateOperation = {};

//     // Handle direct field updates
//     if (modules !== undefined) {
//       updateOperation.modules = modules;
//     }

//     if (classId !== undefined) {
//       updateOperation.classId = classId;
//     }

//     // Handle full region replacement
//     if (region !== undefined) {
//       updateOperation.region = region;
//     }

//     // Handle adding a new district
//     if (addDistrict) {
//       const { districtId } = addDistrict;
      
//       // Check if district already exists
//       const districtExists = existingUserAccess.region.some(
//         r => r.districtId === districtId
//       );

//       if (!districtExists) {
//         updateOperation.$push = {
//           ...updateOperation.$push,
//           region: {
//             districtId,
//             blockIds: []
//           }
//         };
//       } else {
//         return res.status(400).json({
//           status: "Error",
//           message: `District ${districtId} already exists`
//         });
//       }
//     }

//     // Handle removing a district
//     if (removeDistrict) {
//       const { districtId } = removeDistrict;
      
//       updateOperation.$pull = {
//         ...updateOperation.$pull,
//         region: {
//           districtId: districtId
//         }
//       };
//     }

//     // Handle adding a block to a district
//     if (addBlock) {
//       const { districtId, blockId } = addBlock;
      
//       // Check if district exists
//       const districtIndex = existingUserAccess.region.findIndex(
//         r => r.districtId === districtId
//       );

//       if (districtIndex === -1) {
//         return res.status(400).json({
//           status: "Error",
//           message: `District ${districtId} not found`
//         });
//       }

//       // Check if block already exists in the district
//       const blockExists = existingUserAccess.region[districtIndex].blockIds.some(
//         b => b.blockId === blockId
//       );

//       if (!blockExists) {
//         updateOperation.$push = {
//           ...updateOperation.$push,
//           [`region.${districtIndex}.blockIds`]: {
//             blockId,
//             schoolIds: []
//           }
//         };
//       } else {
//         return res.status(400).json({
//           status: "Error",
//           message: `Block ${blockId} already exists in district ${districtId}`
//         });
//       }
//     }

//     // Handle removing a block
//     if (removeBlock) {
//       const { districtId, blockId } = removeBlock;
      
//       // Find the district
//       const districtIndex = existingUserAccess.region.findIndex(
//         r => r.districtId === districtId
//       );

//       if (districtIndex === -1) {
//         return res.status(400).json({
//           status: "Error",
//           message: `District ${districtId} not found`
//         });
//       }

//       updateOperation.$pull = {
//         ...updateOperation.$pull,
//         [`region.${districtIndex}.blockIds`]: {
//           blockId: blockId
//         }
//       };
//     }

//     // Handle adding a school to a block
//     if (addSchool) {
//       const { districtId, blockId, schoolId } = addSchool;
      
//       // Find the district
//       const districtIndex = existingUserAccess.region.findIndex(
//         r => r.districtId === districtId
//       );

//       if (districtIndex === -1) {
//         return res.status(400).json({
//           status: "Error",
//           message: `District ${districtId} not found`
//         });
//       }

//       // Find the block within the district
//       const blockIndex = existingUserAccess.region[districtIndex].blockIds.findIndex(
//         b => b.blockId === blockId
//       );

//       if (blockIndex === -1) {
//         return res.status(400).json({
//           status: "Error",
//           message: `Block ${blockId} not found in district ${districtId}`
//         });
//       }

//       // Check if school already exists in the block
//       const schoolExists = existingUserAccess.region[districtIndex].blockIds[blockIndex].schoolIds.some(
//         s => s.schoolId === schoolId
//       );

//       if (!schoolExists) {
//         updateOperation.$push = {
//           ...updateOperation.$push,
//           [`region.${districtIndex}.blockIds.${blockIndex}.schoolIds`]: {
//             schoolId
//           }
//         };
//       } else {
//         return res.status(400).json({
//           status: "Error",
//           message: `School ${schoolId} already exists in block ${blockId}`
//         });
//       }
//     }

//     // Handle removing a school
//     if (removeSchool) {
//       const { districtId, blockId, schoolId } = removeSchool;
      
//       // Find the district
//       const districtIndex = existingUserAccess.region.findIndex(
//         r => r.districtId === districtId
//       );

//       if (districtIndex === -1) {
//         return res.status(400).json({
//           status: "Error",
//           message: `District ${districtId} not found`
//         });
//       }

//       // Find the block within the district
//       const blockIndex = existingUserAccess.region[districtIndex].blockIds.findIndex(
//         b => b.blockId === blockId
//       );

//       if (blockIndex === -1) {
//         return res.status(400).json({
//           status: "Error",
//           message: `Block ${blockId} not found in district ${districtId}`
//         });
//       }

//       updateOperation.$pull = {
//         ...updateOperation.$pull,
//         [`region.${districtIndex}.blockIds.${blockIndex}.schoolIds`]: {
//           schoolId: schoolId
//         }
//       };
//     }

//     // Check if there's anything to update
//     if (Object.keys(updateOperation).length === 0) {
//       return res.status(400).json({ 
//         status: "Error", 
//         message: "No valid update operations provided" 
//       });
//     }

//     // Update the user access
//     const updatedUserAccess = await UserAccess.findOneAndUpdate(
//       { unqObjectId },
//       updateOperation,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({ 
//       status: "Success", 
//       message: "User access updated successfully",
//       data: updatedUserAccess 
//     });

//   } catch (error) {
//     console.log("Error updating user access:", error.message);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         status: "Error", 
//         message: messages.join(', ') 
//       });
//     }

//     res.status(500).json({ 
//       status: "Error", 
//       message: "Server error while updating user access" 
//     });
//   }
// };







export const updateUserAccesses = async (req, res) => {
  try {
    const { 
      unqObjectId,
      modules,
      classId,
      // Region operations
      addDistrict,
      removeDistrict,
      addBlock,
      removeBlock,
      addSchool,
      removeSchool,
      // Full region replacement
      region 
    } = req.body;

    console.log('Updating user access for:', unqObjectId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Validate if unqObjectId is provided
    if (!unqObjectId) {
      return res.status(400).json({ 
        status: "Error", 
        message: "unqObjectId is required" 
      });
    }

    // Check if user access exists
    const existingUserAccess = await UserAccess.findOne({ unqObjectId });
    
    if (!existingUserAccess) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User access not found" 
      });
    }

    // Create a deep copy of the current region for manipulation
    let updatedRegion = existingUserAccess.region ? 
      JSON.parse(JSON.stringify(existingUserAccess.region)) : [];
    
    let updateNeeded = false;

    // Handle direct field updates
    if (modules !== undefined) {
      existingUserAccess.modules = modules;
      updateNeeded = true;
    }

    if (classId !== undefined) {
      existingUserAccess.classId = classId;
      updateNeeded = true;
    }

    // Handle full region replacement
    if (region !== undefined) {
      existingUserAccess.region = region;
      updateNeeded = true;
    }

    // Handle adding a new district
    if (addDistrict) {
      const { districtId } = addDistrict;
      
      // Check if district already exists
      const districtExists = updatedRegion.some(r => r.districtId === districtId);

      if (!districtExists) {
        updatedRegion.push({
          districtId,
          blockIds: []
        });
        updateNeeded = true;
        console.log(`Added district: ${districtId}`);
      }
    }

    // Handle removing a district
    if (removeDistrict) {
      const { districtId } = removeDistrict;
      const initialLength = updatedRegion.length;
      updatedRegion = updatedRegion.filter(r => r.districtId !== districtId);
      
      if (updatedRegion.length !== initialLength) {
        updateNeeded = true;
        console.log(`Removed district: ${districtId}`);
      }
    }

    // Handle adding a block to a district
    if (addBlock) {
      const { districtId, blockId } = addBlock;
      
      // Find or create district
      let districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);
      
      // If district doesn't exist, create it first
      if (districtIndex === -1) {
        updatedRegion.push({
          districtId,
          blockIds: []
        });
        districtIndex = updatedRegion.length - 1;
        console.log(`Auto-created district: ${districtId}`);
      }

      // Check if block already exists in the district
      const blockExists = updatedRegion[districtIndex].blockIds.some(
        b => b.blockId === blockId
      );

      if (!blockExists) {
        updatedRegion[districtIndex].blockIds.push({
          blockId,
          schoolIds: []
        });
        updateNeeded = true;
        console.log(`Added block: ${blockId} to district: ${districtId}`);
      }
    }

    // Handle removing a block
    if (removeBlock) {
      const { districtId, blockId } = removeBlock;
      
      const districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);

      if (districtIndex !== -1) {
        const initialLength = updatedRegion[districtIndex].blockIds.length;
        updatedRegion[districtIndex].blockIds = updatedRegion[districtIndex].blockIds.filter(
          b => b.blockId !== blockId
        );
        
        if (updatedRegion[districtIndex].blockIds.length !== initialLength) {
          updateNeeded = true;
          console.log(`Removed block: ${blockId} from district: ${districtId}`);
        }
      }
    }

    // Handle adding a school to a block
    if (addSchool) {
      const { districtId, blockId, schoolId } = addSchool;
      
      // Find or create district
      let districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);
      
      // If district doesn't exist, create it
      if (districtIndex === -1) {
        updatedRegion.push({
          districtId,
          blockIds: []
        });
        districtIndex = updatedRegion.length - 1;
        console.log(`Auto-created district: ${districtId}`);
      }

      // Find or create block within the district
      let blockIndex = updatedRegion[districtIndex].blockIds.findIndex(
        b => b.blockId === blockId
      );
      
      // If block doesn't exist, create it
      if (blockIndex === -1) {
        updatedRegion[districtIndex].blockIds.push({
          blockId,
          schoolIds: []
        });
        blockIndex = updatedRegion[districtIndex].blockIds.length - 1;
        console.log(`Auto-created block: ${blockId} in district: ${districtId}`);
      }

      // Check if school already exists in the block
      const schoolExists = updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.some(
        s => s.schoolId === schoolId
      );

      if (!schoolExists) {
        updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.push({
          schoolId
        });
        updateNeeded = true;
        console.log(`Added school: ${schoolId} to block: ${blockId} in district: ${districtId}`);
      }
    }

    // Handle removing a school
    if (removeSchool) {
      const { districtId, blockId, schoolId } = removeSchool;
      
      const districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);

      if (districtIndex !== -1) {
        const blockIndex = updatedRegion[districtIndex].blockIds.findIndex(
          b => b.blockId === blockId
        );

        if (blockIndex !== -1) {
          const initialLength = updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.length;
          updatedRegion[districtIndex].blockIds[blockIndex].schoolIds = 
            updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.filter(
              s => s.schoolId !== schoolId
            );
          
          if (updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.length !== initialLength) {
            updateNeeded = true;
            console.log(`Removed school: ${schoolId} from block: ${blockId} in district: ${districtId}`);
          }
        }
      }
    }

    // Apply the updated region if changes were made
    if (updateNeeded) {
      existingUserAccess.region = updatedRegion;
    }

    // Check if there's anything to update
    if (!updateNeeded && modules === undefined && classId === undefined && region === undefined) {
      return res.status(400).json({ 
        status: "Error", 
        message: "No valid update operations provided" 
      });
    }

    // Save the updated document
    const updatedUserAccess = await existingUserAccess.save();

    console.log('Update successful:', updatedUserAccess._id);
    console.log('Updated region:', JSON.stringify(updatedUserAccess.region, null, 2));

    res.status(200).json({ 
      status: "Success", 
      message: "User access updated successfully",
      data: updatedUserAccess 
    });

  } catch (error) {
    console.log("Error updating user access:", error.message);
    console.log("Error stack:", error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        status: "Error", 
        message: messages.join(', ') 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Duplicate key error" 
      });
    }

    res.status(500).json({ 
      status: "Error", 
      message: "Server error while updating user access" 
    });
  }
};