import express from 'express';
import { verify, verifyAdmin } from '../auth.js';
import { addToCart, validatePurchase, getAllCarts, getCourseDetails, removeFromCart, rejectPurchase, updateCartItem, getPendingOrders } from '../controllers/cartController.js';
import upload from '../configs/multer.js';

const cartRouter = express.Router();

cartRouter.post('/add', verify,upload.single('paymentScreenshot'), addToCart);
cartRouter.put('/validate', verify, verifyAdmin, validatePurchase);
cartRouter.get('/all', verify, verifyAdmin, getAllCarts);
cartRouter.get('/pending', verify, verifyAdmin, getPendingOrders);
cartRouter.get("/get-purchased-course-details/:id", verify, getCourseDetails);
cartRouter.delete('/remove', verify, removeFromCart);
cartRouter.delete('/reject', verify, verifyAdmin, rejectPurchase);
cartRouter.put('/update', verify, verifyAdmin, upload.single('paymentScreenshot'), updateCartItem);

export default cartRouter;
