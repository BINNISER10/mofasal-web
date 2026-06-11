import { PaymentsApi, paymentsApi, PaymentMethod, ProcessPaymentRequest, PaymentResult, PaymentMethodInfo } from '../api/payments';

class PaymentGateway {
  private api: typeof paymentsApi;

  constructor() {
    this.api = paymentsApi;
  }

  async getAvailableMethods(): Promise<PaymentMethodInfo[]> {
    return this.api.getMethods();
  }

  async processPayment(params: {
    orderId: string;
    method: PaymentMethod;
    amount: number;
    cardDetails?: {
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
      cardHolder: string;
    };
    stcPayPhone?: string;
  }): Promise<PaymentResult> {
    const request: ProcessPaymentRequest = {
      orderId: params.orderId,
      method: params.method,
      amount: params.amount,
    };

    switch (params.method) {
      case 'mada':
      case 'visa':
      case 'mastercard':
        request.cardDetails = params.cardDetails;
        break;
      case 'stc_pay':
        request.stcPayPhone = params.stcPayPhone;
        break;
      case 'tamara':
      case 'tabby':
        request.installmentPlan = {
          provider: params.method,
          installments: 4,
        };
        break;
    }

    return this.api.process(request);
  }

  async handleMadaPayment(details: {
    orderId: string;
    amount: number;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardHolder: string;
  }): Promise<PaymentResult> {
    return this.processPayment({
      orderId: details.orderId,
      method: 'mada',
      amount: details.amount,
      cardDetails: {
        cardNumber: details.cardNumber,
        expiryMonth: details.expiryMonth,
        expiryYear: details.expiryYear,
        cvv: details.cvv,
        cardHolder: details.cardHolder,
      },
    });
  }

  async handleSTCPay(orderId: string, amount: number, phone: string): Promise<PaymentResult> {
    return this.processPayment({
      orderId,
      method: 'stc_pay',
      amount,
      stcPayPhone: phone,
    });
  }

  async handleApplePay(orderId: string, amount: number): Promise<PaymentResult> {
    return this.processPayment({
      orderId,
      method: 'apple_pay',
      amount,
    });
  }

  async handleGooglePay(orderId: string, amount: number): Promise<PaymentResult> {
    return this.processPayment({
      orderId,
      method: 'google_pay',
      amount,
    });
  }

  async handleTamara(orderId: string, amount: number, installments: number = 4): Promise<PaymentResult> {
    const request: ProcessPaymentRequest = {
      orderId,
      method: 'tamara',
      amount,
      installmentPlan: { provider: 'tamara', installments },
    };
    return this.api.process(request);
  }

  async handleTabby(orderId: string, amount: number, installments: number = 4): Promise<PaymentResult> {
    const request: ProcessPaymentRequest = {
      orderId,
      method: 'tabby',
      amount,
      installmentPlan: { provider: 'tabby', installments },
    };
    return this.api.process(request);
  }

  async confirmPayment(transactionId: string): Promise<PaymentResult> {
    return this.api.confirmPayment(transactionId);
  }
}

export const paymentGateway = new PaymentGateway();
export default paymentGateway;
