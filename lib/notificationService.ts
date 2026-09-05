/**
 * Notification Service
 * Sends notifications when automated newsletter generation completes or fails.
 *
 * Channels (all optional, enabled by their environment variable):
 *  - Email:   RESEND_API_KEY + NOTIFICATION_EMAIL_FROM + NOTIFICATION_EMAIL_TO
 *  - Slack:   SLACK_WEBHOOK_URL
 *  - Webhook: WEBHOOK_URL
 *
 * If no channel is configured, notifications are logged to the console so the
 * generation flow still reports its outcome in Vercel logs.
 */

export interface NotificationPayload {
  subject: string;
  message: string;
  status: 'success' | 'error';
  metadata?: Record<string, unknown>;
}

type ChannelResult = {
  channel: string;
  ok: boolean;
  error?: string;
};

class NotificationService {
  /**
   * Send a notification across every configured channel.
   * Failures in one channel never throw: they are logged and the remaining
   * channels still run, so a misconfigured webhook cannot break generation.
   */
  async send(payload: NotificationPayload): Promise<ChannelResult[]> {
    const results: ChannelResult[] = [];

    // Always log to console as the baseline channel.
    console.log(`[Notification] ${payload.status.toUpperCase()}: ${payload.subject}`);
    console.log(`[Notification] ${payload.message}`);
    if (payload.metadata) {
      console.log('[Notification] Metadata:', JSON.stringify(payload.metadata, null, 2));
    }

    const channels: Array<() => Promise<ChannelResult | null>> = [
      () => this.sendEmail(payload),
      () => this.sendSlack(payload),
      () => this.sendWebhook(payload),
    ];

    for (const channel of channels) {
      try {
        const result = await channel();
        if (result) {
          results.push(result);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Notification] Channel failed:', message);
        results.push({ channel: 'unknown', ok: false, error: message });
      }
    }

    return results;
  }

  /**
   * Send a success notification.
   */
  async sendSuccess(subject: string, message: string, metadata?: Record<string, unknown>): Promise<ChannelResult[]> {
    return this.send({
      subject,
      message,
      status: 'success',
      metadata,
    });
  }

  /**
   * Send an error notification.
   */
  async sendError(subject: string, message: string, metadata?: Record<string, unknown>): Promise<ChannelResult[]> {
    return this.send({
      subject,
      message,
      status: 'error',
      metadata,
    });
  }

  private async sendEmail(payload: NotificationPayload): Promise<ChannelResult | null> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFICATION_EMAIL_FROM;
    const to = process.env.NOTIFICATION_EMAIL_TO;

    if (!apiKey || !from || !to) {
      return null;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: payload.subject,
          html: this.formatHtmlMessage(payload),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { channel: 'email', ok: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      return { channel: 'email', ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { channel: 'email', ok: false, error: message };
    }
  }

  private async sendSlack(payload: NotificationPayload): Promise<ChannelResult | null> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return null;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `*${payload.subject}*\n${payload.message}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { channel: 'slack', ok: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      return { channel: 'slack', ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { channel: 'slack', ok: false, error: message };
    }
  }

  private async sendWebhook(payload: NotificationPayload): Promise<ChannelResult | null> {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      return null;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { channel: 'webhook', ok: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      return { channel: 'webhook', ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { channel: 'webhook', ok: false, error: message };
    }
  }

  private formatHtmlMessage(payload: NotificationPayload): string {
    const metadataHtml = payload.metadata
      ? `<pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow:auto;">${this.escapeHtml(JSON.stringify(payload.metadata, null, 2))}</pre>`
      : '';

    return `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:640px;">
        <h2 style="margin-bottom:8px;">${this.escapeHtml(payload.subject)}</h2>
        <p style="margin-top:0;">${this.escapeHtml(payload.message)}</p>
        ${metadataHtml}
      </div>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

}


export const notificationService = new NotificationService();
