import express from "express";
import { createPost, uploadFile } from "../controllers/bills.controller.js";

const router = express.Router();

// Endpoint for creating an expense with file upload
router.post("/create-expense", uploadFile, createPost);

export default router;
