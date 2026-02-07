import { Request, Response } from 'express';
import {
  scheduleEmails,
  getScheduledEmails,
  getSentEmails,
} from '../services/emailService';

// Schedule emails
export const scheduleEmailsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subject, body, recipients, startTime, delayBetweenEmails, hourlyLimit } = req.body;

    // Validation
    if (!subject || !body || !recipients || !startTime) {
      return res.status(400).json({
        error: 'Missing required fields: subject, body, recipients, startTime',
      });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients must be a non-empty array' });
    }

    // Schedule emails
    const result = await scheduleEmails(userId, {
      subject,
      body,
      recipients,
      startTime: new Date(startTime),
      delayBetweenEmails: delayBetweenEmails || 2000,
      hourlyLimit: hourlyLimit || 200,
    });

    res.status(201).json({
      message: 'Emails scheduled successfully',
      ...result,
    });
  } catch (error: any) {
    console.error('Schedule emails error:', error);
    res.status(500).json({ error: 'Failed to schedule emails' });
  }
};

// Get scheduled emails
export const getScheduledEmailsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const emails = await getScheduledEmails(userId);

    res.json({ emails });
  } catch (error) {
    console.error('Get scheduled emails error:', error);
    res.status(500).json({ error: 'Failed to get scheduled emails' });
  }
};

// Get sent emails
export const getSentEmailsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const emails = await getSentEmails(userId);

    res.json({ emails });
  } catch (error) {
    console.error('Get sent emails error:', error);
    res.status(500).json({ error: 'Failed to get sent emails' });
  }
};