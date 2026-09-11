import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  AlertCircle,
  ShieldAlert,
  CreditCard,
  Copy,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { SiteSettings, PaymentOverviewResponse } from '../../types';
import { api } from '../../lib/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [paymentOverview, setPaymentOverview] = useState<PaymentOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingPayments, setRefreshingPayments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Editable state
  const [appName, setAppName] = useState('Nivo Cash App');
  const [supportEmail, setSupportEmail] = useState('support@nivocash.app');
  const [telegramChannel, setTelegramChannel] = useState('https://t.me/nivocash');
  const [minDeposit, setMinDeposit] = useState('1000');
  const [minWithdrawal, setMinWithdrawal] = useState('2000');
  const [activationFeeAmount, setActivationFeeAmount] = useState('520');
  const [paymentProvider, setPaymentProvider] = useState<'auto' | 'paystack' | 'flutterwave' | 'korapay'>('auto');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState('');

  const fetchSettings = async () => {
    try {
      const [settingsData, paymentsData] = await Promise.all([
        api.getAdminSettings(),
        api.getAdminPaymentOverview().catch(() => null),
      ]);

      setSettings(settingsData);
      setAppName(settingsData.appName);
      setSupportEmail(settingsData.supportEmail);
      setTelegramChannel(settingsData.telegramChannel);
      setMinDeposit(settingsData.minDeposit.toString());
      setMinWithdrawal(settingsData.minWithdrawal.toString());
      setActivationFeeAmount((settingsData.activationFeeAmount || 520).toString());
      setPaymentProvider(settingsData.paymentProvider || 'auto');
      setMaintenanceMode(settingsData.maintenanceMode);
      setAnnouncementBanner(settingsData.announcementBanner || '');

      if (paymentsData) {
        setPaymentOverview(paymentsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRefreshPaymentStatus = async () => {
    setRefreshingPayments(true);
    try {
      const paymentsData = await api.getAdminPaymentOverview();
      setPaymentOverview(paymentsData);
      setMsg({ type: 'success', text: 'Payment provider statuses refreshed.' });
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Could not refresh payment providers.' });
    } finally {
      setRefreshingPayments(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateAdminSettings({
        appName,
        supportEmail,
        telegramChannel,
        minDeposit: Number(minDeposit),
        minWithdrawal: Number(minWithdrawal),
        activationFeeAmount: Number(activationFeeAmount),
        paymentProvider,
        maintenanceMode,
        announcementBanner,
      });
      setSettings(updated);
      setMsg({ type: 'success', text: 'System settings updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-zinc-300" />
          Global Platform Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure payment gateways, deposit limits, announcement notice, and platform operations.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-[#8F1D3A]/10 border-[#8F1D3A]/30 text-[#A52A4A]'
              : 'bg-[#8F1D3A]/10 border-[#8F1D3A]/30 text-[#C13A5A]'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-zinc-400 text-xs">Loading platform configuration...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PAYMENT GATEWAY MANAGEMENT SECTION */}
          <div className="p-5 sm:p-6 nivo-glass-surface border border-[#8F1D3A]/30 rounded-3xl space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8F1D3A]/20 text-[#A52A4A] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Payment Gateway Infrastructure</h3>
                  <p className="text-[11px] text-zinc-400">
                    Supports Paystack, Flutterwave, and Korapay without hardcoded secrets.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefreshPaymentStatus}
                disabled={refreshingPayments}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingPayments ? 'animate-spin' : ''}`} />
                <span>Test Gateway Status</span>
              </button>
            </div>

            {/* Active Provider Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300">
                Active Payment Provider Routing
              </label>
              <select
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value as any)}
                className="w-full bg-[#16090D] border border-zinc-700 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-[#8F1D3A] transition-colors cursor-pointer"
              >
                <option value="auto">Auto-Detect (Prioritizes first configured provider with valid credentials)</option>
                <option value="paystack">Force Paystack Gateway</option>
                <option value="flutterwave">Force Flutterwave Gateway</option>
                <option value="korapay">Force Korapay Gateway</option>
              </select>
              <p className="text-[11px] text-zinc-400">
                Current active provider resolved by backend:{' '}
                <span className="font-bold text-[#C13A5A] uppercase">
                  {paymentOverview?.activeProvider || 'None Configured'}
                </span>
              </p>
            </div>

            {/* Provider Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {paymentOverview?.providers.map((prov) => {
                const webhookUrl = `${window.location.origin}/api/payments/webhook/${prov.id}`;
                return (
                  <div
                    key={prov.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      prov.isConfigured
                        ? 'bg-[#16090D] border-[#8F1D3A]/30'
                        : 'bg-[#16090D] border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">{prov.name}</span>
                      {prov.isConfigured ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8F1D3A]/20 text-[#A52A4A] border border-[#8F1D3A]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8F1D3A]/15 text-[#C13A5A] border border-[#8F1D3A]/30">
                          Missing Keys
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2 text-[11px]">
                      {prov.isConfigured ? (
                        <p className="text-[#A52A4A]/90 font-medium">
                          ✓ Secret key configured in environment. Available for deposits.
                        </p>
                      ) : (
                        <div className="text-zinc-400 space-y-1">
                          <p className="text-[#C13A5A]/90 font-semibold">Missing environment variables:</p>
                          <ul className="list-disc list-inside text-[10px] font-mono text-zinc-300">
                            {prov.missingVariables.map((v) => (
                              <li key={v}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 border-t border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                          Webhook URL
                        </span>
                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1.5 rounded-lg font-mono text-[10px] text-zinc-300">
                          <span className="truncate flex-1">{webhookUrl}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(webhookUrl, prov.id)}
                            className="text-zinc-400 hover:text-white transition-colors"
                            title="Copy Webhook URL"
                          >
                            {copiedUrl === prov.id ? (
                              <Check className="w-3 h-3 text-[#A52A4A]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GENERAL PLATFORM SETTINGS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Platform Brand Name</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#8F1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#8F1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Telegram Community Link</label>
              <input
                type="text"
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#8F1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Minimum Deposit (₦)</label>
              <input
                type="number"
                required
                value={minDeposit}
                onChange={(e) => setMinDeposit(e.target.value)}
                className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-[#C13A5A] font-bold text-xs focus:outline-none focus:border-[#8F1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Minimum Withdrawal (₦)</label>
              <input
                type="number"
                required
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-[#C13A5A] font-bold text-xs focus:outline-none focus:border-[#8F1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Activation Fee (₦)</label>
              <input
                type="number"
                required
                value={activationFeeAmount}
                onChange={(e) => setActivationFeeAmount(e.target.value)}
                className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-[#C13A5A] font-bold text-xs focus:outline-none focus:border-[#8F1D3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Global Announcement Banner Notice</label>
            <input
              type="text"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="e.g. Welcome to Nivo Cash App! Refer friends and earn ₦1,200 per user!"
              className="w-full nivo-glass-surface border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#8F1D3A]"
            />
          </div>

          <div className="p-4 nivo-glass-surface border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#C13A5A]" />
                Maintenance Mode
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">When active, non-admin users cannot access dashboard features.</p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                maintenanceMode
                  ? 'bg-[#8F1D3A] text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {maintenanceMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#8F1D3A] hover:bg-[#A52A4A] disabled:opacity-50 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-[#8F1D3A]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving System Changes...' : 'Save Configuration Changes'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
