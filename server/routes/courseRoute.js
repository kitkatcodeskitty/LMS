import express from 'express';
import { getAllCourses, getCourseById } from '../controllers/courseController.js';
import { verify, verifyAdmin } from '../auth.js';

const courseRouter = express.Router();

courseRouter.get('/all', getAllCourses);
courseRouter.get('/:id', getCourseById);
courseRouter.delete("/delete-course/:courseId", verify, verifyAdmin, deleteCourse);
courseRouter.put("/update-course/:courseId", verify, verifyAdmin, updateCourse);

export default courseRouter;

