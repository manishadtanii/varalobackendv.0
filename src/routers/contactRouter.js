import express from "express";
import multer from "multer";
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Public - submit contact form
router.post("/", upload.single("File"), createContact);

// Multer error handler for contact uploads (file size)
router.use((err, req, res, next) => {
  if (!err) return next();
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(404).json({ success: false, message: 'File too large' });
  }
  return next(err);
});

// Admin routes - currently public; add verifyToken middleware later
router.get("/", getContacts);
router.get("/:id", getContactById);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
