import {
  IPaymentProvider,
  InitializePaymentParams,
  PaymentInitializationResult,
  PaymentProviderType,
  PaymentVerificationResult,
  ProviderConfigStatus,
  WebhookVerificationResult,
} from './types';
import { PaystackProvider } from './providers/paystack';
import { FlutterwaveProvider } from './providers/flutterwave';
import { KorapayProvider } from './providers/korapay';

export class PaymentManager {
  private providers: Map<PaymentProviderType, IPaymentProvider> = new Map();

  constructor() {
    this.registerProvider(new PaystackProvider());
    this.registerProvider(new FlutterwaveProvider());
    this.registerProvider(new KorapayProvider());
  }

  private registerProvider(provider: IPaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: PaymentProviderType): IPaymentProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): IPaymentProvider[] {
    return Array.from(this.providers.values());
  }

  public getConfiguredProviders(): IPaymentProvider[] {
    return this.getAllProviders().filter((p) => p.isConfigured());
  }

  /**
   * Determine the active provider using configured environment variable,
   * database site settings, or auto-fallback to the first configured provider.
   */
  public getActiveProvider(
    requestedProvider?: string,
    dbConfiguredProvider?: string
  ): IPaymentProvider | null {
    // 1. If explicit provider requested and it is configured
    if (requestedProvider && this.providers.has(requestedProvider as PaymentProviderType)) {
      const p = this.providers.get(requestedProvider as PaymentProviderType)!;
      if (p.isConfigured()) return p;
    }

    // 2. Environment variable PAYMENT_PROVIDER (e.g. 'paystack', 'flutterwave', 'korapay')
    const envProvider = process.env.PAYMENT_PROVIDER?.toLowerCase()?.trim();
    if (envProvider && envProvider !== 'auto' && this.providers.has(envProvider as PaymentProviderType)) {
      const p = this.providers.get(envProvider as PaymentProviderType)!;
      if (p.isConfigured()) return p;
    }

    // 3. Database site setting
    if (dbConfiguredProvider && dbConfiguredProvider !== 'auto' && this.providers.has(dbConfiguredProvider as PaymentProviderType)) {
      const p = this.providers.get(dbConfiguredProvider as PaymentProviderType)!;
      if (p.isConfigured()) return p;
    }

    // 4. Fallback to first configured provider in preferred order: Paystack -> Flutterwave -> Korapay
    const order: PaymentProviderType[] = ['paystack', 'flutterwave', 'korapay'];
    for (const id of order) {
      const p = this.providers.get(id);
      if (p && p.isConfigured()) {
        return p;
      }
    }

    return null;
  }

  /**
   * Returns configuration status for all supported payment providers.
   */
  public getProviderStatusList(appUrl: string, dbConfiguredProvider?: string): {
    providers: ProviderConfigStatus[];
    activeProvider: PaymentProviderType | null;
    hasAnyConfigured: boolean;
  } {
    const active = this.getActiveProvider(undefined, dbConfiguredProvider);
    const cleanAppUrl = (appUrl || '').replace(/\/$/, '');

    const list: ProviderConfigStatus[] = this.getAllProviders().map((p) => {
      return {
        id: p.id,
        name: p.name,
        isConfigured: p.isConfigured(),
        missingCredentials: p.getMissingCredentials(),
        requiredEnvVars: p.getRequiredEnvVars(),
        isDefault: active?.id === p.id,
        webhookUrl: `${cleanAppUrl}/api/payments/webhook/${p.id}`,
      };
    });

    return {
      providers: list,
      activeProvider: active ? active.id : null,
      hasAnyConfigured: this.getConfiguredProviders().length > 0,
    };
  }

  /**
   * Initialize payment via the appropriate provider.
   */
  public async initializePayment(
    params: Omit<InitializePaymentParams, 'reference'> & { reference?: string; provider?: string },
    dbConfiguredProvider?: string
  ): Promise<PaymentInitializationResult> {
    const provider = this.getActiveProvider(params.provider, dbConfiguredProvider);

    if (!provider) {
      const configured = this.getConfiguredProviders().map((p) => p.name).join(', ');
      if (params.provider) {
        throw new Error(
          `Payment provider '${params.provider}' is not configured with required API credentials.`
        );
      }
      throw new Error(
        'No payment gateway is currently configured. Administrator must provide API credentials for Paystack, Flutterwave, or Korapay.'
      );
    }

    // Generate standard reference
    const prefix = provider.id.slice(0, 4).toUpperCase();
    const reference =
      params.reference || `NV-${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return await provider.initializePayment({
      ...params,
      reference,
      currency: params.currency || 'NGN',
    });
  }

  /**
   * Verify transaction with payment provider.
   */
  public async verifyPayment(
    reference: string,
    providerId?: PaymentProviderType
  ): Promise<PaymentVerificationResult> {
    // If provider is explicitly given
    if (providerId && this.providers.has(providerId)) {
      const provider = this.providers.get(providerId)!;
      return await provider.verifyPayment(reference);
    }

    // Infer provider from reference prefix if available
    if (reference.startsWith('NV-PSTK') || reference.startsWith('NV-PAYSTACK')) {
      const p = this.providers.get('paystack');
      if (p) return await p.verifyPayment(reference);
    } else if (reference.startsWith('NV-FLUT') || reference.startsWith('NV-FLW')) {
      const p = this.providers.get('flutterwave');
      if (p) return await p.verifyPayment(reference);
    } else if (reference.startsWith('NV-KORA')) {
      const p = this.providers.get('korapay');
      if (p) return await p.verifyPayment(reference);
    }

    // Otherwise, try active provider or configured providers
    const configured = this.getConfiguredProviders();
    for (const p of configured) {
      try {
        const res = await p.verifyPayment(reference);
        if (res.status === 'successful') {
          return res;
        }
      } catch (err) {
        // continue trying next provider
      }
    }

    throw new Error(`Could not verify transaction '${reference}' with any configured payment provider.`);
  }

  /**
   * Handle incoming webhook for a specific provider.
   */
  public async handleWebhook(
    providerId: PaymentProviderType,
    headers: Record<string, any>,
    rawBody: any
  ): Promise<WebhookVerificationResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return { isValid: false, provider: providerId };
    }
    return await provider.verifyWebhook(headers, rawBody);
  }

  /**
   * Fetch bank list from active or first configured provider
   */
  public async getBankList(): Promise<{ name: string; code: string }[]> {
    const providers = this.getConfiguredProviders();
    for (const p of providers) {
      if (p.getBankList) {
        try {
          const list = await p.getBankList();
          if (list && list.length > 0) return list;
        } catch (e) {
          // ignore
        }
      }
    }
    return [];
  }

  /**
   * Resolve bank account using active or first configured provider
   */
  public async resolveBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<{ accountNumber: string; accountName: string }> {
    const providers = this.getConfiguredProviders();
    for (const p of providers) {
      if (p.resolveBankAccount) {
        try {
          const res = await p.resolveBankAccount(accountNumber, bankCode);
          if (res && res.accountName) return res;
        } catch (e) {
          // try next
        }
      }
    }
    throw new Error('Could not resolve account with available payment providers.');
  }
}

export const paymentManager = new PaymentManager();
