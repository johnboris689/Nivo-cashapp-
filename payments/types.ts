export type PaymentProviderName = 'paystack' | 'flutterwave' | 'korapay';

export interface InitializePaymentParams {
  amount: number; // in NGN
  email: string;
  name?: string;
  phone?: string;
  reference: string;
  callbackUrl: string;
  purpose?: string; // 'wallet_funding' | 'wdv_voucher'
  metadata?: Record<string, any>;
}

export interface InitializePaymentResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  provider: PaymentProviderName;
  message?: string;
  rawResponse?: any;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'successful' | 'failed' | 'pending' | 'abandoned';
  amount: number; // in NGN
  currency: string;
  reference: string;
  providerReference?: string;
  customerEmail?: string;
  customerName?: string;
  paidAt?: string;
  channel?: string;
  provider: PaymentProviderName;
  message?: string;
  rawResponse?: any;
}

export interface WebhookEventResult {
  isValid: boolean;
  event?: string;
  status?: 'successful' | 'failed' | 'pending';
  reference?: string;
  providerReference?: string;
  amount?: number; // in NGN
  customerEmail?: string;
  provider: PaymentProviderName;
  rawData?: any;
  message?: string;
}

export interface ProviderStatusInfo {
  name: PaymentProviderName;
  displayName: string;
  isConfigured: boolean;
  isActive: boolean;
  hasSecretKey: boolean;
  hasPublicKey: boolean;
  publicKey?: string;
  missingEnvVars: string[];
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  readonly displayName: string;
  isConfigured(): boolean;
  getPublicKey(): string | null;
  getMissingEnvVars(): string[];
  initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult>;
  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
  verifyWebhookSignature(headers: Record<string, any>, rawBody: string): boolean;
  parseWebhook(headers: Record<string, any>, rawBody: string, jsonBody: any): Promise<WebhookEventResult>;
}
