import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    grandfatherName: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    documentType: { type: String, required: true, enum: ['citizenship', 'passport', 'driving_license', 'voter_id', 'national_id'] },
    documentNumber: { type: String, required: true },
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


