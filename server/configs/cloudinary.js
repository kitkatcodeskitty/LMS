import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const connectCloudinary = async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

export const uploadToCloudinary = async (filePath, folder = 'general', options = {}) => {
    try {
        // Preserve original image quality - no transformations
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            // Performance settings only - no quality reduction
            eager_async: true,                                  // Process asynchronously for speed
            eager_notification_url: null,                       // No webhook for faster processing
            // Upload optimization
            chunk_size: 6000000,                               // 6MB chunks for better upload
            ...options
        };
        
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        
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

// Optimized upload specifically for popups - preserving original quality
export const uploadPopupImage = async (filePath) => {
    return uploadToCloudinary(filePath, 'popups', {
        // No transformations - keep original image quality and size
        // Only performance optimizations
        eager_async: true,
        chunk_size: 6000000
    });
};

export default connectCloudinary;
