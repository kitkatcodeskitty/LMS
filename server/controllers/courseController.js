import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";

import { errorHandler } from "../auth.js";


// get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .select("-courseContent -enrolledStudents");

    res.json(courses);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        errorCode: "SERVER_ERROR",
        details: null,
      },
    });
  }
};



// get course details
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)   
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .populate("enrolledStudents", "firstName lastName");

    if (!course) return res.status(404).json({ error: "Course not found" });

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: { message: error.message }});
  }
};




// // course delete garni controller 
// export const deleteCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const course = await Course.findByIdAndDelete(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Optional cleanup: remove this course from all users' enrolledCourses and carts
//     await User.updateMany(
//       { enrolledCourses: courseId },
//       { $pull: { enrolledCourses: courseId } }
//     );

//     await Cart.updateMany(
//       {},
//       { $pull: { courses: { "course._id": courseId } } }
//     );

//     res.status(200).json({ success: true, message: "Course deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// // update controller 
// export const updateCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const updates = req.body;

//     const course = await Course.findByIdAndUpdate(courseId, updates, { new: true });

//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     res.status(200).json({ success: true, data: course, message: "Course updated successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };