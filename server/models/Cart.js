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
        },
        isValidated: { type: Boolean, default: false },
        referralCode: { type: String, default: null },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
