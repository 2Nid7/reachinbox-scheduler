import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter | null = null;

// Initialize SMTP transporter
export const initializeSMTP = async () => {
  try {
    // If credentials are not in .env, create test account
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Creating Ethereal Email test account...');
      const testAccount = await nodemailer.createTestAccount();
      
      console.log('✅ Ethereal Email Account Created:');
      console.log('   User:', testAccount.user);
      console.log('   Pass:', testAccount.pass);
      console.log('   📌 Add these to your .env file!');
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (error) {
    console.error('❌ SMTP initialization failed:', error);
    throw error;
  }
};

// Send email
export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  if (!transporter) {
    throw new Error('SMTP not initialized. Call initializeSMTP() first.');
  }

  const info = await transporter.sendMail({
    from: '"ReachInbox Scheduler" <scheduler@reachinbox.com>',
    to,
    subject,
    html: body,
  });

  console.log('✅ Email sent:', info.messageId);
  console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));

  return info;
};
