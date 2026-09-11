import crypto from 'crypto';
import {
  IPaymentProvider,
  InitializePaymentParams,
  PaymentInitializationResult,
  PaymentVerificationResult,
  WebhookVerificationResult,
} from '../types';

export class KorapayProvider implements IPaymentProvider {
  public readonly id = 'korapay' as const;
  public readonly name = 'Korapay';

  private get secretKey(): string | undefined {
    return process.env.KORAPAY_SECRET_KEY;
  }

  private get webhookSecret(): string | undefined {
    return process.env.KORAPAY_WEBHOOK_SECRET || process.env.KORAPAY_SECRET_KEY;
  }

  public isConfigured(): boolean {
    const key = this.secretKey;
    return !!key && key.trim().length > 0;
  }

  public getMissingCredentials(): string[] {
    const missing: string[] = [];
    if (!this.secretKey) {
      missing.push('KORAPAY_SECRET_KEY');
    }
    return missing;
  }

  public getRequiredEnvVars(): string[] {
    return ['KORAPAY_SECRET_KEY', 'KORAPAY_PUBLIC_KEY', 'KORAPAY_WEBHOOK_SECRET'];
  }

  public async initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult> {
    if (!this.isConfigured()) {
      throw new Error('Korapay is not configured. Missing KORAPAY_SECRET_KEY.');
    }

    const payload = {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency || 'NGN',
      customer: {
        name: params.name,
        email: params.email,
      },
      redirect_url: params.callbackUrl,
      merchant_bears_cost: true,
      channels: ['card', 'bank_transfer', 'pay_with_bank'],
      metadata: {
        userId: params.userId,
        ...params.metadata,
      },
    };

    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.status || !data.data?.checkout_url) {
      throw new Error(data.message || 'Failed to initialize payment with Korapay.');
    }

    return {
      provider: 'korapay',
      reference: data.data.reference || params.reference,
      checkoutUrl: data.data.checkout_url,
      currency: 'NGN',
      amount: params.amount,
      rawResponse: data,
    };
  }

  public async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      throw new Error('Korapay is not configured. Missing KORAPAY_SECRET_KEY.');
    }

    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.status || !data.data) {
      return {
        provider: 'korapay',
        reference,
        amount: 0,
        currency: 'NGN',
        status: 'failed',
        rawResponse: data,
      };
    }

    const txData = data.data;
    const isSuccessful = txData.status === 'success';

    return {
      provider: 'korapay',
      reference: txData.reference || reference,
      providerReference: txData.payment_reference || txData.transaction_reference,
      amount: Number(txData.amount) || 0,
      currency: txData.currency || 'NGN',
      status: isSuccessful ? 'successful' : txData.status === 'failed' ? 'failed' : 'pending',
      paidAt: txData.paid_at || txData.created_at,
      rawResponse: txData,
    };
  }

  public async verifyWebhook(headers: Record<string, any>, rawBody: any): Promise<WebhookVerificationResult> {
    const signature = headers['x-korapay-signature'];
    const secret = this.webhookSecret;

    if (!secret || !signature) {
      return { isValid: false, provider: 'korapay' };
    }

    const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const hash = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');

    if (hash !== signature) {
      return { isValid: false, provider: 'korapay' };
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const event = payload?.event;
    const data = payload?.data;

    const isSuccessEvent =
      event === 'charge.success' || event === 'transfer.success' || event === 'virtual_bank_account.credit';

    if (isSuccessEvent && (data?.status === 'success' || !data?.status)) {
      return {
        isValid: true,
        provider: 'korapay',
        reference: data?.reference,
        providerReference: data?.payment_reference,
        amount: Number(data?.amount) || 0,
        currency: data?.currency || 'NGN',
        status: 'successful',
        event,
        rawBody: payload,
      };
    }

    return {
      isValid: true,
      provider: 'korapay',
      reference: data?.reference,
      providerReference: data?.payment_reference,
      status: data?.status === 'failed' ? 'failed' : 'pending',
      event,
      rawBody: payload,
    };
  }

  public async getBankList(): Promise<{ name: string; code: string }[]> {
    if (!this.isConfigured()) {
      return [];
    }
    const response = await fetch('https://api.korapay.com/merchant/api/v1/misc/banks?countryCode=NG', {
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
      throw new Error('Korapay is not configured.');
    }
    const response = await fetch('https://api.korapay.com/merchant/api/v1/misc/banks/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bank_code: bankCode,
        account_number: accountNumber,
      }),
    });
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
