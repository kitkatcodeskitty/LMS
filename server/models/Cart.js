import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      firstName: String,
      lastName: String,
      email: String,
    },
    courses: [
      {
        course: {
          _id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
          courseTitle: String,
          courseDescription: String,
          coursePrice: Number,
          courseThumbnail: String,
          packageType: { type: String, enum: ['elite', 'creator', 'prime', 'master'] },
        },
        isValidated: { type: Boolean, default: false, required: true },
        referralCode: { type: String, default: null },
        transactionId: { type: String, required: true }, 
        paymentScreenshot: { type: String, required: true }, 
        addedAt: { type: Date, default: Date.now, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Add index for better performance
cartSchema.index({ "user._id": 1 });
cartSchema.index({ "courses.isValidated": 1 });

export default mongoose.model("Cart", cartSchema);
