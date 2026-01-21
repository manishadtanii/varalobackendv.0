import express from "express";
import { getPageBySlug, getAllPages, updateSection, getServiceBySlug, togglePageVisibility, getAllPagesStatus } from "../controllers/pageController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
  },
});

// 🟢 ADMIN ROUTES - Must be FIRST to avoid conflicts with dynamic routes
// Get all pages with visibility status - ADMIN ONLY
router.get("/admin/pages-status", getAllPagesStatus);

// Toggle page visibility - ADMIN ONLY
router.patch("/admin/toggle/:slug", togglePageVisibility);

// Update section content with optional image upload - ADMIN ONLY
router.patch(
  "/sections/:pageSlug/:sectionKey",
  verifyToken,
  upload.single('imageFile'),
  updateSection
);

// 🟢 PUBLIC ROUTES - After admin routes
// Get service subpage by slug (e.g., /api/pages/services/tvg-management) - PUBLIC
router.get("/services/:slug", getServiceBySlug);

// Get page by slug (with all sections) - PUBLIC
router.get("/:slug", getPageBySlug);

// Get all pages - PUBLIC
router.get("/", getAllPages);

export default router;