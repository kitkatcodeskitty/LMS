
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js'; 


// Add new course
export const addCourse = async (req, res) => {
  try {
    const imageFile = req.file;
    const userId = req.user.id; 
    const body = req.body;

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail not Attached' });
    }

    let parsedCourseData;
    if (typeof body.courseData === 'string') {
      parsedCourseData = JSON.parse(body.courseData);
    } else {
      parsedCourseData = body.courseData || body;
    }

    parsedCourseData.admin = userId;

    if (parsedCourseData.isPublished === undefined) {
      parsedCourseData.isPublished = false;
    }

    const newCourse = await Course.create(parsedCourseData);

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: 'Course Added' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get courses updated by admin 


// Dashboard data: total earnings, total courses, enrolled students
export const adminDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
        const enrolledStudentsData = [];

        for (const course of courses) {
            const students = await User.find(
                { _id: { $in: course.enrolledStudents } },
                'name imageUrl'
            );

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                totalCourses,
                enrolledStudentsData
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get enrolled students with purchase info
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
            
        })
            .populate('userId', 'name imageUrl')
            .populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
