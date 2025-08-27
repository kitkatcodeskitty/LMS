import Popup from '../models/Popup.js';
import { uploadPopupImage } from '../configs/cloudinary.js';
import fs from 'fs';

// Create a new popup
export const createPopup = async (req, res) => {
  try {
    const { title, displayDuration, startDate, endDate, priority } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    let uploadResult;
    
    // Handle memory storage (faster for small files)
    if (imageFile.buffer) {
      // Convert buffer to temporary file for Cloudinary
      const tempPath = `uploads/temp-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      // Ensure uploads directory exists
      if (!fs.existsSync('uploads/')) {
        fs.mkdirSync('uploads/', { recursive: true });
      }
      
      // Write buffer to temporary file
      fs.writeFileSync(tempPath, imageFile.buffer);
      
      try {
        // Upload to Cloudinary using optimized function
        uploadResult = await uploadPopupImage(tempPath);
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    } else {
      // Handle disk storage (fallback)
      uploadResult = await uploadPopupImage(imageFile.path);
    }
    
    const popup = new Popup({
      title,
      imageUrl: uploadResult.secure_url,
      displayDuration: displayDuration || 4000,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      priority: priority || 1,
      createdBy: req.user.id
    });

    await popup.save();

    res.status(201).json({
      success: true,
      message: 'Popup created successfully',
      popup
    });
  } catch (error) {
    console.error('Error creating popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating popup',
      error: error.message
    });
  }
};

// Get all popups (admin only)
export const getAllPopups = async (req, res) => {
  try {
    const popups = await Popup.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      popups
    });
  } catch (error) {
    console.error('Error fetching popups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popups',
      error: error.message
    });
  }
};

// Get active popup for home page
export const getActivePopup = async (req, res) => {
  try {
    const now = new Date();
    
    const popup = await Popup.findOne({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gt: now } }
      ]
    }).sort({ priority: -1, createdAt: -1 });

    if (!popup) {
      return res.json({
        success: true,
        popup: null
      });
    }

    res.json({
      success: true,
      popup
    });
  } catch (error) {
    console.error('Error fetching active popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active popup',
      error: error.message
    });
  }
};

// Update popup
export const updatePopup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const imageFile = req.file;

    if (imageFile) {
      // Upload new image to Cloudinary
      const uploadResult = await uploadPopupImage(imageFile.path);
      updateData.imageUrl = uploadResult.secure_url;
    }

    const popup = await Popup.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!popup) {
      return res.status(404).json({
        success: false,
        message: 'Popup not found'
      });
    }

    res.json({
      success: true,
      message: 'Popup updated successfully',
      popup
    });
  } catch (error) {
    console.error('Error updating popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating popup',
      error: error.message
    });
  }
};

// Delete popup
export const deletePopup = async (req, res) => {
  try {
    const { id } = req.params;
    
    const popup = await Popup.findByIdAndDelete(id);
    
    if (!popup) {
      return res.status(404).json({
        success: false,
        message: 'Popup not found'
      });
    }

    res.json({
      success: true,
      message: 'Popup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting popup',
      error: error.message
    });
  }
};

// Toggle popup status
export const togglePopupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const popup = await Popup.findById(id);
    
    if (!popup) {
      return res.status(404).json({
        success: false,
        message: 'Popup not found'
      });
    }

    popup.isActive = !popup.isActive;
    await popup.save();

    res.json({
      success: true,
      message: `Popup ${popup.isActive ? 'activated' : 'deactivated'} successfully`,
      popup
    });
  } catch (error) {
    console.error('Error toggling popup status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling popup status',
      error: error.message
    });
  }
};
