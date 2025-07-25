import express from "express";
import { 
  getUserData,
  userEnrolledCourses,
  updateUserCourseProgress,
  getUserCourseProgress,
  addUserRating
} from "../controllers/userController.js";
import { requireAuth } from '@clerk/express';

const userRouter = express.Router();

userRouter.get('/data', getUserData);
userRouter.get("/enrolled-courses", requireAuth(), userEnrolledCourses);
userRouter.post('/update-course-progress', updateUserCourseProgress);
userRouter.post('/get-course-progress', getUserCourseProgress);
userRouter.post('/add-rating', addUserRating);

export default userRouter;
