import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureId: { type: String, required: true },
  lectureTitle: { type: String, required: true },
  lectureDuration: { type: Number, required: true },
  lectureUrl: { type: String, required: true },
  isPreviewFree: { type: Boolean, required: true },
  lectureOrder: { type: Number, required: true },
  lectureThumbnail: { type: String }, // Optional thumbnail URL
}, { _id: false });

const chapterSchema = new mongoose.Schema({
  chapterId: { type: String, required: true },
  chapterOrder: { type: Number, required: true },
  chapterTitle: { type: String, required: true },
  chapterContent: [lectureSchema]
}, { _id: false });

const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true },
    packageType: {
      type: String,
      required: true,
      enum: ['elite', 'creator', 'prime', 'master']
    },
    courseLimit: {
      type: Number,
      required: true,
      default: function() {
        // Set default course limit based on package type
        switch(this.packageType) {
          case 'elite': return 1;
          case 'creator': return 3;
          case 'prime': return 4;
          case 'master': return 6;
          default: return 1;
        }
      }
    },
    isPublished: { type: Boolean, required: true },
    discount: { type: Number, required: true, min: 0 },
    discountType: { type: String, required: true, enum: ['percentage', 'amount'], default: 'percentage' },
    courseContent: [chapterSchema],

    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("Course", courseSchema);
