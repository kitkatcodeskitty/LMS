import mongoose from 'mongoose';
import Course from '../models/Course.js';

/**
 * Migration: Remove lecture thumbnails and add chapter banners support
 * 
 * This migration:
 * 1. Removes any existing lectureThumbnail fields from lectures in existing courses
 * 2. Adds chapterBanner field to chapters (will be null for existing chapters)
 * 
 * This is a backward-compatible change since:
 * - lectureThumbnail removal won't break existing functionality
 * - chapterBanner is optional and defaults to null
 */

export const up = async () => {
  try {
    console.log('Starting migration: Remove lecture thumbnails and add chapter banners support...');
    
    // Get all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to process`);
    
    let updatedCourses = 0;
    
    for (const course of courses) {
      let courseUpdated = false;
      
      // Process each chapter
      if (course.courseContent && Array.isArray(course.courseContent)) {
        for (const chapter of course.courseContent) {
          // Remove lectureThumbnail from all lectures in this chapter
          if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
            for (const lecture of chapter.chapterContent) {
              if (lecture.lectureThumbnail !== undefined) {
                delete lecture.lectureThumbnail;
                courseUpdated = true;
              }
            }
          }
          
          // Ensure chapterBanner field exists (will be null if not set)
          if (chapter.chapterBanner === undefined) {
            chapter.chapterBanner = null;
            courseUpdated = true;
          }
        }
      }
      
      // Save the course if it was updated
      if (courseUpdated) {
        await course.save();
        updatedCourses++;
        console.log(`Updated course: ${course.courseTitle}`);
      }
    }
    
    console.log(`Migration completed successfully. Updated ${updatedCourses} courses.`);
    return { success: true, updatedCourses };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    console.log('Rolling back migration: Remove lecture thumbnails and add chapter banners support...');
    
    // This migration is not easily reversible since we're removing data
    // The lectureThumbnail data has been permanently removed
    console.log('Warning: This migration cannot be fully rolled back as lectureThumbnail data has been removed.');
    console.log('The chapterBanner field will remain but can be safely ignored.');
    
    return { success: true, message: 'Rollback completed (partial - lectureThumbnail data cannot be restored)' };
    
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { connectDB } = await import('../configs/mongodb.js');
  await connectDB();
  
  try {
    const result = await up();
    console.log('Migration result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
