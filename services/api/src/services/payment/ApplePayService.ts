import Stripe from 'stripe';
import { config } from '../../config';
import logger from '../../utils/logger';

export class ApplePayService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.payment.stripe.secretKey, { apiVersion: '2023-10-16' as any });
  }

  async processPayment(amount: number, paymentData: any): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'sar',
        payment_method_data: {
          type: 'card',
          token: paymentData.token,
        } as any,
        confirm: true,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        reference: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      logger.error('Apple Pay payment failed', error);
      throw new Error('Apple Pay payment failed');
    }
  }

  async validateMerchant(validationUrl: string): Promise<any> {
    try {
      const session = await this.stripe.applePayDomains.create({
        domain_name: new URL(config.cors.origin).hostname,
      });
      return { validated: true, merchantSession: session };
    } catch (error) {
      logger.error('Apple Pay merchant validation failed', error);
      throw new Error('Apple Pay merchant validation failed');
    }
  }
}
