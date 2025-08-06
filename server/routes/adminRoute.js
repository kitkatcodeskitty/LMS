import express from 'express';
import upload from '../configs/multer.js';
import {
  addCourse,

  getEnrolledStudentsData,
  adminDashboardData
} from '../controllers/adminController.js';

import { verify, verifyAdmin } from "../auth.js";


const educatorRouter = express.Router();


educatorRouter.post('/add-course', verify, verifyAdmin, upload.single('image'), addCourse);
educatorRouter.get('/dashboard', verify, verifyAdmin, adminDashboardData);
educatorRouter.get('/enrolled-students', verify, verifyAdmin, getEnrolledStudentsData);

export default educatorRouter;
