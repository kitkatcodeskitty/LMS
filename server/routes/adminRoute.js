import express from 'express';
import upload from '../configs/multer.js';
import {
  addCourse,
  adminDashboardData,
  getAllPurchasesWithUserAndCourse,
  makeUserAdmin,
  setAffiliateAmount
} from '../controllers/adminController.js';

import { verify, verifyAdmin } from "../auth.js";


const adminRouter = express.Router();


adminRouter.post('/add-course', verify, verifyAdmin, upload.single('image'), addCourse);
adminRouter.get('/dashboard', verify, verifyAdmin, adminDashboardData);
adminRouter.get('/purchased-users', verify, verifyAdmin, getAllPurchasesWithUserAndCourse);
adminRouter.post('/make-user-admin', verify, verifyAdmin, makeUserAdmin);
adminRouter.put('/purchase/affiliate-amount', verify, verifyAdmin, setAffiliateAmount);


export default adminRouter;
