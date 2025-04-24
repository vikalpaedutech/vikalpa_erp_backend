import express from "express";
import { createPost, uploadFile, getAllBills, getPendingBills, getVerifiedBills, getApprovedBills, getRejectedBills,
    getBillsDataByQueryParams, patchBillsDataVerification, patchBillsDataApproval, 

 } from "../controllers/bills.controller.js";

const router = express.Router();

// Endpoint for creating an expense with file upload
router.post("/create-expense", uploadFile, createPost);

router.get("/get-all-bills", getAllBills);

router.get("/get-pending-bills", getPendingBills);

router.get("/get-approved-bills", getApprovedBills);

router.get("/get-rejected-bills", getRejectedBills);

router.get("/get-bills-by-query", getBillsDataByQueryParams);

router.patch("/patch-bills", patchBillsDataVerification);

router.patch("/patch-bills-approval", patchBillsDataApproval);

router.get("/get-verified-bills", getVerifiedBills);

export default router;
