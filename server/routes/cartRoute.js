import express from 'express';
import { verify,verifyAdmin } from '../auth.js';
import { addToCart,validatePurchase } from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/add', verify, addToCart);
cartRouter.put("/validate", verify, verifyAdmin, validatePurchase);



export default cartRouter;
