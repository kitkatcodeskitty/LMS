import express from 'express';
import { verify, verifyAdmin, verifyAdminOrSubAdmin } from '../auth.js';
import { addToCart, validatePurchase, getAllCarts, getCourseDetails, removeFromCart, rejectPurchase, updateCartItem, getPendingOrders } from '../controllers/cartController.js';
import upload from '../configs/multer.js';

const cartRouter = express.Router();

cartRouter.post('/add', verify,upload.single('paymentScreenshot'), addToCart);
cartRouter.put('/validate', verify, verifyAdminOrSubAdmin, validatePurchase);
cartRouter.get('/all', verify, verifyAdminOrSubAdmin, getAllCarts);
cartRouter.get('/pending', verify, verifyAdminOrSubAdmin, getPendingOrders);
cartRouter.get("/get-purchased-course-details/:id", verify, getCourseDetails);
cartRouter.delete('/remove', verify, removeFromCart);
cartRouter.delete('/reject', verify, verifyAdminOrSubAdmin, rejectPurchase);
cartRouter.put('/update', verify, verifyAdminOrSubAdmin, upload.single('paymentScreenshot'), updateCartItem);

export default cartRouter;
