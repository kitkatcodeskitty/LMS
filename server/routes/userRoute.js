import express from "express";
import { 
  getUserData,
  register,
  login,
  makeUserAdmin,
  getPurchasedCourses,
  getUserById,
  updateUser
} from "../controllers/userController.js";
import upload from '../configs/multer.js';

import { verify, verifyAdmin } from "../auth.js";



const userRouter = express.Router();

userRouter.post('/register', upload.single('image'), register);
userRouter.post('/login', login);
userRouter.get('/getUserData', verify, getUserData);
userRouter.put('/update/:id', verify, verifyAdmin, updateUser);
userRouter.get('/:userId', verify, verifyAdmin, getUserById);
userRouter.get('/purchased-courses', verify, getPurchasedCourses);
userRouter.patch('/makeUserAdmin', verify, verifyAdmin, makeUserAdmin);

export default userRouter;
