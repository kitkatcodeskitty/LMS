import Kyc from "../models/Kyc.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

export const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      fatherName,
      grandfatherName,
      age,
      phoneNumber,
      address,
      documentType,
      documentNumber,
    } = req.body;

    const files = req.files || {};

    const uploadIfPresent = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return undefined;
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "kyc_documents" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileArray[0].buffer);
      });
      return uploaded.secure_url;
    };

    const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
      uploadIfPresent(files.idFront),
      uploadIfPresent(files.idBack),
      uploadIfPresent(files.selfie),
    ]);

    const update = {
      name,
      fatherName,
      grandfatherName,
      age: parseInt(age, 10),
      phoneNumber,
      address,
      documentType,
      documentNumber,
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

    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get KYC by user ID (for admin use and referral display)
export const getKycByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    
    // Check if the requesting user is an admin or if they're requesting their own KYC
    const isAdmin = req.user.role === 'admin' || req.user.role === 'sub-admin';
    const isOwnKyc = requestingUserId === userId;
    
    const kyc = await Kyc.findOne({ user: userId });
    
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found for this user" });
    }
    
    // If it's not an admin and not their own KYC, only return basic info for referral display
    if (!isAdmin && !isOwnKyc) {
      const basicKycInfo = {
        _id: kyc._id,
        user: kyc.user,
        name: kyc.name,
        age: kyc.age,
        phoneNumber: kyc.phoneNumber,
        status: kyc.status,
        submittedAt: kyc.submittedAt,
        verifiedAt: kyc.verifiedAt
      };
      return res.status(200).json({ success: true, kyc: basicKycInfo });
    }
    
    // Return full KYC data for admins or own KYC
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
      name,
      fatherName,
      grandfatherName,
      age,
      phoneNumber,
      address,
      documentType,
      documentNumber,
      status,
      remarks
    } = req.body;

    const files = req.files || {};

    const uploadIfPresent = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return undefined;
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "kyc_documents" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileArray[0].buffer);
      });
      return uploaded.secure_url;
    };

    // Upload new files if provided
    const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
      uploadIfPresent(files.idFront),
      uploadIfPresent(files.idBack),
      uploadIfPresent(files.selfie),
    ]);

    const updateData = {
      name,
      fatherName,
      grandfatherName,
      age: age ? parseInt(age, 10) : undefined,
      phoneNumber,
      address,
      documentType,
      documentNumber,
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


    res.status(200).json({ success: true, kyc });
  } catch (error) {
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
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "kyc_documents" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileArray[0].buffer);
      });
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


    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};