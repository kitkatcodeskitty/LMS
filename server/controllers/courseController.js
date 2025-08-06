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




