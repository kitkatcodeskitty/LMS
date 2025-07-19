import mongoose, { mongo, MongooseError } from "mongoose";

// connect to the mongoDB database

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Database connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/App`)
}

export default connectDB