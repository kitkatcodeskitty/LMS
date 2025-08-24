import Kyc from "../models/Kyc.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
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

// Get KYC by user ID (for admin use)
export const getKycByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const kyc = await Kyc.findOne({ user: userId });
    
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found for this user" });
    }
    
    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update KYC by admin/sub-admin
export const updateKyc = async (req, res) => {
  try {
    const { id } = req.params;

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
      documentIssuingAuthority,
      status,
      remarks
    } = req.body;

    const files = req.files || {};

    const uploadIfPresent = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return undefined;
      const uploaded = await cloudinary.uploader.upload(fileArray[0].path);
      return uploaded.secure_url;
    };

    // Upload new files if provided
    const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
      uploadIfPresent(files.idFront),
      uploadIfPresent(files.idBack),
      uploadIfPresent(files.selfie),
    ]);

    const updateData = {
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
      documentIssuingAuthority,
      status,
      remarks,
      updatedAt: new Date()
    };

    // Only update file URLs if new files were uploaded
    if (idFrontUrl) updateData.idFrontUrl = idFrontUrl;
    if (idBackUrl) updateData.idBackUrl = idBackUrl;
    if (selfieUrl) updateData.selfieUrl = selfieUrl;

    // Set verification date if status is being changed to verified
    if (status === 'verified') {
      updateData.verifiedAt = new Date();
    }

    const kyc = await Kyc.findByIdAndUpdate(id, updateData, { new: true })
      .populate("user", "firstName lastName email imageUrl");

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // Update user's KYC status
    if (status) {
      await User.findByIdAndUpdate(kyc.user._id, { kycStatus: status });
    }

    // Send notification based on status change
    try {
      if (status === 'verified') {
        await createNotification(
          kyc.user._id,
          "KYC Updated & Verified",
          "Your KYC information has been updated and verified by admin.",
          "success",
          null,
          "kyc_updated_verified"
        );
      } else if (status === 'rejected') {
        await createNotification(
          kyc.user._id,
          "KYC Updated & Rejected",
          remarks || "Your KYC information has been updated but rejected. Please review remarks.",
          "error",
          null,
          "kyc_updated_rejected"
        );
      } else {
        await createNotification(
          kyc.user._id,
          "KYC Information Updated",
          "Your KYC information has been updated by admin.",
          "info",
          null,
          "kyc_updated"
        );
      }
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError);
      // Don't fail the entire update if notification fails
    }

    res.status(200).json({ success: true, kyc });
  } catch (error) {
    console.error('KYC Update Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update KYC by user ID (for admin use in student management)
export const updateKycByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const files = req.files || {};

    const uploadIfPresent = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return undefined;
      const uploaded = await cloudinary.uploader.upload(fileArray[0].path);
      return uploaded.secure_url;
    };

    // Upload new files if provided
    const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
      uploadIfPresent(files.idFront),
      uploadIfPresent(files.idBack),
      uploadIfPresent(files.selfie),
    ]);

    // Only update file URLs if new files were uploaded
    if (idFrontUrl) updateData.idFrontUrl = idFrontUrl;
    if (idBackUrl) updateData.idBackUrl = idBackUrl;
    if (selfieUrl) updateData.selfieUrl = selfieUrl;

    updateData.updatedAt = new Date();

    // Set verification date if status is being changed to verified
    if (updateData.status === 'verified') {
      updateData.verifiedAt = new Date();
    }

    const kyc = await Kyc.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, upsert: true }
    ).populate("user", "firstName lastName email imageUrl");

    // Update user's KYC status
    if (updateData.status) {
      await User.findByIdAndUpdate(userId, { kycStatus: updateData.status });
    }

    // Send notification
    if (updateData.status === 'verified') {
      await createNotification(
        userId,
        "KYC Updated & Verified",
        "Your KYC information has been updated and verified by admin.",
        "success",
        null,
        "kyc_updated_verified"
      );
    } else if (updateData.status === 'rejected') {
      await createNotification(
        userId,
        "KYC Updated & Rejected",
        updateData.remarks || "Your KYC information has been updated but rejected. Please review remarks.",
        "error",
        null,
        "kyc_updated_rejected"
      );
    } else {
      await createNotification(
        userId,
        "KYC Information Updated",
        "Your KYC information has been updated by admin.",
        "info",
        null,
        "kyc_updated"
      );
    }

    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};