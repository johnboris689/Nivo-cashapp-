import crypto from 'crypto';
import {
  PaymentProvider,
  PaymentProviderName,
  InitializePaymentParams,
  InitializePaymentResult,
  VerifyPaymentResult,
  WebhookEventResult
} from './types';

export class KorapayProvider implements PaymentProvider {
  readonly name: PaymentProviderName = 'korapay';
  readonly displayName = 'Korapay';
  private readonly baseUrl = 'https://api.korapay.com/merchant/api/v1';

  private getSecretKey(): string {
    return (process.env.KORAPAY_SECRET_KEY || '').trim();
  }

  getPublicKey(): string | null {
    const key = (process.env.KORAPAY_PUBLIC_KEY || '').trim();
    return key || null;
  }

  isConfigured(): boolean {
    const key = this.getSecretKey();
    return Boolean(key && (key.startsWith('sk_') || key.length >= 10));
  }

  getMissingEnvVars(): string[] {
    const missing: string[] = [];
    if (!this.getSecretKey()) {
      missing.push('KORAPAY_SECRET_KEY');
    }
    return missing;
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    const secretKey = this.getSecretKey();
    if (!this.isConfigured()) {
      throw new Error('Korapay is not configured. Missing KORAPAY_SECRET_KEY environment variable.');
    }

    const payload: Record<string, any> = {
      reference: params.reference,
      amount: params.amount,
      currency: 'NGN',
      redirect_url: params.callbackUrl,
      channels: ['bank_transfer', 'card', 'pay_with_bank'],
      customer: {
        name: params.name || 'Nevo Customer',
        email: params.email
      },
      narration: params.purpose === 'wdv_voucher' ? 'Nevo Payment' : 'Nevo Wallet Funding',
      metadata: {
        purpose: params.purpose || 'wallet_funding',
        ...(params.metadata || {})
      }
    };
    if (params.webhookUrl) {
      payload.notification_url = params.webhookUrl;
    }

    const res = await fetch(`${this.baseUrl}/charges/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      const errMsg = data.message || `Korapay payment initiation failed with HTTP ${res.status}`;
      throw new Error(`Korapay error: ${errMsg}`);
    }

    return {
      success: true,
      authorizationUrl: data.data?.checkout_url,
      reference: data.data?.reference || params.reference,
      provider: this.name,
      message: data.message,
      rawResponse: data
    };
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    const secretKey = this.getSecretKey();
    if (!this.isConfigured()) {
      throw new Error('Korapay is not configured. Missing KORAPAY_SECRET_KEY environment variable.');
    }

    const res = await fetch(`${this.baseUrl}/charges/${encodeURIComponent(reference)}`, {
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
        message: data.message || 'Korapay transaction verification failed',
        rawResponse: data
      };
    }

    const txData = data.data || {};
    const isSuccess = txData.status === 'success' || txData.status === 'successful';
    const amountInNgn = Number(txData.amount_paid ?? txData.amount ?? 0);

    let normalizedStatus: 'successful' | 'failed' | 'pending' | 'abandoned' = 'pending';
    if (isSuccess) {
      normalizedStatus = 'successful';
    } else if (txData.status === 'failed') {
      normalizedStatus = 'failed';
    } else if (txData.status === 'expired') {
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
      customerName: txData.customer?.name || '',
      paidAt: txData.paid_at || new Date().toISOString(),
      channel: txData.payment_method || 'card',
      provider: this.name,
      message: data.message,
      rawResponse: txData
    };
  }

  verifyWebhookSignature(headers: Record<string, any>, rawBody: string): boolean {
    const secret = this.getSecretKey();
    const signature = String(headers['x-korapay-signature'] || '').trim();
    if (!secret || !signature || !rawBody) return false;

    try {
      const body = JSON.parse(rawBody);
      // Korapay signs only the webhook `data` object with the Secret Key.
      const signedPayload = JSON.stringify(body?.data ?? {});
      const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(signature, 'utf8');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  async parseWebhook(headers: Record<string, any>, rawBody: string, jsonBody: any): Promise<WebhookEventResult> {
    const isValid = this.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      return {
        isValid: false,
        provider: this.name,
        message: 'Invalid Korapay webhook signature'
      };
    }

    const event = jsonBody?.event;
    const data = jsonBody?.data || {};
    const isSuccess = event === 'charge.success' && (
      data.transaction_status === 'success' ||
      data.status === 'success' ||
      data.status === 'successful'
    );

    return {
      isValid: true,
      event,
      status: isSuccess ? 'successful' : (event === 'charge.failed' ? 'failed' : 'pending'),
      // Prefer Nevo's merchant/payment reference. Kora also supplies a generated
      // charge reference, which is stored separately as providerReference.
      reference: data.payment_reference || data.reference || data.account_reference,
      providerReference: String(data.reference || data.id || ''),
      amount: Number(data.amount_paid ?? data.amount ?? 0),
      customerEmail: data.customer?.email || data.payer_bank_account?.email,
      provider: this.name,
      rawData: jsonBody
    };
  }
}
