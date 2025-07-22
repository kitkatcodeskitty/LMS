import mongoose from "mongoose";

// connect to mgdb 
const connecDB = async () =>{
    mongoose.connection.on('connected',()=>console.log('database connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}`)
}

export default connecDB