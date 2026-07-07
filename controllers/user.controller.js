//Writing all the Business logic, Rest APIs, for user.model.js;

import mongoose from "mongoose"; 
import { User, UserAccess } from "../models/user.model.js";
import { UserAttendance } from "../models/userAttendnace.model.js";
import { District_Block_School } from "../models/district_block_school.model.js";



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
    const { unqObjectId, userId, modules, region, batch } = req.body;

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
          batch,
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
                    "access.batch": 1,

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
                    "access.batch": 1,

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
          "accessDetails.batch": 1,
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



export const updateUserAccesses = async (req, res) => {
  try {
    const { 
      unqObjectId,
      modules,
      batch,
      addDistrict,
      removeDistrict,
      addBlock,
      removeBlock,
      addSchool,
      removeSchool,
      region 
    } = req.body;

    console.log('Updating user access for:', unqObjectId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    if (!unqObjectId) {
      return res.status(400).json({ 
        status: "Error", 
        message: "unqObjectId is required" 
      });
    }

    const existingUserAccess = await UserAccess.findOne({ unqObjectId });
    
    if (!existingUserAccess) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User access not found" 
      });
    }

    let updatedRegion = existingUserAccess.region ? 
      JSON.parse(JSON.stringify(existingUserAccess.region)) : [];
    
    let updateNeeded = false;
    let message = "No changes made";

    // Handle direct field updates
    if (modules !== undefined) {
      existingUserAccess.modules = modules;
      updateNeeded = true;
      message = "Modules updated";
    }

    if (batch !== undefined) {
      existingUserAccess.batch = batch;
      updateNeeded = true;
      message = "Batch updated";
    }

    if (region !== undefined) {
      existingUserAccess.region = region;
      updateNeeded = true;
      message = "Region updated";
    }

    // Handle adding a new district
    if (addDistrict) {
      const { districtId } = addDistrict;
      
      if (!districtId) {
        return res.status(400).json({
          status: "Error",
          message: "districtId is required for addDistrict"
        });
      }

      const districtExists = updatedRegion.some(r => r.districtId === districtId);

      if (!districtExists) {
        updatedRegion.push({
          districtId,
          blockIds: []
        });
        updateNeeded = true;
        message = `District ${districtId} added`;
        console.log(`Added district: ${districtId}`);
      } else {
        message = `District ${districtId} already exists`;
        console.log(`District ${districtId} already exists`);
      }
    }

    // Handle removing a district
    if (removeDistrict) {
      const { districtId } = removeDistrict;
      
      if (!districtId) {
        return res.status(400).json({
          status: "Error",
          message: "districtId is required for removeDistrict"
        });
      }

      const initialLength = updatedRegion.length;
      updatedRegion = updatedRegion.filter(r => r.districtId !== districtId);
      
      if (updatedRegion.length !== initialLength) {
        updateNeeded = true;
        message = `District ${districtId} removed`;
        console.log(`Removed district: ${districtId}`);
      } else {
        message = `District ${districtId} not found`;
      }
    }

    // Handle adding a block
    if (addBlock) {
      const { districtId, blockId } = addBlock;
      
      if (!districtId || !blockId) {
        return res.status(400).json({
          status: "Error",
          message: "districtId and blockId are required for addBlock"
        });
      }

      let districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);
      
      if (districtIndex === -1) {
        updatedRegion.push({
          districtId,
          blockIds: []
        });
        districtIndex = updatedRegion.length - 1;
        console.log(`Auto-created district: ${districtId}`);
      }

      const blockExists = updatedRegion[districtIndex].blockIds.some(
        b => b.blockId === blockId
      );

      if (!blockExists) {
        updatedRegion[districtIndex].blockIds.push({
          blockId,
          schoolIds: []
        });
        updateNeeded = true;
        message = `Block ${blockId} added to district ${districtId}`;
        console.log(`Added block: ${blockId} to district: ${districtId}`);
      } else {
        message = `Block ${blockId} already exists in district ${districtId}`;
        console.log(`Block ${blockId} already exists in district: ${districtId}`);
      }
    }

    // Handle removing a block
    if (removeBlock) {
      const { districtId, blockId } = removeBlock;
      
      if (!districtId || !blockId) {
        return res.status(400).json({
          status: "Error",
          message: "districtId and blockId are required for removeBlock"
        });
      }

      const districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);

      if (districtIndex !== -1) {
        const initialLength = updatedRegion[districtIndex].blockIds.length;
        updatedRegion[districtIndex].blockIds = updatedRegion[districtIndex].blockIds.filter(
          b => b.blockId !== blockId
        );
        
        if (updatedRegion[districtIndex].blockIds.length !== initialLength) {
          updateNeeded = true;
          message = `Block ${blockId} removed from district ${districtId}`;
          console.log(`Removed block: ${blockId} from district: ${districtId}`);
        } else {
          message = `Block ${blockId} not found in district ${districtId}`;
        }
      } else {
        message = `District ${districtId} not found`;
      }
    }

    // Handle adding a school - FIXED: Always return success if school exists
    if (addSchool) {
      const { districtId, blockId, schoolId } = addSchool;
      
      console.log('=== ADD SCHOOL REQUEST ===');
      console.log('DistrictId:', districtId);
      console.log('BlockId:', blockId);
      console.log('SchoolId:', schoolId);
      
      if (!districtId) {
        return res.status(400).json({
          status: "Error",
          message: "districtId is required for addSchool"
        });
      }
      
      if (!blockId) {
        return res.status(400).json({
          status: "Error",
          message: "blockId is required for addSchool"
        });
      }
      
      if (!schoolId || schoolId === '') {
        return res.status(400).json({
          status: "Error",
          message: "schoolId is required and cannot be empty for addSchool"
        });
      }

      // Find or create district
      let districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);
      
      if (districtIndex === -1) {
        updatedRegion.push({
          districtId,
          blockIds: []
        });
        districtIndex = updatedRegion.length - 1;
        console.log(`Auto-created district: ${districtId}`);
      }

      // Find or create block
      let blockIndex = updatedRegion[districtIndex].blockIds.findIndex(
        b => b.blockId === blockId
      );
      
      if (blockIndex === -1) {
        updatedRegion[districtIndex].blockIds.push({
          blockId,
          schoolIds: []
        });
        blockIndex = updatedRegion[districtIndex].blockIds.length - 1;
        console.log(`Auto-created block: ${blockId} in district: ${districtId}`);
      }

      // Clean existing schools (remove empty objects)
      const existingSchools = updatedRegion[districtIndex].blockIds[blockIndex].schoolIds || [];
      const cleanSchools = existingSchools.filter(s => s && s.schoolId && s.schoolId !== '');
      updatedRegion[districtIndex].blockIds[blockIndex].schoolIds = cleanSchools;
      
      // Check if school exists
      const schoolExists = cleanSchools.some(s => s.schoolId === schoolId);

      if (!schoolExists) {
        updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.push({
          schoolId
        });
        updateNeeded = true;
        message = `School ${schoolId} added to block ${blockId}`;
        console.log(`✅ Added school: ${schoolId} to block: ${blockId} in district: ${districtId}`);
      } else {
        // 🔥 FIX: School already exists, but we should still return success
        message = `School ${schoolId} already exists in block ${blockId}`;
        console.log(`School ${schoolId} already exists in block: ${blockId}`);
        // Don't set updateNeeded = false, keep it as is
        // If no other changes, we'll still save but with no changes
      }
    }

    // Handle removing a school
    if (removeSchool) {
      const { districtId, blockId, schoolId } = removeSchool;
      
      if (!districtId || !blockId || !schoolId) {
        return res.status(400).json({
          status: "Error",
          message: "districtId, blockId, and schoolId are required for removeSchool"
        });
      }

      const districtIndex = updatedRegion.findIndex(r => r.districtId === districtId);

      if (districtIndex !== -1) {
        const blockIndex = updatedRegion[districtIndex].blockIds.findIndex(
          b => b.blockId === blockId
        );

        if (blockIndex !== -1) {
          const initialLength = updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.length;
          
          const filteredSchools = updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.filter(
            s => s && s.schoolId && s.schoolId !== '' && s.schoolId !== schoolId
          );
          
          updatedRegion[districtIndex].blockIds[blockIndex].schoolIds = filteredSchools;
          
          if (updatedRegion[districtIndex].blockIds[blockIndex].schoolIds.length !== initialLength) {
            updateNeeded = true;
            message = `School ${schoolId} removed from block ${blockId}`;
            console.log(`Removed school: ${schoolId} from block: ${blockId} in district: ${districtId}`);
          } else {
            message = `School ${schoolId} not found in block ${blockId}`;
          }
        } else {
          message = `Block ${blockId} not found in district ${districtId}`;
        }
      } else {
        message = `District ${districtId} not found`;
      }
    }

    // Clean the region
    if (updateNeeded) {
      const cleanRegion = (region) => {
        return region.map(district => ({
          ...district,
          blockIds: district.blockIds.map(block => ({
            ...block,
            schoolIds: (block.schoolIds || [])
              .filter(s => s && s.schoolId && s.schoolId !== '')
              .map(s => ({ schoolId: s.schoolId }))
          }))
        }));
      };
      
      existingUserAccess.region = cleanRegion(updatedRegion);
      console.log('✅ Cleaned region before saving');
    }

    // 🔥 FIX: Even if no changes, return success with existing data
    // Only return error if absolutely no operation was provided
    if (!updateNeeded && modules === undefined && batch === undefined && region === undefined) {
      // Check if any operation was provided but no changes were needed
      if (addSchool || removeSchool || addBlock || removeBlock || addDistrict || removeDistrict) {
        // Operation was provided but no changes needed (e.g., school already exists)
        // Return success with current data
        console.log('ℹ️ No changes needed, returning current data');
        return res.status(200).json({
          status: "Success",
          message: message || "No changes needed",
          data: existingUserAccess
        });
      }
      
      return res.status(400).json({ 
        status: "Error", 
        message: "No valid update operations provided" 
      });
    }

    // Save the updated document
    const updatedUserAccess = await existingUserAccess.save();

    console.log('✅ Update successful:', updatedUserAccess._id);
    console.log('✅ Message:', message);

    res.status(200).json({ 
      status: "Success", 
      message: message || "User access updated successfully",
      data: updatedUserAccess 
    });

  } catch (error) {
    console.log("Error updating user access:", error.message);
    console.log("Error stack:", error.stack);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        status: "Error", 
        message: messages.join(', ') 
      });
    }

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




//version 2 api






export const UserAttendanceDashboard = async (req, res) => {
  try {
    const { date, role, schoolIds, attendanceType, attendanceStatus } = req.body;
    
    console.log(req.body);
    
    // Set current date if no date provided
    let filterDate;
    if (date) {
      filterDate = new Date(date);
      filterDate.setHours(0, 0, 0, 0);
    } else {
      filterDate = new Date();
      filterDate.setHours(0, 0, 0, 0);
    }
    
    // Next day for date range
    const nextDate = new Date(filterDate);
    nextDate.setDate(filterDate.getDate() + 1);
    
    // Build user match conditions
    const userMatchConditions = {
      isActive: true
    };
    
    // Add role filter - supports both string and array
    if (role) {
      if (Array.isArray(role) && role.length > 0) {
        userMatchConditions.role = { $in: role };
      } else if (typeof role === 'string' && role.trim() !== "") {
        userMatchConditions.role = role;
      }
    }
    
    // Build attendance match conditions for the lookup
    let attendanceMatchConditions = {
      $expr: {
        $and: [
          { $eq: ["$unqUserObjectId", "$$userId"] },
          { $gte: ["$date", "$$startDate"] },
          { $lt: ["$date", "$$endDate"] }
        ]
      }
    };

    // Add attendance type filter
    if (attendanceType) {
      let typeCondition = [];
      
      if (Array.isArray(attendanceType) && attendanceType.length > 0) {
        typeCondition = attendanceType.map(type => {
          if (type === "Field Visit") {
            return { $eq: ["$attendanceType", "Field Visit"] };
          } else if (type === "Manual Attendance" || type === "Daily Attendance") {
            return { $eq: ["$attendanceType", type] };
          } else if (type === "Leave") {
            return { $eq: ["$attendanceType", "Leave"] };
          }
          return null;
        }).filter(cond => cond !== null);
        
        if (typeCondition.length > 0) {
          attendanceMatchConditions.$expr.$and.push({ $or: typeCondition });
        }
      } else if (typeof attendanceType === 'string' && attendanceType.trim() !== "") {
        let condition = null;
        if (attendanceType === "Field Visit") {
          condition = { $eq: ["$attendanceType", "Field Visit"] };
        } else if (attendanceType === "Manual Attendance" || attendanceType === "Daily Attendance") {
          condition = { $eq: ["$attendanceType", attendanceType] };
        } else if (attendanceType === "Leave") {
          condition = { $eq: ["$attendanceType", "Leave"] };
        }
        
        if (condition) {
          attendanceMatchConditions.$expr.$and.push(condition);
        }
      }
    }

    // Add attendance status filter (present/absent)
    if (attendanceStatus) {
      if (attendanceStatus === "present") {
        attendanceMatchConditions.$expr.$and.push({ $eq: ["$isPresent", true] });
      } else if (attendanceStatus === "absent") {
        attendanceMatchConditions.$expr.$and.push({ $eq: ["$isPresent", false] });
      }
    }
    
    let pipeline = [
      // Filter users based on role and isActive
      { $match: userMatchConditions },
      {
        $lookup: {
          from: "useraccesses",
          localField: "_id",
          foreignField: "unqObjectId",
          as: "useraccessdetails"
        }
      },
      { $unwind: "$useraccessdetails" },
      {
        $lookup: {
          from: "userattendances",
          let: { 
            userId: "$useraccessdetails.unqObjectId",
            startDate: filterDate,
            endDate: nextDate
          },
          pipeline: [
            {
              $match: attendanceMatchConditions
            },
            {
              $project: {
                _id: 1,
                unqUserObjectId: 1,
                userId: 1,
                date: 1,
                attendance: 1,
                attendanceType: 1,  // Make sure this is included
                reasonIfNotPresent: 1,
                isLeaveApproved: 1,
                approvalRemark: 1,
                approvedBy: 1,
                loginTime: 1,
                logoutTime: 1,
                longitude: 1,
                latitude: 1,
                coordinateDifference: 1,
                logoutLongitude: 1,
                logoutLatitude: 1,
                logoutCoordinateDifference: 1,
                fileName: 1,
                fileUrl: 1,
                visitingLocation: 1,
                attendanceMarkedBy: 1,
                remarkForManualAttendance: 1,
                createdAt: 1,
                updatedAt: 1
              }
            },
            { $sort: { date: -1 } }
          ],
          as: "userAttendanceDetails"
        }
      },
      { $unwind: "$useraccessdetails.region" },
      { $unwind: "$useraccessdetails.region.blockIds" },
      { $unwind: "$useraccessdetails.region.blockIds.schoolIds" }
    ];
    
    // Filter by schoolIds if provided and array is not empty
    if (schoolIds && Array.isArray(schoolIds) && schoolIds.length > 0) {
      pipeline.push({
        $match: {
          "useraccessdetails.region.blockIds.schoolIds.schoolId": {
            $in: schoolIds
          }
        }
      });
    }
    
    // Continue with remaining pipeline
    pipeline.push(
      {
        $lookup: {
          from: "district_block_schools",
          let: { schoolId: "$useraccessdetails.region.blockIds.schoolIds.schoolId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$schoolId", "$$schoolId"]
                }
              }
            },
            {
              $project: {
                schoolId: 1,
                schoolName: 1,
                districtId: 1,
                districtName: 1,
                blockId: 1,
                blockName: 1,
                isCenterClosed: 1
              }
            }
          ],
          as: "schoolDetails"
        }
      },
      { $unwind: { path: "$schoolDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          name: { $first: "$name" },
          email: { $first: "$email" },
          password: { $first: "$password" },
          contact1: { $first: "$contact1" },
          contact2: { $first: "$contact2" },
          department: { $first: "$department" },
          role: { $first: "$role" },
          isActive: { $first: "$isActive" },
          profileImage: { $first: "$profileImage" },
          longitude: { $first: "$longitude" },
          latitude: { $first: "$latitude" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
          avgScore: { $first: "$avgScore" },
          rank: { $first: "$rank" },
          useraccessdetails: { $first: "$useraccessdetails" },
          userAttendanceDetails: { $first: "$userAttendanceDetails" },
          schoolIds: { $addToSet: "$useraccessdetails.region.blockIds.schoolIds.schoolId" },
          schoolsData: { 
            $addToSet: {
              schoolId: "$useraccessdetails.region.blockIds.schoolIds.schoolId",
              schoolName: "$schoolDetails.schoolName",
              districtId: "$schoolDetails.districtId",
              districtName: "$schoolDetails.districtName",
              blockId: "$schoolDetails.blockId",
              blockName: "$schoolDetails.blockName",
              isCenterClosed: "$schoolDetails.isCenterClosed"
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
          contact1: 1,
          contact2: 1,
          department: 1,
          role: 1,
          isActive: 1,
          profileImage: 1,
          longitude: 1,
          latitude: 1,
          createdAt: 1,
          updatedAt: 1,
          avgScore: 1,
          rank: 1,
          useraccessdetails: 1,
          userAttendanceDetails: 1,
          schoolIds: 1,
          schoolsData: 1
        }
      }
    );

    const response = await User.aggregate(pipeline);

    // Format role for response display
    let roleDisplay = "All";
    if (role) {
      if (Array.isArray(role)) {
        roleDisplay = role.join(", ");
      } else {
        roleDisplay = role;
      }
    }

    // Format attendance type for response display
    let attendanceTypeDisplay = "All";
    if (attendanceType) {
      if (Array.isArray(attendanceType)) {
        attendanceTypeDisplay = attendanceType.join(", ");
      } else {
        attendanceTypeDisplay = attendanceType;
      }
    }

    // Format attendance status for response display
    let attendanceStatusDisplay = "All";
    if (attendanceStatus) {
      attendanceStatusDisplay = attendanceStatus;
    }

    res.status(200).json({ 
      status: "Ok", 
      responseCount: response.length, 
      data: response,
      filters: {
        date: filterDate,
        role: roleDisplay,
        isActive: true,
        schoolIds: schoolIds && schoolIds.length > 0 ? schoolIds : "All",
        attendanceType: attendanceTypeDisplay,
        attendanceStatus: attendanceStatusDisplay
      }
    });
  } catch (error) {
    console.log("Error occurred:", error);
    res.status(500).json({ status: "Error", message: error.message });
  }
};



export const MarkUserAttendanceManually = async (req, res) => {
  try {
    const {
      _id,
      date,
      attendance,
      loginTime,
      logoutTime,
      longitude,
      latitude,
      coordinateDifference,
      logoutLongitude,
      logoutLatitude,
      logoutCoordinateDifference,
      fileName,
      fileUrl,
      attendanceType,
      visitingLocation,
      attendanceMarkedBy,
      remarkForManualAttendance
    } = req.body;
console.log(req.body)
    // Validate required fields
    if (!_id) {
      return res.status(400).json({ 
        status: "Error", 
        message: "unqUserObjectId (_id) is required" 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Date is required" 
      });
    }

    // FIX: Extract YYYY-MM-DD from the date
    let dateString;
    if (typeof date === 'string') {
      // If date contains 'T', take only the part before 'T'
      dateString = date.split('T')[0];
    } else {
      dateString = date;
    }
    
    // Create date objects for query (start and end of day in UTC)
    const startDate = new Date(`${dateString}T00:00:00.000Z`);
    const endDate = new Date(`${dateString}T23:59:59.999Z`);
    
    // Date to store in database (exact date without time)
    const exactDate = new Date(`${dateString}T00:00:00.000Z`);

    // Prepare update object
    const updateFields = {
      updatedAt: new Date(),
      date: exactDate // Always set the exact date
    };
    
    // Only add fields that are provided
    if (attendance !== undefined) updateFields.attendance = attendance;
    if (loginTime !== undefined) updateFields.loginTime = new Date(loginTime);
    if (logoutTime !== undefined) updateFields.logoutTime = new Date(logoutTime);
    if (longitude !== undefined) updateFields.longitude = longitude;
    if (latitude !== undefined) updateFields.latitude = latitude;
    if (coordinateDifference !== undefined) updateFields.coordinateDifference = coordinateDifference;
    if (logoutLongitude !== undefined) updateFields.logoutLongitude = logoutLongitude;
    if (logoutLatitude !== undefined) updateFields.logoutLatitude = logoutLatitude;
    if (logoutCoordinateDifference !== undefined) updateFields.logoutCoordinateDifference = logoutCoordinateDifference;
    if (fileName !== undefined) updateFields.fileName = fileName;
    if (fileUrl !== undefined) updateFields.fileUrl = fileUrl;
    if (attendanceType !== undefined) updateFields.attendanceType = attendanceType;
    if (visitingLocation !== undefined) updateFields.visitingLocation = visitingLocation;
    if (attendanceMarkedBy !== undefined) updateFields.attendanceMarkedBy = attendanceMarkedBy;
    if (remarkForManualAttendance !== undefined) updateFields.remarkForManualAttendance = remarkForManualAttendance;

    // Use findOneAndUpdate with upsert for simplicity
    const result = await UserAttendance.findOneAndUpdate(
      {
        unqUserObjectId: _id,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      },
      { $set: updateFields },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );

    const isNew = result.createdAt?.getTime() === result.updatedAt?.getTime();
    
    res.status(200).json({ 
      status: "Ok", 
      message: isNew ? "Attendance created successfully" : "Attendance updated successfully",
      data: result
    });

  } catch (error) {
    console.log("Error occurred while marking attendance:", error);
    res.status(500).json({ 
      status: "Error", 
      message: error.message 
    });
  }
};








export const leaveApproval = async (req, res) => {
  try {
    const { attendanceId, isLeaveApproved, approvalRemark, approvedBy } = req.body;

    // Validate required fields
    if (!attendanceId) {
      return res.status(400).json({
        status: "Error",
        message: "attendanceId is required"
      });
    }

    // Validate isLeaveApproved is a boolean
    if (isLeaveApproved !== undefined && typeof isLeaveApproved !== 'boolean') {
      return res.status(400).json({
        status: "Error",
        message: "isLeaveApproved must be a boolean value"
      });
    }

    // Check if attendance record exists
    const existingAttendance = await UserAttendance.findById(attendanceId);
    if (!existingAttendance) {
      return res.status(404).json({
        status: "Error",
        message: "Attendance record not found"
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    
    if (isLeaveApproved !== undefined) {
      updateData.isLeaveApproved = isLeaveApproved;
    }
    
    if (approvalRemark) {
      updateData.approvalRemark = approvalRemark;
    }
    
    if (approvedBy) {
      // Validate approvedBy is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(approvedBy)) {
        return res.status(400).json({
          status: "Error",
          message: "Invalid approvedBy user ID"
        });
      }
      
      // Check if the approver exists
      const approver = await User.findById(approvedBy);
      if (!approver) {
        return res.status(404).json({
          status: "Error",
          message: "Approver user not found"
        });
      }
      
      updateData.approvedBy = approvedBy;
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "Error",
        message: "No fields provided to update"
      });
    }

    // Update the attendance record
    const updatedAttendance = await UserAttendance.findByIdAndUpdate(
      attendanceId,
      { $set: updateData },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validations
      }
    );

    // Return success response
    return res.status(200).json({
      status: "Ok",
      message: "Leave approval updated successfully",
      data: updatedAttendance
    });

  } catch (error) {
    console.error("Error in leaveApproval:", error);
    return res.status(500).json({
      status: "Error",
      message: "Failed to update leave approval",
      error: error.message
    });
  }
};