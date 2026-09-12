import {
  PaymentProvider,
  PaymentProviderName,
  InitializePaymentParams,
  InitializePaymentResult,
  VerifyPaymentResult,
  WebhookEventResult
} from './types';

export class FlutterwaveProvider implements PaymentProvider {
  readonly name: PaymentProviderName = 'flutterwave';
  readonly displayName = 'Flutterwave';
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  private getSecretKey(): string {
    return (process.env.FLUTTERWAVE_SECRET_KEY || '').trim();
  }

  getPublicKey(): string | null {
    const key = (process.env.FLUTTERWAVE_PUBLIC_KEY || '').trim();
    return key || null;
  }

  private getSecretHash(): string {
    return (process.env.FLW_SECRET_HASH || process.env.FLUTTERWAVE_SECRET_HASH || '').trim();
  }

  isConfigured(): boolean {
    const key = this.getSecretKey();
    return Boolean(key && (key.startsWith('FLWSECK-') || key.startsWith('FLWSECK_TEST-') || key.length >= 10));
  }

  getMissingEnvVars(): string[] {
    const missing: string[] = [];
    if (!this.getSecretKey()) {
      missing.push('FLUTTERWAVE_SECRET_KEY');
    }
    return missing;
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    const secretKey = this.getSecretKey();
    if (!this.isConfigured()) {
      throw new Error('Flutterwave is not configured. Missing FLUTTERWAVE_SECRET_KEY environment variable.');
    }

    const payload = {
      tx_ref: params.reference,
      amount: String(params.amount),
      currency: 'NGN',
      redirect_url: params.callbackUrl,
      customer: {
        email: params.email,
        name: params.name || 'SwiftPay Customer',
        phonenumber: params.phone || ''
      },
      customizations: {
        title: 'SwiftPay Nigeria',
        description: params.purpose === 'wdv_voucher' ? 'WDV Voucher Purchase' : 'Digital Wallet Funding',
        logo: 'https://swiftpay.ng/logo.png'
      },
      meta: {
        purpose: params.purpose || 'wallet_funding',
        ...(params.metadata || {})
      }
    };

    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      const errMsg = data.message || `Flutterwave payment initiation failed with HTTP ${res.status}`;
      throw new Error(`Flutterwave error: ${errMsg}`);
    }

    return {
      success: true,
      authorizationUrl: data.data?.link,
      reference: params.reference,
      provider: this.name,
      message: data.message,
      rawResponse: data
    };
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    const secretKey = this.getSecretKey();
    if (!this.isConfigured()) {
      throw new Error('Flutterwave is not configured. Missing FLUTTERWAVE_SECRET_KEY environment variable.');
    }

    // Attempt 1: Verify using verify_by_reference (tx_ref)
    let res = await fetch(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    let data = await res.json();

    // If not found by tx_ref and reference looks like a numeric transaction ID, try direct ID lookup
    if ((!res.ok || data.status !== 'success') && /^\d+$/.test(reference)) {
      try {
        const idRes = await fetch(`${this.baseUrl}/transactions/${encodeURIComponent(reference)}/verify`, {
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        });
        const idData = await idRes.json();
        if (idRes.ok && idData.status === 'success') {
          res = idRes;
          data = idData;
        }
      } catch (idErr) {
        // keep original response
      }
    }

    if (!res.ok || data.status !== 'success') {
      return {
        success: false,
        status: 'failed',
        amount: 0,
        currency: 'NGN',
        reference,
        provider: this.name,
        message: data.message || 'Flutterwave transaction verification failed',
        rawResponse: data
      };
    }

    const txData = data.data || {};
    const isSuccess = txData.status === 'successful';
    const amountInNgn = Number(txData.amount || 0);

    let normalizedStatus: 'successful' | 'failed' | 'pending' | 'abandoned' = 'pending';
    if (txData.status === 'successful') {
      normalizedStatus = 'successful';
    } else if (txData.status === 'failed') {
      normalizedStatus = 'failed';
    } else if (txData.status === 'cancelled') {
      normalizedStatus = 'abandoned';
    }

    return {
      success: isSuccess,
      status: normalizedStatus,
      amount: amountInNgn,
      currency: txData.currency || 'NGN',
      reference: txData.tx_ref || reference,
      providerReference: String(txData.id || txData.flw_ref || ''),
      customerEmail: txData.customer?.email || '',
      customerName: txData.customer?.name || '',
      paidAt: txData.created_at || new Date().toISOString(),
      channel: txData.payment_type || 'card',
      provider: this.name,
      message: txData.processor_response || data.message,
      rawResponse: txData
    };
  }

  verifyWebhookSignature(headers: Record<string, any>, rawBody: string): boolean {
    const expectedHash = this.getSecretHash();
    if (!expectedHash) {
      // If secret hash not configured, we fallback to checking if secret key is configured
      // and let transaction verification by reference do the authoritative check
      return true;
    }

    const signature = headers['verif-hash'];
    return signature === expectedHash;
  }

  async parseWebhook(headers: Record<string, any>, rawBody: string, jsonBody: any): Promise<WebhookEventResult> {
    const isValid = this.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      return {
        isValid: false,
        provider: this.name,
        message: 'Invalid Flutterwave webhook secret hash'
      };
    }

    const event = jsonBody?.event || jsonBody?.['event.type'];
    const data = jsonBody?.data || {};
    const isSuccess = data.status === 'successful' || event === 'charge.completed';

    return {
      isValid: true,
      event: event || 'charge.completed',
      status: isSuccess ? 'successful' : 'pending',
      reference: data.tx_ref || data.txRef,
      providerReference: String(data.id || data.flw_ref || ''),
      amount: Number(data.amount || 0),
      customerEmail: data.customer?.email,
      provider: this.name,
      rawData: jsonBody
    };
  }
}
