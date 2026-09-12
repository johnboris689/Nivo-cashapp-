import { PaymentProvider, PaymentProviderName, ProviderStatusInfo } from './types';
import { PaystackProvider } from './PaystackProvider';
import { FlutterwaveProvider } from './FlutterwaveProvider';
import { KorapayProvider } from './KorapayProvider';

export class PaymentManager {
  private providers: Map<PaymentProviderName, PaymentProvider> = new Map();
  private runtimeActiveProviderName: PaymentProviderName | null = null;

  constructor() {
    const paystack = new PaystackProvider();
    const flutterwave = new FlutterwaveProvider();
    const korapay = new KorapayProvider();

    this.providers.set('paystack', paystack);
    this.providers.set('flutterwave', flutterwave);
    this.providers.set('korapay', korapay);
  }

  getProvider(name: PaymentProviderName): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider "${name}" is not supported. Supported providers: paystack, flutterwave, korapay.`);
    }
    return provider;
  }

  getConfiguredActiveProviderName(): PaymentProviderName {
    if (this.runtimeActiveProviderName) {
      return this.runtimeActiveProviderName;
    }

    const envProvider = (process.env.PAYMENT_PROVIDER || '').toLowerCase().trim();
    if (envProvider === 'flutterwave' || envProvider === 'korapay' || envProvider === 'paystack') {
      return envProvider as PaymentProviderName;
    }

    // If environment variable is not explicitly set, prefer the first one that is fully configured
    for (const name of ['paystack', 'flutterwave', 'korapay'] as PaymentProviderName[]) {
      const p = this.providers.get(name);
      if (p && p.isConfigured()) {
        return name;
      }
    }

    // Default to paystack if none configured
    return 'paystack';
  }

  setActiveProviderName(name: PaymentProviderName) {
    if (!this.providers.has(name)) {
      throw new Error(`Invalid payment provider: ${name}`);
    }
    this.runtimeActiveProviderName = name;
  }

  getActiveProvider(requestedName?: string): PaymentProvider | null {
    if (requestedName) {
      const norm = requestedName.toLowerCase().trim() as PaymentProviderName;
      if (this.providers.has(norm)) {
        return this.providers.get(norm)!;
      }
    }

    const activeName = this.getConfiguredActiveProviderName();
    const provider = this.providers.get(activeName);
    if (!provider) return null;

    // If configured provider is not ready, check if any other provider is configured
    if (!provider.isConfigured()) {
      for (const [name, p] of this.providers.entries()) {
        if (p.isConfigured()) {
          return p;
        }
      }
    }

    return provider;
  }

  getAllProvidersStatus(): ProviderStatusInfo[] {
    const activeName = this.getConfiguredActiveProviderName();
    const list: ProviderStatusInfo[] = [];

    for (const [name, provider] of this.providers.entries()) {
      const isConfigured = provider.isConfigured();
      list.push({
        name,
        displayName: provider.displayName,
        isConfigured,
        isActive: name === activeName,
        hasSecretKey: isConfigured,
        hasPublicKey: Boolean(provider.getPublicKey()),
        publicKey: provider.getPublicKey() || undefined,
        missingEnvVars: provider.getMissingEnvVars()
      });
    }

    return list;
  }
}

// Global Singleton Instance
export const paymentManager = new PaymentManager();
