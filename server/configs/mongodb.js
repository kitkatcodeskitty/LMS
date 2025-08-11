import mongoose from "mongoose";

// connect to mgdb 
const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("database is connected")
    })

    await mongoose.connect(`${process.env.MONGODB_URI}`);
};

export default connectDB;
