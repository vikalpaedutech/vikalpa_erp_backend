//Writing all the Business logic, Rest APIs, for user.model.js;

import mongoose from "mongoose"; 
import { User, UserAccess } from "../models/user.model.js";

// Create a new user (POST)
// export const createUser = async (req, res) => {
//     //console.log("I am inside user controller, createUser API");

//     try {
//         const { userId, name, email, password, contact1, contact2, department, role, assignmentLevel, 
//                 isAdmin, assignedDistricts, assignedBlocks, assignedSchools, districtIds, blockIds, schoolIds,
//                 classId, studentId, permission, accessModules, isActive, profileImage, longitude, latitude } = req.body;
        
//                 //console.log(req.body)
//         const user = await User.create({
//             userId, name, email, password, contact1, contact2, department, role, assignmentLevel, 
//             isAdmin, assignedDistricts, assignedBlocks, assignedSchools, districtIds, blockIds, schoolIds,
//             classId, studentId, permission, accessModules, isActive, profileImage, longitude, latitude
//         });

//         res.status(201).json({ status: "Success", data: user });
//     } catch (error) {
//         //console.log("Error creating user", error.message);
//         res.status(500).json({ status: "Error", message: "Server error" });
//     }
// };












// Create a new user (POST)
export const createUser = async (req, res) => {
  //console.log("I am inside user controller, createUser API");

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

    //console.log(req.body);

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
    //console.log("Error creating user", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }
};









//--------------------------------------------------------------

// Partially update user by ID (PATCH)
export const patchUserById = async (req, res) => {
    //console.log("I am inside user controller, patchUserById API");

    try {
        const { userId } = req.params;
        const {longitude, latitude} = req.body;
        //console.log(req.params)
       
         //console.log(req.body)

        

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
        //console.log("Error partially updating user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//--------------------------------------

// Update an existing user (PATCH)
export const patchUser = async (req, res) => {
    //console.log("I am inside user controller, patch user API");

    try {
        const { userId } = req.params; // Assuming userId is passed in the URL params
        const updateData = req.body;

        //console.log(req.body)
        //console.log("Updating user:", userId);
        //console.log("Update data:", updateData);

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
        //console.log("Error updating user:", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//----------------------------------------------

// Get all users
export const getAllUsers = async (req, res) => {
    //console.log("I am inside user controller, getAllUsers API");

    try {
        const users = await User.find();
        
        if (!users) {
            return res.status(404).json({ status: "Error", message: "No users found" });
        }

        res.status(200).json({ status: "Success", data: users });
    } catch (error) {
        //console.log("Error fetching users", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    //console.log("I am inside user controller, getUserById API");

    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        //console.log("Error fetching user by ID", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Get user by mobile/contact1

export const getUserByContact1 = async (req, res) => {
    //console.log("I am inside user controller, getUserByContact1 API");

    try {
        const { contact1 } = req.params;
        //console.log(contact1);

        // Finding user by contact1
        const user = await User.find({ contact1: contact1 });

        // Check if user array is empty
        if (user.length === 0) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        // If user found, send back the user details
        return res.status(200).json({ status: "Success", data: user });
    } catch (error) {
        //console.log("Error fetching user by contact1", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};
//____________________________________________



//User login api.

export const userSignIn = async (req, res) => {
    //console.log("I am inside userSignIn API");

    try {
        const { contact1, password } = req.body;
        //console.log("Request:", req.body);

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

        
        //console.log(user)

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
    //console.log("I am inside user controller, updateUserById API");

    try {
        const { userId } = req.params;

        //console.log(req.params)
        //console.log(req.body)
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
        //console.log("Error updating user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};



// Delete user by ID (DELETE)
export const deleteUserById = async (req, res) => {
    //console.log("I am inside user controller, deleteUserById API");

    try {
        const { userId } = req.params;

        const user = await User.findOneAndDelete({ userId });

        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Success", message: "User deleted successfully" });
    } catch (error) {
        //console.log("Error deleting user", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Get all users by role (filter users by role)
export const getUsersByRole = async (req, res) => {
    //console.log("I am inside user controller, getUsersByRole API");

    try {
        const { role } = req.params;

        const users = await User.find({ role });

        if (!users) {
            return res.status(404).json({ status: "Error", message: `No users found for role ${role}` });
        }

        res.status(200).json({ status: "Success", data: users });
    } catch (error) {
        //console.log("Error fetching users by role", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};

// Activate or deactivate user (PATCH)
export const toggleUserStatus = async (req, res) => {
    //console.log("I am inside user controller, toggleUserStatus API");

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
        //console.log("Error toggling user status", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
};






//PATCH USER BY USER CONTACT

// Partially update user by ID (PATCH)
export const patchUserByContact = async (req, res) => {
    //console.log("I am inside user controller, patchUserById API");

    try {
        const { contact1 } = req.params;
        //console.log(req.params)
        //console.log(req.body)

        
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
        //console.log("Error partially updating user", error.message);
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

    //console.log('Hello get all users')


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

        //console.log(req.query)

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

    //console.log('Hello get all users')


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

        //console.log(req.query)

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

    //console.log('hello update user with access')
  try {
    const { _id, userData, userAccess } = req.body;

    //console.log(req.body)

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






export const getUsersByObjectId = async (req, res) => {
  //console.log("Hello user by object id");

  try {
    const { _id } = req.body;
    //console.log(req.body);

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

    res.status(200).json({ status: "Success", data: user }); // return first user
  } catch (error) {
    //console.log("Error fetching user by ID", error.message);
    res.status(500).json({ status: "Error", message: "Server error" });
  }
};