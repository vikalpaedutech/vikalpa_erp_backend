//Routes for user.controller.js



import express from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    patchUserById,
    deleteUserById,
    getUsersByRole,
    toggleUserStatus,
    getUserByContact1, patchUser,
    patchUserByContact,
    setUserAccess,
    userSignIn,
    getAllUsersWithAccess, updateUserWithAccess,
    getUsersByObjectId
} from "../controllers/user.controller.js";

const router = express.Router();

// POST route to create a new user
router.post("/user", createUser);

// GET routes to fetch users
router.get("/users", getAllUsers);
router.get("/user/:userId", getUserById);
router.get("/user/login/:contact1", getUserByContact1);

router.post("/user-signin", userSignIn)

router.get("/users/role/:role", getUsersByRole);

// PUT route to update user by userId
router.put("/user/:userId", updateUserById);

// PATCH route to partially update user by userId
router.patch("/user/:userId", patchUserById);

// PATCH route to activate/deactivate user by userId
router.patch("/user/:userId/status", toggleUserStatus);

// DELETE route to delete user by userId
router.delete("/user/:userId", deleteUserById);

router.patch('/patch-user-by-contact/:contact1', patchUserByContact)

// router.patch('/user/:userId', patchUser);




//User access routes

router.post('/set-user-access',setUserAccess)



router.get("/get-all-users", getAllUsersWithAccess)


router.patch("/patch-user-and-useraccess", updateUserWithAccess)


router.post("/get-user-data-by-object-id", getUsersByObjectId)

export default router;
