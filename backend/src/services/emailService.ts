import { v4 as uuidv4 } from 'uuid';
import Email from '../models/Email';
import { IScheduleEmailRequest } from '../types';
import { emailQueue } from '../queues/emailQueue';
import redisConnection from '../config/redis';

// Schedule multiple emails
export const scheduleEmails = async (
  userId: string,
  data: IScheduleEmailRequest
) => {
  const batchId = uuidv4();
  const { subject, body, recipients, startTime, delayBetweenEmails, hourlyLimit } = data;

  const scheduledEmails = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    // Calculate delay for each email
    const emailDelay = i * delayBetweenEmails;
    const scheduledAt = new Date(startTime.getTime() + emailDelay);

    // Create email record in database
    const email = await Email.create({
      userId,
      recipientEmail: recipient,
      subject,
      body,
      scheduledAt,
      status: 'scheduled',
      batchId,
    });

    // Schedule job in BullMQ
    const job = await emailQueue.add(
      'send-email',
      {
        emailId: email.id,
        recipientEmail: recipient,
        subject,
        body,
        userId,
        batchId,
      },
      {
        delay: emailDelay, // Delay in milliseconds
        jobId: `email-${email.id}`,
      }
    );

    // Store job ID in database
    await email.update({ jobId: job.id });

    scheduledEmails.push({
      id: email.id,
      recipientEmail: recipient,
      scheduledAt,
      jobId: job.id,
    });
  }

  return {
    batchId,
    totalEmails: recipients.length,
    scheduledEmails,
  };
};

// Get scheduled emails for a user
export const getScheduledEmails = async (userId: string) => {
  const emails = await Email.findAll({
    where: {
      userId,
      status: 'scheduled',
    },
    order: [['scheduledAt', 'ASC']],
  });

  return emails;
};

// Get sent emails for a user
export const getSentEmails = async (userId: string) => {
  const emails = await Email.findAll({
    where: {
      userId,
      status: ['sent', 'failed'],
    },
    order: [['sentAt', 'DESC']],
  });

  return emails;
};

// Update email status
export const updateEmailStatus = async (
  emailId: string,
  status: 'sent' | 'failed' | 'rate_limited',
  sentAt?: Date,
  failureReason?: string
) => {
  await Email.update(
    {
      status,
      sentAt: sentAt || new Date(),
      failureReason,
    },
    {
      where: { id: emailId },
    }
  );
};

// Check rate limit for user
export const checkRateLimit = async (userId: string): Promise<boolean> => {
  const maxEmailsPerHour = parseInt(process.env.MAX_EMAILS_PER_HOUR || '200');
  
  // Get current hour window
  const now = new Date();
  const hourKey = `rate_limit:${userId}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

  // Get current count from Redis
  const currentCount = await redisConnection.get(hourKey);
  const count = currentCount ? parseInt(currentCount) : 0;

  // Check if limit exceeded
  if (count >= maxEmailsPerHour) {
    return false; // Rate limit exceeded
  }

  return true; // Can send
};

// Increment email count for rate limiting
export const incrementEmailCount = async (userId: string): Promise<void> => {
  const now = new Date();
  const hourKey = `rate_limit:${userId}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

  // Increment counter
  await redisConnection.incr(hourKey);
  
  // Set expiry to 2 hours (to clean up old keys)
  await redisConnection.expire(hourKey, 7200);
};