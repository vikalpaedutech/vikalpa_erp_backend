import { Expense } from "../models/bills.model.js"; // Adjust path as necessary
import { uploadToCloudinary, getOptimizedUrl } from "../utils/cloudinary.utils.js"; // Import utility functions

// Multer configuration to store file in memory (no local storage)
import multer from "multer";
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Expense creation API
export const createPost = async (req, res) => {
  console.log("Inside expense controller, createPost API");

  try {
    // Extracting expense data from the request body
    const {
      expenseId,
      userId,
      purposeOfExpense,
      descriptionExpense,
      expenseDate,
      expenseType,
      travelFrom,
      travelTo,
      travelledDistrance,
      foodType,
      accomodationDate,
      stayedForDays,
      otherItemName,
      otherItemPurchasingPurpose,
      otherItemDescription,
      expenseAmount,
    } = req.body;

    // Handle file upload
    const file = req.file; // Assuming file is uploaded in the "file" field

    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`; // Create a unique file name

      // Upload the file to Cloudinary
      const uploadResult = await uploadToCloudinary(file.buffer, fileName);

      // Get the optimized URL for the uploaded file
      const fileUrl = getOptimizedUrl(uploadResult.public_id);

      // Create a new Expense document in the database
      const expense = await Expense.create({
        expenseId,
        userId,
        purposeOfExpense,
        descriptionExpense,
        expenseDate,
        expenseType,
        travelFrom,
        travelTo,
        travelledDistrance,
        foodType,
        accomodationDate,
        stayedForDays,
        otherItemName,
        otherItemPurchasingPurpose,
        otherItemDescription,
        expenseAmount,
        fileName: uploadResult.public_id, // Store the Cloudinary public_id
        fileUrl, // Store the Cloudinary URL
      });

      // Respond with the created expense data
      res.status(201).json({ status: "Success", data: expense });
    } else {
      // No file was uploaded
      res.status(400).json({ status: "Error", message: "No file uploaded" });
    }
  } catch (error) {
    console.log("Error creating expense:", error.message);
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Export the Multer upload middleware to be used in routes
export const uploadFile = upload.single('file'); // "file" is the field name for the file in the form
