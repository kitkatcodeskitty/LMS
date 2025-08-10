import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import adminRoute from './routes/adminRoute.js'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoute.js'
import cartRouter from './routes/cartRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import dotenv from "dotenv";


// initialize express
const app = express()


// connect to db
dotenv.config();
await connectDB()
await connectCloudinary()

// middlewares
app.use(cors())
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
dotenv.config({ quiet: true });


// route
app.get('/', (req,res)=> res.send("api working"))
app.use('/api/admin',adminRoute)
app.use('/api/course',courseRouter)
app.use('/api/user',userRouter)
app.use('/api/cart', cartRouter);
app.use('/api/notifications', notificationRouter);


// port number
const PORT = process.env.PORT || 5000 

app.listen(PORT,()=>{
    console.log(`server is runing on ${PORT}`)
})



