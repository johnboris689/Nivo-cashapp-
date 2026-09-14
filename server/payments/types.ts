export type PaymentProviderType = 'korapay';

export interface InitializePaymentParams {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  amount: number;
  currency?: string;
  reference: string;
  callbackUrl: string;
  notificationUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializationResult {
  provider: PaymentProviderType;
  reference: string;
  checkoutUrl: string;
  currency: string;
  amount: number;
  rawResponse?: any;
  message?: string;
}

export interface PaymentVerificationResult {
  provider: PaymentProviderType;
  reference: string;
  providerReference?: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending';
  success?: boolean;
  paidAt?: string;
  customerEmail?: string;
  customerName?: string;
  channel?: string;
  rawResponse?: any;
  message?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  provider: PaymentProviderType;
  reference?: string;
  providerReference?: string;
  amount?: number;
  currency?: string;
  status?: 'successful' | 'failed' | 'pending';
  success?: boolean;
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
  readonly displayName?: string;
  isConfigured(): boolean;
  getMissingCredentials(): string[];
  getRequiredEnvVars(): string[];
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult>;
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;
  verifyWebhook(headers: Record<string, any>, rawBody: any): Promise<WebhookVerificationResult>;
  getBankList?(): Promise<{ name: string; code: string }[]>;
  resolveBankAccount?(accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }>;
}
