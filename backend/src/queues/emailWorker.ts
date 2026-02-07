import { Worker, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { IEmailJob } from '../types';
import { sendEmail } from '../services/smtpService';
import {
  updateEmailStatus,
  checkRateLimit,
  incrementEmailCount,
} from '../services/emailService';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');
const DELAY_BETWEEN_EMAILS = parseInt(process.env.DEFAULT_DELAY_BETWEEN_EMAILS || '2000');

export const emailWorker = new Worker<IEmailJob>(
  'email-queue',
  async (job: Job<IEmailJob>) => {
    const { emailId, recipientEmail, subject, body, userId } = job.data;

    console.log(`📧 Processing email job ${job.id} for ${recipientEmail}`);

    try {
      // Check rate limit before sending
      const canSend = await checkRateLimit(userId);

      if (!canSend) {
        console.log(`⏸️  Rate limit reached for user ${userId}, rescheduling...`);

        // Update email status to rate_limited
        await updateEmailStatus(emailId, 'rate_limited');

        // Throw error to trigger retry (BullMQ will retry with backoff)
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Add delay between emails to avoid spam
      if (DELAY_BETWEEN_EMAILS > 0) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_EMAILS));
      }

      // Send the actual email
      const result = await sendEmail({
        to: recipientEmail,
        subject,
        body,
      });

      // Increment email count for rate limiting
      await incrementEmailCount(userId);

      // Update email status in database
      await updateEmailStatus(emailId, 'sent', new Date());

      console.log(`✅ Email sent successfully to ${recipientEmail}`);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error(`❌ Failed to send email ${emailId}:`, error.message);

      // Handle rate limit differently (will be retried)
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        throw error;
      }

      // Update email status to failed
      await updateEmailStatus(emailId, 'failed', undefined, error.message);

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
    limiter: {
      max: 10, // Max 10 jobs per duration
      duration: 1000, // Per 1 second
    },
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('✅ Email worker started with concurrency:', WORKER_CONCURRENCY);

export default emailWorker;