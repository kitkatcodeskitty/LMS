import express from 'express';
import { verify, verifyAdmin } from '../auth.js';
import { addToCart, validatePurchase, getAllCarts, getCourseDetails } from '../controllers/cartController.js';


const cartRouter = express.Router();

cartRouter.post('/add', verify, addToCart);
cartRouter.put('/validate', verify, verifyAdmin, validatePurchase);
cartRouter.get('/all', verify, verifyAdmin, getAllCarts);
cartRouter.get("/get-purchased-course-details/:id", verify, getCourseDetails);

export default cartRouter;
