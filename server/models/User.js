import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    isAdmin: { type: Boolean, default: false },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    affiliateCode: { type: String, unique: true, sparse: true }, 
    referredBy: { type: String, default: null },
    affiliateEarnings: { type: Number, default: 0 },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    kycStatus: { type: String, enum: ["unsubmitted", "pending", "verified", "rejected"], default: "unsubmitted" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
