import express from 'express';
import {
  scheduleEmailsHandler,
  getScheduledEmailsHandler,
  getSentEmailsHandler,
} from '../controllers/emailController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/emails/schedule - Schedule emails
router.post('/schedule', scheduleEmailsHandler);

// GET /api/emails/scheduled - Get scheduled emails
router.get('/scheduled', getScheduledEmailsHandler);

// GET /api/emails/sent - Get sent emails
router.get('/sent', getSentEmailsHandler);

export default router;