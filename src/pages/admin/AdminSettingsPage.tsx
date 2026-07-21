import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { SiteSettings } from '../../types';
import { api } from '../../lib/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable state
  const [appName, setAppName] = useState('Nivo Cash App');
  const [supportEmail, setSupportEmail] = useState('support@nivocash.app');
  const [telegramChannel, setTelegramChannel] = useState('https://t.me/nivocash');
  const [minDeposit, setMinDeposit] = useState('1000');
  const [minWithdrawal, setMinWithdrawal] = useState('2000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState('');

  const fetchSettings = async () => {
    try {
      const data = await api.getAdminSettings();
      setSettings(data);
      setAppName(data.appName);
      setSupportEmail(data.supportEmail);
      setTelegramChannel(data.telegramChannel);
      setMinDeposit(data.minDeposit.toString());
      setMinWithdrawal(data.minWithdrawal.toString());
      setMaintenanceMode(data.maintenanceMode);
      setAnnouncementBanner(data.announcementBanner || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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
        <p className="text-xs text-zinc-400 mt-1">Configure limits, announcement notice, support channels, and system maintenance</p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-zinc-500 text-xs">Loading configuration...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Application Branding Name</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Official Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Telegram Community Link</label>
              <input
                type="text"
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Minimum Deposit (₦)</label>
              <input
                type="number"
                required
                value={minDeposit}
                onChange={(e) => setMinDeposit(e.target.value)}
                className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Minimum Withdrawal (₦)</label>
              <input
                type="number"
                required
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500"
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
              className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-4 bg-[#171b26] border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Maintenance Mode
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">When active, non-admin users cannot access dashboard features.</p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                maintenanceMode
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {maintenanceMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving System Changes...' : 'Save Configuration Changes'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
