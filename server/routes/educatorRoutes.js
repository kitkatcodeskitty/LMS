import express from 'express';
import upload from '../configs/multer.js';
import {
  addCourse,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  educatorDashboardData
} from '../controllers/educatorController.js';
import { protectEducator } from '../middlewares/auth.js';

const educatorRouter = express.Router();

educatorRouter.get('/update-role', updateRoleToEducator);
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse);
educatorRouter.get('/courses', protectEducator, getEducatorCourses);
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData);

export default educatorRouter;
