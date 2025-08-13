import express from "express";
import { verify, verifyAdmin } from "../auth.js";
import upload from "../configs/multer.js";
import { submitKyc, getMyKyc, listKyc, verifyKyc, rejectKyc, getKycByUserId } from "../controllers/kycController.js";

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
router.get("/user/:userId", verify, verifyAdmin, getKycByUserId);
router.get("/", verify, verifyAdmin, listKyc);
router.patch("/:id/verify", verify, verifyAdmin, verifyKyc);
router.patch("/:id/reject", verify, verifyAdmin, rejectKyc);

export default router;


