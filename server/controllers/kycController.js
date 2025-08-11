import Kyc from "../models/Kyc.js";
import User from "../models/User.js";
import cloudinary from "cloudinary";
import { createNotification } from "./notificationController.js";

export const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      dob,
      addressLine1,
      phoneNumber,
      city,
      state,
      postalCode,
      country,
      idType,
      idNumber,
    } = req.body;

    const files = req.files || {};

    const uploadIfPresent = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return undefined;
      const uploaded = await cloudinary.uploader.upload(fileArray[0].path);
      return uploaded.secure_url;
    };

    const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
      uploadIfPresent(files.idFront),
      uploadIfPresent(files.idBack),
      uploadIfPresent(files.selfie),
    ]);

    const update = {
      fullName,
      dob,
      addressLine1,
      phoneNumber,
      city,
      state,
      postalCode,
      country,
      idType,
      idNumber,
      submittedAt: new Date(),
      verifiedAt: null,
      status: "pending",
    };

    if (idFrontUrl) update.idFrontUrl = idFrontUrl;
    if (idBackUrl) update.idBackUrl = idBackUrl;
    if (selfieUrl) update.selfieUrl = selfieUrl;

    const kyc = await Kyc.findOneAndUpdate(
      { user: userId },
      { $set: update, $setOnInsert: { user: userId } },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    // Notify user of submission
    await createNotification(
      userId,
      "KYC submitted",
      "Your KYC has been submitted and is pending review.",
      "info",
      null,
      "kyc_submitted"
    );

    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const kyc = await Kyc.findOne({ user: userId });
    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listKyc = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const kycs = await Kyc.find(filter)
      .populate("user", "firstName lastName email imageUrl")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, kycs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const kyc = await Kyc.findByIdAndUpdate(
      id,
      { status: "verified", remarks: remarks || "", verifiedAt: new Date() },
      { new: true }
    );
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });
    await User.findByIdAndUpdate(kyc.user, { kycStatus: "verified" });

    // Notify user of verification
    await createNotification(
      kyc.user,
      "KYC verified",
      "Your KYC has been approved.",
      "success",
      null,
      "kyc_verified"
    );
    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const kyc = await Kyc.findByIdAndUpdate(
      id,
      { status: "rejected", remarks: remarks || "" },
      { new: true }
    );
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });
    await User.findByIdAndUpdate(kyc.user, { kycStatus: "rejected" });

    // Notify user of rejection
    await createNotification(
      kyc.user,
      "KYC rejected",
      remarks || "Your KYC has been rejected. Please review remarks and resubmit.",
      "error",
      null,
      "kyc_rejected"
    );
    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


