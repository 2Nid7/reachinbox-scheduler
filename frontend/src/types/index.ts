// frontend/src/types/index.ts

export interface ScheduleEmailRequest {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string; // IMPORTANT: string (ISO), not Date
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export interface Email {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'failed' | 'rate_limited';
}
export interface ScheduleEmailResponse {
  success: boolean;
  batchId: string;
  totalEmails: number;
}
