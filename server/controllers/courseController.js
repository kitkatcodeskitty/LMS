import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { errorHandler } from "../auth.js";

// Function to convert YouTube URLs to embed format
const convertYouTubeToEmbed = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Regular YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // Already embed format
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Return original URL if not YouTube
  return url;
};

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

// get all courses for admin (includes courseContent)
export const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .select("-enrolledStudents"); // Only exclude enrolledStudents, keep courseContent

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
    const chapterBanners = req.files?.chapterBanners || [];

    // Parse courseData JSON string from body
    let parsedCourseData;
    if (typeof body.courseData === 'string') {
      parsedCourseData = JSON.parse(body.courseData);
    } else {
      parsedCourseData = body.courseData || body;
    }

    // Convert YouTube URLs to embed format for all lectures
    if (parsedCourseData.courseContent && Array.isArray(parsedCourseData.courseContent)) {
      console.log('Processing course content with', parsedCourseData.courseContent.length, 'chapters');
      parsedCourseData.courseContent.forEach((chapter, chapterIndex) => {
        console.log(`Chapter ${chapterIndex + 1}: ${chapter.chapterTitle} (${chapter.chapterContent?.length || 0} lectures)`);
        if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach((lecture, lectureIndex) => {
            console.log(`  Lecture ${lectureIndex + 1}: ${lecture.lectureTitle}`);
            if (lecture.lectureUrl) {
              const originalUrl = lecture.lectureUrl;
              lecture.lectureUrl = convertYouTubeToEmbed(lecture.lectureUrl);
              if (originalUrl !== lecture.lectureUrl) {
                console.log(`Converted YouTube URL: ${originalUrl} -> ${lecture.lectureUrl}`);
              }
            }
          });
        }
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.files?.image?.[0]) {
      const imageUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "course_thumbnails" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.files.image[0].buffer);
      });
      parsedCourseData.courseThumbnail = imageUpload.secure_url;
    }

    // Handle chapter banners if provided
    if (chapterBanners.length > 0) {
      let bannerIndex = 0;
      
      // Process each chapter for banners
      for (let chapterIndex = 0; chapterIndex < parsedCourseData.courseContent.length; chapterIndex++) {
        const chapter = parsedCourseData.courseContent[chapterIndex];
        
        // Check if this chapter should have a banner
        if (chapter.chapterBanner && bannerIndex < chapterBanners.length) {
          const bannerFile = chapterBanners[bannerIndex];
          
          try {
            const bannerUpload = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  folder: "chapter_banners",
                  quality: "auto",
                  fetch_format: "auto",
                  flags: "preserve_transparency"
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(bannerFile.buffer);
            });
            
            // Update the chapter with the uploaded banner URL
            parsedCourseData.courseContent[chapterIndex].chapterBanner = bannerUpload.secure_url;
            
            bannerIndex++;
          } catch (uploadError) {
            console.error('Error uploading chapter banner:', uploadError);
            // Continue with other banners even if one fails
          }
        }
      }
    }

    console.log('Updating course with data:', Object.keys(parsedCourseData));
    console.log('Course content chapters:', parsedCourseData.courseContent?.length || 0);
    
    Object.keys(parsedCourseData).forEach((key) => {
      course[key] = parsedCourseData[key];
    });

    await course.save();
    console.log('Course saved successfully');

    // No file cleanup needed since we're using memory storage

    res.status(200).json({ success: true, data: course, message: 'Course updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};