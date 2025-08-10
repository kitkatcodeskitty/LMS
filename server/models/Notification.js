import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["success", "error", "warning", "info"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    relatedAction: {
      type: String,
      enum: ["course_validated", "course_rejected", "course_enrolled", "payment_received"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
