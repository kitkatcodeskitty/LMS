import mongoose from "mongoose";

const popupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    displayDuration: { type: Number, default: 4000 }, // in milliseconds
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priority: { type: Number, default: 1 }, // Higher number = higher priority
  },
  { timestamps: true }
);

// Index for active popups
popupSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
popupSchema.index({ priority: -1, createdAt: -1 });

export default mongoose.model("Popup", popupSchema);
