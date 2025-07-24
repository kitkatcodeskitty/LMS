import { CourseProgress } from "../models/CourseProgress.js";
import User from "../models/User.js";


export const getUserData = async (req,res)=> {
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId);

        if(!user){
            res.json({success: false, message: "user not found"})
        }

        res.json({success: true, user})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}


// user enrolled courses

export const userEnrolledCourses = async (req, res) => {
  try {
    console.log('req.auth:', req.auth); // Add this line
    
    const userId = req.auth.userId; 
    
    const userData = await User.findById(userId).populate('enrolledCourses');
    
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// update user course progress
export const updateUserCourseProgress = async(req,res)=> {
    try {
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success: true, message: 'lecture Already Completed'})
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({success: true, message: 'Progress Update'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// get UserCourse Progress
export const getUserCourseProgress = async(req,res)=> {
    try{
        const userId = req.auth.userId
        const {courseId} = req.body
        const progressData = await CourseProgress.findOne({userId,courseId})
        res.json({success: true, progressData})
    } catch (error){
            res.json({success: false,message: error.message})
    }
}


// Add user rating to course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }

        await course.save();
        return res.json({ success: true, message: 'Rating added' });

    } catch (error) {
        return res.json({ success: false, message: 'Something went wrong.' });
    }
};
