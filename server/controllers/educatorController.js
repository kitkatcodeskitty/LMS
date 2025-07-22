import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary'

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
        const { coursedata } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!coursedata) {
            return res.json({ success: false, message: 'coursedata not provided' });
        }

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not Attached' });
        }

        const parsedCourseData = JSON.parse(coursedata);
        parsedCourseData.educator = educatorId;

        const newCourse = await Course.create(parsedCourseData);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        
        res.json({ success: true, message: 'Course Added' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

