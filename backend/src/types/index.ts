export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmail {
  id: string;
  userId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'rate_limited';
  failureReason?: string;
  jobId?: string;
  batchId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmailJob {
  emailId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  userId: string;
  batchId?: string;
}

export interface IScheduleEmailRequest {
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export interface IRateLimitConfig {
  maxEmailsPerHour: number;
  delayBetweenEmails: number;
}