import express from "express";
import { createPost, uploadFile, getAllBills, getPendingAndVerifiedBillsByAci, getVerifiedBills, getApprovedBills, getRejectedBills,
    getBillsDataByQueryParams, patchBillsDataVerification, patchBillsDataApproval, deleteBill, getAllBillsWithUserDetails,
    getAllTypesOfBillsStatusForApprovalAndRejection,
    updateBillVerificationAndApprovalStatus, ViewBillSByLoggedInUserIdandDateRange,
    BillsVerification,
    BillsApproval, GetBillsForVerification
 } from "../controllers/bills.controller.js";

const router = express.Router();

// Endpoint for creating an expense with file upload
router.post("/create-expense", uploadFile, createPost);

router.get("/get-all-bills", getAllBills);

router.get("/get-pending-bills", getPendingAndVerifiedBillsByAci);

router.get("/get-approved-bills", getApprovedBills);

router.get("/get-rejected-bills", getRejectedBills);

router.get("/get-bills-by-query", getBillsDataByQueryParams);

router.patch("/patch-bills", patchBillsDataVerification);

router.patch("/patch-bills-approval", patchBillsDataApproval);

router.get("/get-verified-bills", getVerifiedBills);

router.delete("/delete-bill", deleteBill);

router.post ("/get-all-bills-with-user-details", getAllBillsWithUserDetails)

router.post('/get-all-types-of-bills', getAllTypesOfBillsStatusForApprovalAndRejection)

router.post('/update-verification-and-approval-status', updateBillVerificationAndApprovalStatus)


//version 2 route

router.post('/view-bills-by-userid-date-range', ViewBillSByLoggedInUserIdandDateRange)

router.post('/bills-verification', BillsVerification)



router.post('/bills-approval', BillsApproval)



router.post('/get-data-for-bills-verification', GetBillsForVerification)

export default router;


