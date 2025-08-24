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


// initialize express
const app = express()

console.log('🚀 Starting LMS Server...');
console.log('📦 Loading environment variables...');

// connect to db
dotenv.config();

try {
  console.log('🔗 Connecting to MongoDB...');
  await connectDB();
  console.log('✅ MongoDB connected successfully');
  
  console.log('☁️  Connecting to Cloudinary...');
  await connectCloudinary();
  console.log('✅ Cloudinary connected successfully');
} catch (error) {
  console.error('❌ Failed to connect to services:', error.message);
  process.exit(1);
}

console.log('⚙️  Setting up middlewares...');

// middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://13.204.152.56', 'http://13.204.152.56']
    : true,
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

console.log('✅ Middlewares configured successfully');

console.log('🛣️  Loading API routes...');

// route
app.get('/', (req, res) => res.send("API is working"))
app.use('/api/admin', adminRoute)
app.use('/api/courses', courseRouter)
app.use('/api/users', userRouter)
app.use('/api/cart', cartRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/withdrawals', withdrawalRouter);

console.log('✅ All API routes loaded successfully');

// port number
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`🚀 Server running on port ${PORT} in production mode`);
    console.log(`🌐 Frontend IP: 13.204.152.56`);
    console.log(`🔧 Backend IP: 13.202.217.159`);
  } else {
    console.log(`🚀 Server is running on port ${PORT} in development mode`);
    console.log(`📱 API is working at http://localhost:${PORT}`);
  }
  console.log(`✅ All routes loaded successfully`);
  console.log(`🔗 MongoDB connected`);
  console.log(`☁️  Cloudinary connected`);
})



