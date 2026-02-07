import dotenv from 'dotenv';
import { syncDatabase } from './models';
import { initializeSMTP } from './services/smtpService';
import './queues/emailWorker'; // This starts the worker

dotenv.config();

const startWorker = async () => {
  try {
    console.log('🔧 Starting email worker...');

    // Sync database
    await syncDatabase();

    // Initialize SMTP
    await initializeSMTP();

    console.log('✅ Worker is ready and processing jobs');
    console.log('📧 Watching for email jobs in queue...');
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
