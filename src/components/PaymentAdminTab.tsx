import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  Database,
  Check
} from 'lucide-react';
import GlassCard from './GlassCard';
import { PaymentConfigProvider } from './PaymentModal';

interface PaymentTransactionRecord {
  id: string;
  reference: string;
  userEmail: string;
  userName?: string;
  amount: number;
  currency: string;
  provider: string;
  providerReference?: string;
  purpose: string;
  status: string;
  channel?: string;
  createdAt: string;
  verifiedAt?: string;
}

interface PaymentAdminTabProps {
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  getAdminHeaders: () => Record<string, string>;
}

export const PaymentAdminTab: React.FC<PaymentAdminTabProps> = ({
  onToast,
  getAdminHeaders
}) => {
  const [providers, setProviders] = useState<PaymentConfigProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('korapay');
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingProvider, setSwitchingProvider] = useState(false);
  const [reVerifyingRef, setReVerifyingRef] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);

  // Fetch admin payment gateway configuration
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/payment-config', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers || []);
        setActiveProvider(data.activeProvider || 'korapay');
      }
    } catch (err) {
      console.error('Failed to fetch admin payment config:', err);
    }
  };

  // Fetch payment transactions ledger
  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/payment-transactions', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch payment transactions:', err);
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([fetchConfig(), fetchTransactions()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  // Handle setting active provider
  const handleSetActiveProvider = async (providerName: string) => {
    setSwitchingProvider(true);
    try {
      const res = await fetch('/api/admin/payment-config/active-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ provider: providerName })
      });
      const data = await res.json();
      if (data.success) {
        setActiveProvider(providerName);
        onToast(`Active payment provider set to ${providerName.toUpperCase()}`, 'success');
        await fetchConfig();
      } else {
        onToast(data.error || 'Failed to switch payment provider', 'error');
      }
    } catch (err) {
      onToast('Network error updating provider', 'error');
    } finally {
      setSwitchingProvider(false);
    }
  };

  // Handle manual verification of transaction
  const handleManualReVerify = async (ref: string) => {
    setReVerifyingRef(ref);
    try {
      const res = await fetch('/api/admin/payment-transactions/manual-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ reference: ref })
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Transaction ${ref} verified and settled!`, 'success');
        await fetchTransactions();
      } else {
        onToast(data.message || 'Transaction is still unconfirmed or failed at provider.', 'info');
      }
    } catch (err) {
      onToast('Network error during manual verification', 'error');
    } finally {
      setReVerifyingRef(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(label);
    onToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedWebhook(null), 2000);
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';

  const filteredTransactions = transactions.filter(t => {
    const term = searchFilter.toLowerCase();
    return (
      (t.reference || '').toLowerCase().includes(term) ||
      (t.userEmail || (t as any).useremail || '').toLowerCase().includes(term) ||
      (t.provider || '').toLowerCase().includes(term) ||
      (t.purpose || '').toLowerCase().includes(term) ||
      (t.status || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header Banner */}
      <GlassCard className="p-5 border-white/5 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-teal-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>Nigerian Payment Gateway System</span>
                <span className="text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  KoraPay
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage live payment adapters, environment credentials, and real-time transaction ledger.
              </p>
            </div>
          </div>

          <button
            onClick={reloadAll}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-teal-400 hover:text-teal-300 hover:border-slate-700 transition-all cursor-pointer shadow-sm w-fit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </GlassCard>

      {/* Gateway Providers Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => {
          const isActive = activeProvider === p.name;
          const webhookUrl = `${originUrl}/api/payment/webhook/${p.name}`;

          return (
            <GlassCard
              key={p.name}
              className={`p-5 space-y-4 border transition-all ${
                isActive
                  ? 'border-teal-500/50 bg-teal-950/10 shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                  : 'border-white/5 bg-slate-950/40 hover:border-white/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl border ${
                    p.isConfigured
                      ? 'bg-teal-500/15 text-teal-400 border-teal-500/25'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                  }`}>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white font-display">
                      {p.displayName}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Provider Adapter
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Active Gateway
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetActiveProvider(p.name)}
                    disabled={switchingProvider || !p.isConfigured}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-teal-500/40 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Set as Active
                  </button>
                )}
              </div>

              {/* Status & Credential Check */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[11px]">API Status:</span>
                  {p.isConfigured ? (
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Configured &amp; Live
                    </span>
                  ) : (
                    <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Missing API Keys
                    </span>
                  )}
                </div>

                {p.missingEnvVars && p.missingEnvVars.length > 0 && (
                  <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Missing Environment Variables:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {p.missingEnvVars.map(v => (
                        <li key={v} className="text-amber-300 font-semibold">{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Webhook Endpoint */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                  Webhook URL (Copy to {p.displayName} Dashboard):
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, `${p.displayName} Webhook`)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {copiedWebhook === `${p.displayName} Webhook` ? (
                      <Check className="h-3.5 w-3.5 text-teal-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Payment Transactions Ledger */}
      <GlassCard className="p-5 border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-400" />
            <div>
              <h5 className="text-sm font-bold text-white font-display">
                Authoritative Payment Transactions Ledger
              </h5>
              <p className="text-[11px] text-slate-400">
                Live records from database with provider verification receipts and audit trails
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, user, provider..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Reference / ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Gateway</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const txRef = tx.reference || tx.id;
                  const isSuccess = tx.status === 'successful' || tx.status === 'settled';
                  const isPending = tx.status === 'pending';
                  const txEmail = tx.userEmail || (tx as any).useremail || 'Customer';
                  const dateStr = new Date(tx.createdAt || (tx as any).createdat || Date.now()).toLocaleDateString();

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-bold text-white max-w-[160px] truncate">
                        {txRef}
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-[160px] truncate">
                        {txEmail}
                      </td>
                      <td className="py-3 px-3 font-bold text-teal-400">
                        ₦{Number(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 uppercase text-indigo-300 font-bold">
                        {tx.provider || 'korapay'}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {tx.purpose === 'legacyVoucher_voucher' ? 'LEGACY_VOUCHER Voucher' : 'Wallet Funding'}
                      </td>
                      <td className="py-3 px-3">
                        {isSuccess ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            SUCCESS
                          </span>
                        ) : isPending ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold animate-pulse">
                            PENDING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
                            {String(tx.status).toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isPending && (
                          <button
                            onClick={() => handleManualReVerify(txRef)}
                            disabled={reVerifyingRef === txRef}
                            className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            {reVerifyingRef === txRef ? 'Verifying...' : 'Re-Verify API'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
