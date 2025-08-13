import express from "express";
import { 
  getUserData,
  register,
  login,
  makeUserAdmin,
  getUserPurchasedCourses,
  getUserById,
  updateUser,
  getAffiliateEarnings,
  getEarningsData,
  getUserReferrals,
  getLeaderboard,
  getPaymentStatements,
  updateProfile,
  getPurchaseHistory
} from "../controllers/userController.js";
import upload from '../configs/multer.js';

import { verify, verifyAdmin } from "../auth.js";



const userRouter = express.Router();

userRouter.post('/register', upload.single('image'), register);
userRouter.post('/login', login);
userRouter.get('/getUserData', verify, getUserData);
userRouter.put('/update/:id', verify, verifyAdmin, updateUser);
userRouter.get("/user-purchase", verify, getUserPurchasedCourses);
userRouter.get('/affiliate/earnings', verify, getAffiliateEarnings);

// Profile page endpoints
userRouter.get('/earnings', verify, getEarningsData);
userRouter.get('/referrals', verify, getUserReferrals);
userRouter.get('/leaderboard', verify, getLeaderboard);
userRouter.get('/payment-statements', verify, getPaymentStatements);
userRouter.get('/purchase-history', verify, getPurchaseHistory);
userRouter.put('/update-profile', verify, updateProfile);

userRouter.get('/:userId', verify, verifyAdmin, getUserById);
userRouter.patch('/makeUserAdmin', verify, verifyAdmin, makeUserAdmin);

export default userRouter;
