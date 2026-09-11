import crypto from 'crypto';
import {
  IPaymentProvider,
  InitializePaymentParams,
  PaymentInitializationResult,
  PaymentVerificationResult,
  WebhookVerificationResult,
} from '../types';

export class PaystackProvider implements IPaymentProvider {
  public readonly id = 'paystack' as const;
  public readonly name = 'Paystack';

  private get secretKey(): string | undefined {
    return process.env.PAYSTACK_SECRET_KEY;
  }

  private get webhookSecret(): string | undefined {
    return process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  }

  public isConfigured(): boolean {
    const key = this.secretKey;
    return !!key && key.trim().length > 0;
  }

  public getMissingCredentials(): string[] {
    const missing: string[] = [];
    if (!this.secretKey) {
      missing.push('PAYSTACK_SECRET_KEY');
    }
    return missing;
  }

  public getRequiredEnvVars(): string[] {
    return ['PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY', 'PAYSTACK_WEBHOOK_SECRET'];
  }

  public async initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult> {
    if (!this.isConfigured()) {
      throw new Error('Paystack is not configured. Missing PAYSTACK_SECRET_KEY.');
    }

    // Paystack expects amount in Kobo (1 NGN = 100 Kobo)
    const amountInKobo = Math.round(params.amount * 100);

    const payload = {
      email: params.email,
      amount: amountInKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: params.currency || 'NGN',
      metadata: {
        userId: params.userId,
        userName: params.name,
        phone: params.phone,
        ...params.metadata,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || 'Failed to initialize payment with Paystack.');
    }

    return {
      provider: 'paystack',
      reference: data.data.reference || params.reference,
      checkoutUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      currency: 'NGN',
      amount: params.amount,
      rawResponse: data,
    };
  }

  public async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      throw new Error('Paystack is not configured. Missing PAYSTACK_SECRET_KEY.');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return {
        provider: 'paystack',
        reference,
        amount: 0,
        currency: 'NGN',
        status: 'failed',
        rawResponse: data,
      };
    }

    const txData = data.data;
    // Paystack returns amount in Kobo
    const amountInNaira = txData.amount ? txData.amount / 100 : 0;
    const isSuccessful = txData.status === 'success';

    return {
      provider: 'paystack',
      reference: txData.reference || reference,
      providerReference: txData.id?.toString(),
      amount: amountInNaira,
      currency: txData.currency || 'NGN',
      status: isSuccessful ? 'successful' : txData.status === 'abandoned' ? 'failed' : 'pending',
      paidAt: txData.paid_at,
      rawResponse: txData,
    };
  }

  public async verifyWebhook(headers: Record<string, any>, rawBody: any): Promise<WebhookVerificationResult> {
    const signature = headers['x-paystack-signature'];
    const secret = this.webhookSecret;

    if (!secret || !signature) {
      return { isValid: false, provider: 'paystack' };
    }

    const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const hash = crypto.createHmac('sha512', secret).update(bodyString).digest('hex');

    if (hash !== signature) {
      return { isValid: false, provider: 'paystack' };
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const event = payload?.event;
    const data = payload?.data;

    if (event === 'charge.success' && data?.status === 'success') {
      const amountInNaira = data.amount ? data.amount / 100 : 0;
      return {
        isValid: true,
        provider: 'paystack',
        reference: data.reference,
        providerReference: data.id?.toString(),
        amount: amountInNaira,
        currency: data.currency || 'NGN',
        status: 'successful',
        event,
        rawBody: payload,
      };
    }

    return {
      isValid: true,
      provider: 'paystack',
      reference: data?.reference,
      providerReference: data?.id?.toString(),
      status: data?.status === 'failed' ? 'failed' : 'pending',
      event,
      rawBody: payload,
    };
  }

  public async getBankList(): Promise<{ name: string; code: string }[]> {
    if (!this.isConfigured()) {
      return [];
    }
    const response = await fetch('https://api.paystack.co/bank?country=nigeria', {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
    const data = await response.json();
    if (data.status && Array.isArray(data.data)) {
      return data.data.map((b: any) => ({ name: b.name, code: b.code }));
    }
    return [];
  }

  public async resolveBankAccount(accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }> {
    if (!this.isConfigured()) {
      throw new Error('Paystack is not configured.');
    }
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      }
    );
    const data = await response.json();
    if (data.status && data.data?.account_name) {
      return {
        accountNumber,
        accountName: data.data.account_name,
      };
    }
    throw new Error(data.message || 'Could not resolve account details.');
  }
}
