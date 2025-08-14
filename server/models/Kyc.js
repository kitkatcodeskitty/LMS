import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String },
    dob: { type: String },
    gender: { type: String },
    nationality: { type: String },
    occupation: { type: String },
    maritalStatus: { type: String },
    phoneNumber: { type: String },
    alternatePhone: { type: String },
    email: { type: String },
    addressLine1: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    idType: { type: String },
    idNumber: { type: String },
    documentIssueDate: { type: String },
    documentExpiryDate: { type: String },
    documentIssuingAuthority: { type: String },
    idFrontUrl: { type: String },
    idBackUrl: { type: String },
    selfieUrl: { type: String },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    remarks: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Kyc", kycSchema);


