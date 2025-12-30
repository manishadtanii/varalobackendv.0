import express from 'express';
import { getAdminUsers } from '../controllers/adminUsersController.js';

const router = express.Router();

// GET /api/admin/users
router.get('/', getAdminUsers);

export default router;
