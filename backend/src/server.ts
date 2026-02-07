import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { syncDatabase } from './models';
import { initializeSMTP } from './services/smtpService';
import authRoutes from './routes/auth';
import emailRoutes from './routes/email';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Support both ports
  credentials: true,
}));
app.use(express.json()); // This MUST be here!
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();

    // Initialize SMTP
    await initializeSMTP();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📧 SMTP configured and ready`);
      console.log(`🗄️  Database connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();