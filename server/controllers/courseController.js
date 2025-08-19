import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { v2 as cloudinary } from 'cloudinary';

import { errorHandler } from "../auth.js";


// get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .select("-courseContent -enrolledStudents");

    res.json({
      success: true,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      errorCode: "SERVER_ERROR",
    });
  }
};




// get course details
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)   
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .populate("enrolledStudents", "firstName lastName");

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};




// course delete garni controller 
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Optional cleanup: remove this course from all users' enrolledCourses and carts
    await User.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    );

    await Cart.updateMany(
      {},
      { $pull: { courses: { "course._id": courseId } } }
    );

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// get existing package types
export const getExistingPackageTypes = async (req, res) => {
  try {
    const existingPackageTypes = await Course.distinct('packageType');
    
    res.json({
      success: true,
      existingPackageTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      errorCode: "SERVER_ERROR",
    });
  }
};

// update controller 
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const body = req.body;

    // Parse courseData JSON string from body
    let parsedCourseData;
    if (typeof body.courseData === 'string') {
      parsedCourseData = JSON.parse(body.courseData);
    } else {
      parsedCourseData = body.courseData || body;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path);
      parsedCourseData.courseThumbnail = imageUpload.secure_url;
    }

    Object.keys(parsedCourseData).forEach((key) => {
      course[key] = parsedCourseData[key];
    });

    await course.save();

    res.status(200).json({ success: true, data: course, message: 'Course updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};