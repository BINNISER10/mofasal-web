import Stripe from 'stripe';
import { config } from '../../config';
import logger from '../../utils/logger';

export class VisaMastercardService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.payment.stripe.secretKey, { apiVersion: '2023-10-16' as any });
  }

  async charge(amount: number, paymentMethodId: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'sar',
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      });

      return {
        success: paymentIntent.status === 'succeeded',
        reference: paymentIntent.id,
        status: paymentIntent.status,
        metadata: paymentIntent,
      };
    } catch (error) {
      logger.error('Visa/Mastercard payment failed', error);
      throw new Error('Card payment processing failed');
    }
  }

  async createPaymentIntent(amount: number): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'sar',
        automatic_payment_methods: { enabled: true },
      });
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Stripe payment intent creation failed', error);
      throw new Error('Payment intent creation failed');
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return {
        success: paymentIntent.status === 'succeeded',
        reference: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      logger.error('Stripe payment confirmation failed', error);
      throw new Error('Payment confirmation failed');
    }
  }

  async refund(paymentIntentId: string, amount?: number): Promise<any> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      logger.error('Stripe refund failed', error);
      throw new Error('Refund failed');
    }
  }

  async getPayment(paymentIntentId: string): Promise<any> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error('Stripe payment fetch failed', error);
      return null;
    }
  }

  constructWebhookEvent(payload: any, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, config.payment.stripe.webhookSecret);
  }
}
