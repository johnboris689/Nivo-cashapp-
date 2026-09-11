import {
  IPaymentProvider,
  InitializePaymentParams,
  PaymentInitializationResult,
  PaymentVerificationResult,
  WebhookVerificationResult,
} from '../types';

export class FlutterwaveProvider implements IPaymentProvider {
  public readonly id = 'flutterwave' as const;
  public readonly name = 'Flutterwave';

  private get secretKey(): string | undefined {
    return process.env.FLUTTERWAVE_SECRET_KEY;
  }

  private get webhookHash(): string | undefined {
    return process.env.FLUTTERWAVE_WEBHOOK_HASH || process.env.FLUTTERWAVE_SECRET_HASH;
  }

  public isConfigured(): boolean {
    const key = this.secretKey;
    return !!key && key.trim().length > 0;
  }

  public getMissingCredentials(): string[] {
    const missing: string[] = [];
    if (!this.secretKey) {
      missing.push('FLUTTERWAVE_SECRET_KEY');
    }
    return missing;
  }

  public getRequiredEnvVars(): string[] {
    return ['FLUTTERWAVE_SECRET_KEY', 'FLUTTERWAVE_PUBLIC_KEY', 'FLUTTERWAVE_WEBHOOK_HASH'];
  }

  public async initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult> {
    if (!this.isConfigured()) {
      throw new Error('Flutterwave is not configured. Missing FLUTTERWAVE_SECRET_KEY.');
    }

    const payload = {
      tx_ref: params.reference,
      amount: params.amount,
      currency: params.currency || 'NGN',
      redirect_url: params.callbackUrl,
      customer: {
        email: params.email,
        name: params.name,
        phonenumber: params.phone || '',
      },
      customizations: {
        title: 'Nivo Cash App',
        description: 'Wallet Deposit Funding',
      },
      meta: {
        userId: params.userId,
        ...params.metadata,
      },
    };

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success' || !data.data?.link) {
      throw new Error(data.message || 'Failed to initialize payment with Flutterwave.');
    }

    return {
      provider: 'flutterwave',
      reference: params.reference,
      checkoutUrl: data.data.link,
      currency: 'NGN',
      amount: params.amount,
      rawResponse: data,
    };
  }

  public async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      throw new Error('Flutterwave is not configured. Missing FLUTTERWAVE_SECRET_KEY.');
    }

    // Verify using transaction reference
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== 'success' || !data.data) {
      return {
        provider: 'flutterwave',
        reference,
        amount: 0,
        currency: 'NGN',
        status: 'failed',
        rawResponse: data,
      };
    }

    const txData = data.data;
    const isSuccessful = txData.status === 'successful';

    return {
      provider: 'flutterwave',
      reference: txData.tx_ref || reference,
      providerReference: txData.id?.toString() || txData.flw_ref,
      amount: Number(txData.amount) || 0,
      currency: txData.currency || 'NGN',
      status: isSuccessful ? 'successful' : txData.status === 'failed' ? 'failed' : 'pending',
      paidAt: txData.created_at,
      rawResponse: txData,
    };
  }

  public async verifyWebhook(headers: Record<string, any>, rawBody: any): Promise<WebhookVerificationResult> {
    const signature = headers['verif-hash'];
    const expectedHash = this.webhookHash;

    if (expectedHash && signature !== expectedHash) {
      return { isValid: false, provider: 'flutterwave' };
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const event = payload?.event;
    const data = payload?.data;

    if ((event === 'charge.completed' || !event) && data?.status === 'successful') {
      return {
        isValid: true,
        provider: 'flutterwave',
        reference: data.tx_ref,
        providerReference: data.id?.toString() || data.flw_ref,
        amount: Number(data.amount) || 0,
        currency: data.currency || 'NGN',
        status: 'successful',
        event,
        rawBody: payload,
      };
    }

    return {
      isValid: true,
      provider: 'flutterwave',
      reference: data?.tx_ref,
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
    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
    const data = await response.json();
    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data.map((b: any) => ({ name: b.name, code: b.code }));
    }
    return [];
  }

  public async resolveBankAccount(accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }> {
    if (!this.isConfigured()) {
      throw new Error('Flutterwave is not configured.');
    }
    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode,
      }),
    });
    const data = await response.json();
    if (data.status === 'success' && data.data?.account_name) {
      return {
        accountNumber,
        accountName: data.data.account_name,
      };
    }
    throw new Error(data.message || 'Could not resolve account details.');
  }
}
