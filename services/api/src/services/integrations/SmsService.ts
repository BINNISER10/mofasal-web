import twilio from 'twilio';
import { config } from '../../config';
import logger from '../../utils/logger';

export class SmsService {
  private static client: twilio.Twilio | null = null;

  static initialize() {
    if (config.twilio.accountSid?.startsWith('AC') && config.twilio.authToken) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    } else {
      logger.warn('Twilio not configured, SMS disabled');
    }
  }

  static async send(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      logger.info(`[SMS Mock] To: ${to}, Message: ${message}`);
      return true;
    }
    try {
      await this.client.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to: to.startsWith('+') ? to : `+966${to.replace(/^0+/, '')}`,
      });
      return true;
    } catch (error) {
      logger.error('SMS send failed', error);
      return false;
    }
  }

  static async sendVerificationCode(to: string, code: string): Promise<boolean> {
    return this.send(to, `Your MUFASAL verification code is: ${code}. Valid for 5 minutes.`);
  }

  static async sendOrderConfirmation(to: string, orderNumber: string): Promise<boolean> {
    return this.send(to, `Your MUFASAL order #${orderNumber} has been confirmed. Thank you for your business!`);
  }

  static async sendDeliveryUpdate(to: string, orderNumber: string, status: string): Promise<boolean> {
    return this.send(to, `MUFASAL: Order #${orderNumber} delivery status updated to: ${status}`);
  }
}
