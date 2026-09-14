import crypto from 'crypto';
import {
  PaymentProvider,
  PaymentProviderName,
  InitializePaymentParams,
  InitializePaymentResult,
  VerifyPaymentResult,
  WebhookEventResult
} from './types';

export class PaystackProvider implements PaymentProvider {
  readonly name: PaymentProviderName = 'paystack';
  readonly displayName = 'Paystack';
  private readonly baseUrl = 'https://api.paystack.co';

  private getSecretKey(): string {
    return (process.env.PAYSTACK_SECRET_KEY || '').trim();
  }

  getPublicKey(): string | null {
    const key = (process.env.PAYSTACK_PUBLIC_KEY || '').trim();
    return key || null;
  }

  isConfigured(): boolean {
    const key = this.getSecretKey();
    return Boolean(key && (key.startsWith('sk_test_') || key.startsWith('sk_live_') || key.length >= 10));
  }

  getMissingEnvVars(): string[] {
    const missing: string[] = [];
    if (!this.getSecretKey()) {
      missing.push('PAYSTACK_SECRET_KEY');
    }
    return missing;
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    const secretKey = this.getSecretKey();
    if (!this.isConfigured()) {
      throw new Error('Paystack is not configured. Missing PAYSTACK_SECRET_KEY environment variable.');
    }

    // Paystack takes amount in kobo (NGN * 100)
    const amountInKobo = Math.round(params.amount * 100);

    const payload = {
      email: params.email,
      amount: amountInKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: params.name || 'Customer'
          },
          {
            display_name: 'Payment Purpose',
            variable_name: 'purpose',
            value: params.purpose || 'wallet_funding'
          }
        ],
        purpose: params.purpose || 'wallet_funding',
        ...(params.metadata || {})
      }
    };

    const res = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      const errMsg = data.message || `Paystack initialization failed with HTTP status ${res.status}`;
      throw new Error(`Paystack error: ${errMsg}`);
    }

    return {
      success: true,
      authorizationUrl: data.data?.authorization_url,
      accessCode: data.data?.access_code,
      reference: data.data?.reference || params.reference,
      provider: this.name,
      message: data.message,
      rawResponse: data
    };
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    const secretKey = this.getSecretKey();
    if (!this.isConfigured()) {
      throw new Error('Paystack is not configured. Missing PAYSTACK_SECRET_KEY environment variable.');
    }

    const res = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      return {
        success: false,
        status: 'failed',
        amount: 0,
        currency: 'NGN',
        reference,
        provider: this.name,
        message: data.message || 'Transaction verification failed',
        rawResponse: data
      };
    }

    const txData = data.data || {};
    const isSuccess = txData.status === 'success';
    const amountInNgn = (txData.amount || 0) / 100;

    let normalizedStatus: 'successful' | 'failed' | 'pending' | 'abandoned' = 'pending';
    if (txData.status === 'success') {
      normalizedStatus = 'successful';
    } else if (txData.status === 'failed') {
      normalizedStatus = 'failed';
    } else if (txData.status === 'abandoned') {
      normalizedStatus = 'abandoned';
    }

    return {
      success: isSuccess,
      status: normalizedStatus,
      amount: amountInNgn,
      currency: txData.currency || 'NGN',
      reference: txData.reference || reference,
      providerReference: String(txData.id || ''),
      customerEmail: txData.customer?.email || '',
      customerName: txData.customer?.first_name ? `${txData.customer.first_name} ${txData.customer.last_name || ''}`.trim() : undefined,
      paidAt: txData.paid_at || new Date().toISOString(),
      channel: txData.channel || 'card',
      provider: this.name,
      message: txData.gateway_response || data.message,
      rawResponse: txData
    };
  }

  verifyWebhookSignature(headers: Record<string, any>, rawBody: string): boolean {
    const secretKey = this.getSecretKey();
    if (!secretKey) return false;

    const signature = headers['x-paystack-signature'];
    if (!signature) return false;

    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
    return hash === signature;
  }

  async parseWebhook(headers: Record<string, any>, rawBody: string, jsonBody: any): Promise<WebhookEventResult> {
    const isValid = this.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      return {
        isValid: false,
        provider: this.name,
        message: 'Invalid Paystack webhook signature'
      };
    }

    const event = jsonBody?.event;
    const data = jsonBody?.data || {};
    const isSuccess = event === 'charge.success' && data.status === 'success';

    return {
      isValid: true,
      event,
      status: isSuccess ? 'successful' : 'pending',
      reference: data.reference,
      providerReference: String(data.id || ''),
      amount: (data.amount || 0) / 100, // converted from kobo to NGN
      customerEmail: data.customer?.email,
      provider: this.name,
      rawData: jsonBody
    };
  }
}
