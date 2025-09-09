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

            eager_async: true,                      
            eager_notification_url: null,           
            
            chunk_size: 6000000,                      
            ...options
        };
        
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        

        fs.unlinkSync(filePath);
        
        return result;
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};


export const uploadPopupImage = async (filePath) => {
    return uploadToCloudinary(filePath, 'popups', {

        eager_async: true,
        chunk_size: 6000000
    });
};

export default connectCloudinary;
