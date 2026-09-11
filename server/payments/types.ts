export type PaymentProviderType = 'paystack' | 'flutterwave' | 'korapay';

export interface InitializePaymentParams {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  amount: number;
  currency?: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializationResult {
  provider: PaymentProviderType;
  reference: string;
  checkoutUrl: string;
  accessCode?: string;
  currency: string;
  amount: number;
  rawResponse?: any;
}

export interface PaymentVerificationResult {
  provider: PaymentProviderType;
  reference: string;
  providerReference?: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending';
  paidAt?: string;
  rawResponse?: any;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  provider: PaymentProviderType;
  reference?: string;
  providerReference?: string;
  amount?: number;
  currency?: string;
  status?: 'successful' | 'failed' | 'pending';
  event?: string;
  rawBody?: any;
}

export interface ProviderConfigStatus {
  id: PaymentProviderType;
  name: string;
  isConfigured: boolean;
  missingCredentials: string[];
  requiredEnvVars: string[];
  isDefault: boolean;
  webhookUrl: string;
}

export interface IPaymentProvider {
  readonly id: PaymentProviderType;
  readonly name: string;
  isConfigured(): boolean;
  getMissingCredentials(): string[];
  getRequiredEnvVars(): string[];
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult>;
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;
  verifyWebhook(headers: Record<string, any>, rawBody: any): Promise<WebhookVerificationResult>;
  getBankList?(): Promise<{ name: string; code: string }[]>;
  resolveBankAccount?(accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }>;
}
