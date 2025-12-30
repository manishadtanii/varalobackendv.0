import express from 'express';
import multer from 'multer';
import {
  uploadImage,
  uploadSectionImage,
  uploadMultipleImages,
  deleteImage,
} from '../controllers/uploadController.js';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Multer error handler for this router
// Returns 404 with a clear message when file is too large (per request)
router.use((err, req, res, next) => {
  if (!err) return next();
  // Multer throws an error with code 'LIMIT_FILE_SIZE' on file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(404).json({ success: false, message: 'File too large' });
  }

  // File type errors (from fileFilter)
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Fallback - forward to global error handler
  return next(err);
});

/**
 * POST /api/upload
 * Simple image upload (returns URL only)
 */
router.post('/', upload.single('image'), uploadImage);

/**
 * POST /api/upload/section
 * Upload image and update section in database
 */
router.post('/section', upload.single('image'), uploadSectionImage);

/**
 * POST /api/upload/multiple
 * Upload multiple images for cards, sliders, etc.
 */
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

/**
 * DELETE /api/upload/:publicId
 * Delete image from Cloudinary
 */
router.delete('/:publicId', deleteImage);

export default router;
