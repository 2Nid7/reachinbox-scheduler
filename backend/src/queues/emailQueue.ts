import { Queue } from 'bullmq';
import redisConnection from '../config/redis';
import { IEmailJob } from '../types';

export const emailQueue = new Queue<IEmailJob>('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs
    },
  },
});

emailQueue.on('error', (err) => {
  console.error('❌ Email queue error:', err);
});

console.log('✅ Email queue initialized');

export default emailQueue;