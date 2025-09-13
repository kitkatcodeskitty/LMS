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
    console.log('=== UPDATE COURSE REQUEST START ===');
    const { courseId } = req.params;
    const body = req.body;
    const chapterBanners = req.files?.chapterBanners || [];

    console.log('Course ID:', courseId);
    console.log('Request body keys:', Object.keys(body));
    console.log('Files received:', req.files);
    console.log('Chapter banners count:', chapterBanners.length);

    // Parse courseData JSON string from body
    let parsedCourseData;
    if (typeof body.courseData === 'string') {
      console.log('Parsing courseData from string...');
      parsedCourseData = JSON.parse(body.courseData);
    } else {
      console.log('Using courseData directly...');
      parsedCourseData = body.courseData || body;
    }

    console.log('Parsed course data keys:', Object.keys(parsedCourseData));
    console.log('Course title:', parsedCourseData.courseTitle);
    console.log('Course content chapters:', parsedCourseData.courseContent?.length || 0);

    // Find the course first
    console.log('Looking for course with ID:', courseId);
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found with ID:', courseId);
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    console.log('Course found:', course.courseTitle);

    // Ensure isPublished is set (maintain existing value if not provided)
    if (parsedCourseData.isPublished === undefined) {
      parsedCourseData.isPublished = course.isPublished || false;
    }

    // Convert YouTube URLs to embed format for all lectures
    if (parsedCourseData.courseContent && Array.isArray(parsedCourseData.courseContent)) {
      console.log('Processing course content with', parsedCourseData.courseContent.length, 'chapters');
      console.log('Full courseContent received:', JSON.stringify(parsedCourseData.courseContent, null, 2));
      
      parsedCourseData.courseContent.forEach((chapter, chapterIndex) => {
        console.log(`Chapter ${chapterIndex + 1}: ${chapter.chapterTitle} (${chapter.chapterContent?.length || 0} lectures)`);
        console.log(`  Chapter ID: ${chapter.chapterId}`);
        console.log(`  Chapter Order: ${chapter.chapterOrder}`);
        console.log(`  Chapter Banner: ${chapter.chapterBanner ? 'Has banner' : 'No banner'}`);
        
        if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach((lecture, lectureIndex) => {
            console.log(`    Lecture ${lectureIndex + 1}: ${lecture.lectureTitle} (ID: ${lecture.lectureId})`);
            console.log(`      Lecture Order: ${lecture.lectureOrder}`);
            console.log(`      Lecture Duration: ${lecture.lectureDuration}`);
            console.log(`      Lecture URL: ${lecture.lectureUrl}`);
            console.log(`      Is Preview Free: ${lecture.isPreviewFree}`);
            
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
    } else {
      console.log('No courseContent found or not an array:', parsedCourseData.courseContent);
    }

    if (req.files?.image?.[0]) {
      console.log('Uploading course thumbnail...');
      const imageUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "course_thumbnails",
            quality: "auto",
            fetch_format: "auto",
            flags: "preserve_transparency"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.files.image[0].buffer);
      });
      parsedCourseData.courseThumbnail = imageUpload.secure_url;
      console.log('Course thumbnail uploaded successfully');
    }

    // Handle chapter banners if provided
    if (chapterBanners.length > 0) {
      console.log(`Uploading ${chapterBanners.length} chapter banners...`);
      let bannerIndex = 0;
      
      // Process each chapter for banners
      for (let chapterIndex = 0; chapterIndex < parsedCourseData.courseContent.length; chapterIndex++) {
        const chapter = parsedCourseData.courseContent[chapterIndex];
        
        // Check if this chapter should have a banner (must be a string URL, not an object)
        if (chapter.chapterBanner && typeof chapter.chapterBanner === 'string' && chapter.chapterBanner.trim() !== '' && bannerIndex < chapterBanners.length) {
          const bannerFile = chapterBanners[bannerIndex];
          
          try {
            console.log(`Uploading chapter banner ${bannerIndex + 1}/${chapterBanners.length}...`);
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
            console.log(`Chapter banner ${bannerIndex} uploaded successfully`);
          } catch (uploadError) {
            console.error('Error uploading chapter banner:', uploadError);
            // Continue with other banners even if one fails
          }
        }
      }
      console.log('All chapter banners processed');
    }

    console.log('Updating course with data:', Object.keys(parsedCourseData));
    console.log('Course content chapters:', parsedCourseData.courseContent?.length || 0);
    
    // Clean up chapterBanner fields - remove any non-string values
    if (parsedCourseData.courseContent && Array.isArray(parsedCourseData.courseContent)) {
      parsedCourseData.courseContent.forEach(chapter => {
        if (chapter.chapterBanner && typeof chapter.chapterBanner !== 'string') {
          console.log(`Removing invalid chapterBanner for chapter ${chapter.chapterTitle}:`, chapter.chapterBanner);
          delete chapter.chapterBanner;
        }
      });
    }
    
    // Validate required fields before updating
    const requiredFields = ['courseTitle', 'packageType', 'coursePrice', 'discount', 'discountType', 'isPublished'];
    const missingFields = requiredFields.filter(field => !parsedCourseData.hasOwnProperty(field) || parsedCourseData[field] === undefined);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Validate packageType enum
    const validPackageTypes = ['elite', 'creator', 'prime', 'master'];
    if (!validPackageTypes.includes(parsedCourseData.packageType)) {
      console.error('Invalid packageType:', parsedCourseData.packageType);
      return res.status(400).json({ 
        success: false, 
        message: `Invalid packageType. Must be one of: ${validPackageTypes.join(', ')}` 
      });
    }
    
    Object.keys(parsedCourseData).forEach((key) => {
      course[key] = parsedCourseData[key];
    });

    console.log('Saving course to database...');
    console.log('Course data before save:', {
      courseTitle: course.courseTitle,
      packageType: course.packageType,
      courseLimit: course.courseLimit,
      isPublished: course.isPublished,
      courseContent: course.courseContent?.length || 0
    });
    
    try {
      await course.save();
      console.log('Course saved successfully');
      
      // Log the saved course data to verify it was updated correctly
      const savedCourse = await Course.findById(courseId);
      console.log('Saved course verification:');
      console.log('  Course title:', savedCourse.courseTitle);
      console.log('  Course content chapters:', savedCourse.courseContent?.length || 0);
      savedCourse.courseContent?.forEach((chapter, index) => {
        console.log(`  Chapter ${index + 1}: ${chapter.chapterTitle} (${chapter.chapterContent?.length || 0} lectures)`);
        chapter.chapterContent?.forEach((lecture, lectureIndex) => {
          console.log(`    Lecture ${lectureIndex + 1}: ${lecture.lectureTitle}`);
        });
      });
    } catch (saveError) {
      console.error('Error saving course:', saveError);
      if (saveError.name === 'ValidationError') {
        console.error('Validation errors:', saveError.errors);
        return res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: saveError.errors 
        });
      }
      throw saveError;
    }

    // Clean up uploaded files
    try {
      if (req.files?.image?.[0] && req.files.image[0].path) {
        fs.unlinkSync(req.files.image[0].path);
        console.log('Course thumbnail file cleaned up');
      }
      
      if (chapterBanners && chapterBanners.length > 0) {
        chapterBanners.forEach(file => {
          if (file.path) {
            fs.unlinkSync(file.path);
          }
        });
        console.log('Chapter banner files cleaned up');
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    // Return the fresh course data from database
    const finalCourse = await Course.findById(courseId);
    console.log('Returning updated course with', finalCourse.courseContent?.length || 0, 'chapters');
    
    res.status(200).json({ 
      success: true, 
      data: finalCourse, 
      message: 'Course updated successfully',
      courseId: finalCourse._id,
      courseTitle: finalCourse.courseTitle
    });
  } catch (err) {
    // Clean up files on error
    try {
      if (req.files?.image?.[0] && req.files.image[0].path) {
        fs.unlinkSync(req.files.image[0].path);
      }
      
      if (chapterBanners && chapterBanners.length > 0) {
        chapterBanners.forEach(file => {
          if (file.path) {
            fs.unlinkSync(file.path);
          }
        });
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files after error:', cleanupError);
    }
    
    console.error('Error updating course:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};