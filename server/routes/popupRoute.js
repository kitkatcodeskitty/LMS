import express from 'express';
import multer from 'multer';
import { 
  createPopup, 
  getAllPopups, 
  getActivePopup, 
  updatePopup, 
  deletePopup, 
  togglePopupStatus 
} from '../controllers/popupController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Optimized multer configuration - keeping original file sizes for quality
const upload = multer({
  // Use memory storage for faster processing (no file size limits)
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB to preserve image quality
    files: 1,                    // Only one file at a time
    fieldSize: 1024 * 1024      // 1MB field size limit
  }
});

// Alternative disk storage for very large files (fallback)
const diskUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB for very large images
    files: 1
  }
});

// Public route - get active popup for home page
router.get('/active', getActivePopup);

// Admin routes - require authentication and admin privileges
router.post('/', authenticateToken, isAdmin, upload.single('image'), createPopup);
router.get('/', authenticateToken, isAdmin, getAllPopups);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), updatePopup);
router.delete('/:id', authenticateToken, isAdmin, deletePopup);
router.patch('/:id/toggle', authenticateToken, isAdmin, togglePopupStatus);

export default router;
