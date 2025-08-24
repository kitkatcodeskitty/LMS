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

// Configure multer for file uploads
const upload = multer({
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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
