import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const connectCloudinary = async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

export const uploadToCloudinary = async (filePath, folder = 'general') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
        });
        
        // Clean up the uploaded file from local storage
        fs.unlinkSync(filePath);
        
        return result;
    } catch (error) {
        // Clean up the uploaded file from local storage on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

export default connectCloudinary;
