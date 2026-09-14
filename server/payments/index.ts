import {
  IPaymentProvider,
  InitializePaymentParams,
  PaymentInitializationResult,
  PaymentProviderType,
  PaymentVerificationResult,
  ProviderConfigStatus,
  WebhookVerificationResult,
} from './types';
import { KorapayProvider } from './providers/korapay';

export class PaymentManager {
  private readonly provider: IPaymentProvider = new KorapayProvider();

  public getProvider(id: PaymentProviderType = 'korapay'): IPaymentProvider | undefined {
    return id === 'korapay' ? this.provider : undefined;
  }

  public getAllProviders(): IPaymentProvider[] {
    return [this.provider];
  }

  public getConfiguredProviders(): IPaymentProvider[] {
    return this.provider.isConfigured() ? [this.provider] : [];
  }

  public getActiveProvider(
    _requestedProvider?: string,
    _dbConfiguredProvider?: string
  ): IPaymentProvider | null {
    return this.provider.isConfigured() ? this.provider : null;
  }

  public getAllProvidersStatus(appUrl = ''): ProviderConfigStatus[] {
    const clean = (appUrl || '').replace(/\/$/, '');
    return [{
      id: 'korapay',
      name: this.provider.name,
      isConfigured: this.provider.isConfigured(),
      missingCredentials: this.provider.getMissingCredentials(),
      requiredEnvVars: this.provider.getRequiredEnvVars(),
      isDefault: true,
      webhookUrl: `${clean}/api/payment/webhook/korapay`,
    }];
  }

  public getProviderStatusList(appUrl: string): {
    providers: ProviderConfigStatus[];
    activeProvider: PaymentProviderType | null;
    hasAnyConfigured: boolean;
  } {
    return {
      providers: this.getAllProvidersStatus(appUrl),
      activeProvider: this.provider.isConfigured() ? 'korapay' : null,
      hasAnyConfigured: this.provider.isConfigured(),
    };
  }

  public getConfiguredActiveProviderName(): PaymentProviderType | null {
    return this.provider.isConfigured() ? 'korapay' : null;
  }

  public setActiveProviderName(provider: PaymentProviderType): void {
    if (provider !== 'korapay') throw new Error('KoraPay is the only supported payment provider.');
  }

  public async initializePayment(
    params: Omit<InitializePaymentParams, 'reference'> & { reference?: string; provider?: string }
  ): Promise<PaymentInitializationResult> {
    if (params.provider && params.provider.toLowerCase() !== 'korapay') {
      throw new Error('KoraPay is the only supported payment provider.');
    }
    const reference = params.reference || `NEVO_KORA_${Date.now()}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    return this.provider.initializePayment({
      ...params,
      reference,
      currency: 'NGN',
    });
  }

  public async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    return this.provider.verifyPayment(reference);
  }

  public async handleWebhook(
    _providerId: PaymentProviderType,
    headers: Record<string, any>,
    rawBody: any
  ): Promise<WebhookVerificationResult> {
    return this.provider.verifyWebhook(headers, rawBody);
  }

  public async getBankList(): Promise<{ name: string; code: string }[]> {
    return this.provider.getBankList ? this.provider.getBankList() : [];
  }

  public async resolveBankAccount(accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }> {
    if (!this.provider.resolveBankAccount) throw new Error('KoraPay account resolution is unavailable.');
    return this.provider.resolveBankAccount(accountNumber, bankCode);
  }
}

export const paymentManager = new PaymentManager();
export type PaymentProviderName = PaymentProviderType;
