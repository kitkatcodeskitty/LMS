import mongoose from "mongoose";

// connect to mgdb 
const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        // Connected to MongoDB
    })

    await mongoose.connect(`${process.env.MONGODB_URI}`);
};

export default connectDB;
