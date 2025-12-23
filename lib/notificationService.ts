/**
 * Notification Service
 * Sends notifications when automated newsletter generation completes or fails
 */

export interface NotificationPayload {
  subject: string;
  message: string;
  status: 'success' | 'error';
  metadata?: Record<string, any>;
}

class NotificationService {
  /**
   * Send notification (currently logs to console, can be extended to email/webhook)
   */
  async send(payload: NotificationPayload): Promise<void> {
    const { subject, message, status, metadata } = payload;

    // Log notification
    console.log(`[Notification] ${status.toUpperCase()}: ${subject}`);
    console.log(`[Notification] ${message}`);
    if (metadata) {
      console.log('[Notification] Metadata:', JSON.stringify(metadata, null, 2));
    }

    // TODO: Add email notification via SendGrid/Resend
    // TODO: Add webhook notification for external integrations
    // TODO: Add Slack/Discord notification

    // For now, we just log. In the future, this can be extended to:
    // - Send email to admin
    // - Post to Slack channel
    // - Trigger webhook
    // - Send SMS alert
  }

  /**
   * Send success notification
   */
  async sendSuccess(subject: string, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.send({
      subject,
      message,
      status: 'success',
      metadata,
    });
  }

  /**
   * Send error notification
   */
  async sendError(subject: string, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.send({
      subject,
      message,
      status: 'error',
      metadata,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
