import Course from "../models/Course.js";


// Get all published courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({})
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator' });
            console.log(courses);

        res.json({ success: true, courses });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get course by ID
export const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' });

        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = '';
                }
            });
        });

        res.json({ success: true, courseData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};




