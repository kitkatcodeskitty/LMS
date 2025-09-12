import express from 'express';
import { getAllCourses, getAllCoursesForAdmin, getCourseById , deleteCourse , updateCourse, getExistingPackageTypes } from '../controllers/courseController.js';
import { verify, verifyAdmin } from '../auth.js';
import upload from '../configs/multer.js';

const courseRouter = express.Router();

courseRouter.get('/all', getAllCourses);
courseRouter.get('/admin/all', verify, verifyAdmin, getAllCoursesForAdmin);
courseRouter.get('/existing-package-types', getExistingPackageTypes);
courseRouter.get('/:id', getCourseById);
courseRouter.delete("/delete-course/:courseId", verify, verifyAdmin, deleteCourse);
courseRouter.put('/update-course/:courseId', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'lectureThumbnails', maxCount: 50 }
]), updateCourse);

export default courseRouter;

