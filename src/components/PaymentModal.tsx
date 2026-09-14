import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Zap,
  Lock,
  Copy,
  Check
} from 'lucide-react';

export interface PaymentConfigProvider {
  name: 'paystack' | 'flutterwave' | 'korapay';
  displayName: string;
  isConfigured: boolean;
  missingEnvVars: string[];
  publicKey?: string;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  token?: string;
  onSuccess?: (result: any) => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type FlowState = 'select' | 'processing' | 'awaiting_payment' | 'verifying' | 'success' | 'failed';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  userName = '',
  token = '',
  onSuccess,
  onToast
}) => {
  const [amount, setAmount] = useState<number>(6500);
  const [providers, setProviders] = useState<PaymentConfigProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<'paystack' | 'flutterwave' | 'korapay'>('paystack');
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'flutterwave' | 'korapay'>('paystack');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [flowState, setFlowState] = useState<FlowState>('select');
  const [activeReference, setActiveReference] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const verifyingRef = useRef(false);

  const getAuthToken = (): string => {
    if (token) return token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nevo_token') || localStorage.getItem('token') || '';
    }
    return '';
  };

  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);
      const authToken = getAuthToken();
      const res = await fetch('/api/payment/config', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        const list = data.providers || [];
        setProviders(list);
        const configured = list.find((p: PaymentConfigProvider) => p.name === data.activeProvider && p.isConfigured)
          || list.find((p: PaymentConfigProvider) => p.isConfigured);
        if (configured) setSelectedProvider(configured.name);
        setActiveProvider(data.activeProvider || configured?.name || 'paystack');
      }
    } catch (err) {
      console.error('Failed to load payment config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setAmount(6500);
    setFlowState('select');
    setActiveReference('');
    setAuthorizationUrl('');
    setErrorMessage('');
    setSuccessData(null);
    setCopied(false);
    fetchConfig();
  }, [isOpen]);

  const currentProviderObj = providers.find(p => p.name === selectedProvider);
  const configuredProviders = providers.filter(p => p.isConfigured);
  const isSelectedProviderConfigured = Boolean(currentProviderObj?.isConfigured);

  const verifyPayment = async (manual = false) => {
    if (!activeReference || verifyingRef.current) return;
    verifyingRef.current = true;
    if (manual) setFlowState('verifying');
    try {
      const authToken = getAuthToken();
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ reference: activeReference, token: authToken })
      });
      const data = await res.json();

      if (data.success && data.status === 'successful' && data.voucherCode) {
        setSuccessData(data);
        setFlowState('success');
        onSuccess?.(data);
        onToast?.('Payment successful. Your deposit is ready.', 'success');
        return 'success';
      }

      if (data.status === 'failed' || data.status === 'abandoned') {
        setErrorMessage(data.message || 'The payment was not completed. No deposit was generated.');
        setFlowState('failed');
        return 'failed';
      }

      if (manual) {
        setErrorMessage(data.message || 'Payment is not confirmed yet. Complete the payment and try again.');
        setFlowState('awaiting_payment');
      }
      return 'pending';
    } catch (err: any) {
      if (manual) {
        setErrorMessage(err.message || 'Could not verify the payment right now.');
        setFlowState('awaiting_payment');
      }
      return 'error';
    } finally {
      verifyingRef.current = false;
    }
  };

  // Automatically verify after checkout. The server talks directly to the selected
  // provider, so the browser never gets to declare a payment successful by itself.
  useEffect(() => {
    if (!isOpen || flowState !== 'awaiting_payment' || !activeReference) return;
    let stopped = false;
    let attempts = 0;

    const poll = async () => {
      if (stopped) return;
      attempts += 1;
      const result = await verifyPayment(false);
      if (stopped || result === 'success' || result === 'failed') return;
      if (attempts < 150) window.setTimeout(poll, 4000);
      else {
        setErrorMessage('We are still waiting for the payment provider. If you completed payment, tap “Check Payment Status”.');
      }
    };

    const timer = window.setTimeout(poll, 2500);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, flowState, activeReference]);

  const handleInitiatePayment = async () => {
    if (!isSelectedProviderConfigured) {
      setErrorMessage('Please select a payment gateway that has its API key configured.');
      return;
    }
    setErrorMessage('');
    setFlowState('processing');

    try {
      const authToken = getAuthToken();
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          amount: 6500,
          provider: selectedProvider,
          purpose: 'wdv_voucher',
          name: userName,
          email: userEmail,
          token: authToken
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Payment initialization failed.');

      setAmount(Number(data.amount || 6500));
      setActiveReference(data.reference);
      setAuthorizationUrl(data.authorizationUrl || '');
      setFlowState('awaiting_payment');

      if (data.authorizationUrl) {
        const popup = window.open(data.authorizationUrl, 'Nevo_WDV_Payment', 'width=500,height=700,menubar=no,toolbar=no');
        if (!popup) onToast?.('Your browser blocked the payment window. Tap “Open Secure Checkout” below.', 'info');
      } else {
        setErrorMessage('The payment gateway did not return a checkout link.');
      }
    } catch (err: any) {
      console.error('deposit payment init error:', err);
      setErrorMessage(err.message || 'Payment could not be initialized.');
      setFlowState('failed');
    }
  };

  const copyVoucher = async () => {
    const code = successData?.voucherCode || '';
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onToast?.('Voucher copied!', 'success');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      onToast?.('Could not copy the voucher. Please copy it manually.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20"><CreditCard className="h-5 w-5" /></div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display">Buy Deposit</h3>
              <p className="text-[11px] text-slate-400">Secure payment • Voucher issued after server verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {flowState === 'select' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/15 via-slate-950 to-indigo-500/15 border border-teal-500/25 text-center">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-teal-300">Deposit</span>
                <div className="text-3xl font-black text-white mt-2">₦6,500.00</div>
                <p className="text-xs text-slate-400 mt-2">One-time purchase. The voucher is generated only after the gateway confirms your payment.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Payment Gateway</span>
                  <span className="text-[10px] text-teal-400 font-mono">Secure Checkout</span>
                </div>
                {loadingConfig ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">Checking available payment gateways…</div>
                ) : configuredProviders.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">No payment gateway is configured yet. Add a Paystack, Flutterwave, or Korapay secret key in the server environment.</div>
                ) : (
                  <div className="space-y-2">
                    {providers.map(p => {
                      if (!p.isConfigured) return null;
                      const selected = selectedProvider === p.name;
                      return (
                        <button key={p.name} type="button" onClick={() => setSelectedProvider(p.name)} className={`w-full p-3 rounded-2xl border text-left transition-all ${selected ? 'bg-teal-500/10 border-teal-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-teal-400"><Zap className="h-4 w-4" /></div>
                              <div>
                                <span className="text-xs font-bold text-white block">{p.displayName}</span>
                                <span className="text-[10px] text-slate-400">Online card/bank checkout</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400">READY</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errorMessage && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex gap-2"><AlertCircle className="h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}

              <button type="button" onClick={handleInitiatePayment} disabled={!isSelectedProviderConfigured || loadingConfig} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20">
                DEPOSIT FUNDS — ₦6,500
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono"><Lock className="h-3 w-3" /> Server-side payment verification</div>
            </div>
          )}

          {flowState === 'processing' && (
            <div className="py-14 text-center space-y-4">
              <div className="relative mx-auto h-16 w-16"><div className="h-16 w-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" /><CreditCard className="h-6 w-6 text-teal-400 absolute inset-0 m-auto" /></div>
              <div><h4 className="text-base font-bold text-white">Opening Secure Checkout…</h4><p className="text-xs text-slate-400 mt-1">Creating your ₦6,500 deposit session.</p></div>
            </div>
          )}

          {(flowState === 'awaiting_payment' || flowState === 'verifying') && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-center">
                <CheckCircle2 className="h-7 w-7 text-teal-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Complete Your Payment</h4>
                <p className="text-xs text-slate-400 mt-1">We will verify the payment automatically. Your voucher will not be created until the provider confirms ₦6,500 was paid.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Amount</span><span className="font-bold text-white">₦6,500.00</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Gateway</span><span className="font-bold text-teal-300">{currentProviderObj?.displayName || activeProvider}</span></div>
                <div className="flex justify-between text-xs gap-3"><span className="text-slate-500">Reference</span><span className="font-mono font-bold text-white truncate">{activeReference}</span></div>
              </div>
              {authorizationUrl && <a href={authorizationUrl} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700"><ExternalLink className="h-4 w-4" /> Open Secure Checkout</a>}
              {errorMessage && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">{errorMessage}</div>}
              <button type="button" onClick={() => verifyPayment(true)} disabled={flowState === 'verifying'} className="w-full py-3 rounded-xl bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-black uppercase flex items-center justify-center gap-2">
                {flowState === 'verifying' ? <><RefreshCw className="h-4 w-4 animate-spin" /> Checking Payment…</> : <><RefreshCw className="h-4 w-4" /> Check Payment Status</>}
              </button>
              <p className="text-[10px] text-center text-slate-500">Do not close the payment page until the gateway confirms your payment.</p>
            </div>
          )}

          {flowState === 'success' && (
            <div className="py-4 space-y-5 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center"><CheckCircle2 className="h-8 w-8" /></div>
              <div><h4 className="text-xl font-black text-white">Payment Successful</h4><p className="text-xs text-slate-400 mt-1">Your Deposit is Ready.</p></div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <p className="text-xs text-slate-400">₦6,500.00 payment received successfully.</p>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Deposit</span>
                  <span className="font-mono text-lg font-black tracking-widest text-teal-300 select-all">{successData?.voucherCode}</span>
                </div>
                <button type="button" onClick={copyVoucher} className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black uppercase flex items-center justify-center gap-2">
                  {copied ? <><Check className="h-4 w-4" /> Voucher copied!</> : <><Copy className="h-4 w-4" /> Copy Voucher</>}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">The voucher has been saved to the Nevo WDV system and linked to this successful payment.</p>
              <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">Close</button>
            </div>
          )}

          {flowState === 'failed' && (
            <div className="py-6 space-y-4 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center"><AlertCircle className="h-8 w-8" /></div>
              <div><h4 className="text-base font-bold text-white">Payment Not Completed</h4><p className="text-xs text-rose-300 mt-1 leading-relaxed">{errorMessage || 'The payment was not confirmed. No deposit was generated.'}</p></div>
              <div className="flex gap-2"><button type="button" onClick={() => { setErrorMessage(''); setFlowState('select'); }} className="flex-1 py-3 rounded-xl bg-teal-400 text-slate-950 text-xs font-black">Try Again</button><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 text-white text-xs font-bold">Close</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
