import mongoose from 'mongoose';

const connecDB = async () => {
  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connecDB;
