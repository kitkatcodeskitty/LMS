import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from '../models/Purchase.js';

export const updateRoleToEducator = async (req,res) => {
    try {
        const { userId } = req.auth();


        await clerkClient.users.updateUserMetadata(userId,{
            publicMetadata: {
                role: 'educator',
            }
        })

        res.json({success:true, message: "You can publish a course now"})
    } catch (error) {
        res.json({success:false, message: error.message}) 
    }
}

// Add new course
export const addCourse = async (req, res) => {
    try {
        const { file: imageFile, body, auth } = req;

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not Attached' });
        }

        let parsedCourseData;
        if (typeof body.coursedata === 'string') {
            parsedCourseData = JSON.parse(body.coursedata);
        } else {
            parsedCourseData = body.coursedata || body; // fallback
        }

        parsedCourseData.educator = auth.userId;

        // Set required fields if they aren't present by default
        if (parsedCourseData.isPublished === undefined) {
            parsedCourseData.isPublished = false;
        }

        const newCourse = await Course.create(parsedCourseData);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({ success: true, message: 'Course Added' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



export const getEducatorCourses = async ( req,res) => {
    try{
        const educator = req.auth.userId

        const courses = await Course.find({educator})

        res.json({success: true, courses})
    }catch (error){

        res.json({success: false, message: error.message})
    }
}


// dashboard data { total earning , rnrolled student s not of course }


const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses by this educator
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        // Get all course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch completed purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect enrolled students for each course
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
