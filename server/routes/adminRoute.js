import express from 'express';
import upload from '../configs/multer.js';
import {
  addCourse,
  adminDashboardData,
  getAllPurchasesWithUserAndCourse,
  getAllEnrolledStudents,
  makeUserAdmin,
  setAffiliateAmount,
  getPendingWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  editWithdrawal,
  syncAllUsersEarnings,
  deleteUser,
  resetDatabase
} from '../controllers/adminController.js';

import { verify, verifyAdmin, verifyAdminOrSubAdmin } from "../auth.js";


const adminRouter = express.Router();


adminRouter.post('/add-course', verify, verifyAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'chapterBanners', maxCount: 50 }
]), addCourse);
adminRouter.get('/dashboard', verify, verifyAdminOrSubAdmin, adminDashboardData);
adminRouter.get('/purchased-users', verify, verifyAdminOrSubAdmin, getAllPurchasesWithUserAndCourse);
adminRouter.get('/enrolled-students', verify, verifyAdminOrSubAdmin, getAllEnrolledStudents);
adminRouter.post('/make-user-admin', verify, verifyAdmin, makeUserAdmin);
adminRouter.put('/purchase/affiliate-amount', verify, verifyAdmin, setAffiliateAmount);

// Withdrawal management endpoints
adminRouter.get('/withdrawals/pending', verify, verifyAdminOrSubAdmin, getPendingWithdrawals);
adminRouter.get('/withdrawals/all', verify, verifyAdminOrSubAdmin, getAllWithdrawals);
adminRouter.put('/withdrawals/:id/approve', verify, verifyAdminOrSubAdmin, approveWithdrawal);
adminRouter.put('/withdrawals/:id/reject', verify, verifyAdminOrSubAdmin, rejectWithdrawal);
adminRouter.put('/withdrawals/:id/edit', verify, verifyAdminOrSubAdmin, editWithdrawal);

// Earnings management endpoints
adminRouter.post('/sync-earnings', verify, verifyAdmin, syncAllUsersEarnings);

// User management endpoints
adminRouter.delete('/delete-user/:userId', verify, verifyAdminOrSubAdmin, deleteUser);

// Database management endpoints
adminRouter.post('/reset-database', verify, verifyAdmin, resetDatabase);

export default adminRouter;
