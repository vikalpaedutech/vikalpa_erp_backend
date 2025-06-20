//Writing all the Business logic, Rest APIs, for user.model.js;

import { User } from "../models/user.model.js";

// Create a new user (POST)
export const createUser = async (req, res) => {
    console.log("I am inside user controller, createUser API");

    try {
        const { userId, name, email, password, contact1, contact2, department, role, assignmentLevel, 
                isAdmin, assignedDistricts, assignedBlocks, assignedSchools, districtIds, blockIds, schoolIds,
                classId, studentId, permission, accessModules, isActive, profileImage, longitude, latitude } = req.body;
        
                console.log(req.body)
        const user = await User.create({
            userId, name, email, password, contact1, contact2, department, role, assignmentLevel, 
            isAdmin, assignedDistricts, assignedBlocks, assignedSchools, districtIds, blockIds, schoolIds,
            classId, studentId, permission, accessModules, isActive, profileImage, longitude, latitude
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
        console.log(req.params)
        console.log(req.body)

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
//---------------