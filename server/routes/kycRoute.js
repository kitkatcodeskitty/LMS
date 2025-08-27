import express from "express";
import { verify, verifyAdmin, verifyAdminOrSubAdmin } from "../auth.js";
import upload from "../configs/multer.js";
import { submitKyc, getMyKyc, listKyc, verifyKyc, rejectKyc, getKycByUserId, updateKyc, updateKycByUserId } from "../controllers/kycController.js";

const router = express.Router();

router.post(
  "/submit",
  verify,
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  submitKyc
);

router.get("/me", verify, getMyKyc);
// Allow users to get KYC data for referral users (for display purposes)
router.get("/user/:userId", verify, getKycByUserId);
router.get("/", verify, verifyAdminOrSubAdmin, listKyc);
router.patch("/:id/verify", verify, verifyAdminOrSubAdmin, verifyKyc);
router.patch("/:id/reject", verify, verifyAdminOrSubAdmin, rejectKyc);
router.put("/:id/update", verify, verifyAdminOrSubAdmin, upload.fields([
  { name: "idFront", maxCount: 1 },
  { name: "idBack", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
]), updateKyc);
router.put("/user/:userId/update", verify, verifyAdminOrSubAdmin, upload.fields([
  { name: "idFront", maxCount: 1 },
  { name: "idBack", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
]), updateKycByUserId);

export default router;


