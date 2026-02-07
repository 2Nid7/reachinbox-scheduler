import express from 'express';
import { googleLogin, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/google - Google login
router.post('/google', googleLogin);

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, getCurrentUser);

export default router;