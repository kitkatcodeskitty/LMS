import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Popup from '../models/Popup.js';

dotenv.config();

const createTestPopup = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test popup
    const testPopup = new Popup({
      title: "TODAY'S SCHEDULE",
      imageUrl: 'https://via.placeholder.com/400x300/0066cc/ffffff?text=KNOWLEDGE+HUB+NEPAL', // Dummy image
      isActive: true,
      displayDuration: 4000, // 4 seconds
      startDate: new Date(),
      priority: 1,
      createdBy: '64f8b8b8b8b8b8b8b8b8b8b8' // Dummy ObjectId
    });

    // Save the popup
    await testPopup.save();
    console.log('Test popup created successfully:', testPopup);

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating test popup:', error);
    process.exit(1);
  }
};

createTestPopup();
