import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import adminRoute from './routes/adminRoute.js'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoute.js'
import cartRouter from './routes/cartRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import kycRouter from './routes/kycRoute.js';
import withdrawalRouter from './routes/withdrawalRoute.js';
import dotenv from "dotenv";
import { globalErrorHandler } from './middleware/errorHandler.js';


// initialize express
const app = express()



// connect to db
dotenv.config();

try {
  await connectDB();
  await connectCloudinary();
} catch (error) {
  console.error('❌ Failed to connect to services:', error.message);
  process.exit(1);
}



// middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://13.204.152.56', 'http://13.204.152.56']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))





// route
app.get('/', (req, res) => res.send("API is working"))
app.use('/api/admin', adminRoute)
app.use('/api/courses', courseRouter)
app.use('/api/users', userRouter)
app.use('/api/cart', cartRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/withdrawals', withdrawalRouter);



// Global error handler middleware
app.use(globalErrorHandler);

// port number
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT)
})



