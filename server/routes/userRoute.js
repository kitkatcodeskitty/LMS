import express from "express";
import { 
  getUserData,
  register,
  login,
  makeUserAdmin,
  getPurchasedCourses
} from "../controllers/userController.js";

import { verify, verifyAdmin } from "../auth.js";



const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/getUserData', verify, getUserData);
userRouter.get('/purchased-courses', verify, getPurchasedCourses);
userRouter.patch('/makeUserAdmin', verify, verifyAdmin, makeUserAdmin);

export default userRouter;
