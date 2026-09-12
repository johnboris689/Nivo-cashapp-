import React from 'react';
import { Smartphone, Monitor, Globe, ShieldAlert, CheckCircle, AlertTriangle, LogOut, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { DeviceSession, LoginHistoryItem } from '../types';
import GlassCard from './GlassCard';

interface DevicesHistoryProps {
  devices: DeviceSession[];
  onLogoutDevice: (id: string) => void;
  onLogoutAllOtherDevices: () => void;
  loginHistory: LoginHistoryItem[];
  onBack: () => void;
}

export function DeviceManagement({
  devices,
  onLogoutDevice,
  onLogoutAllOtherDevices
}: {
  devices: DeviceSession[];
  onLogoutDevice: (id: string) => void;
  onLogoutAllOtherDevices: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400">Active Devices</h5>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage and revoke active sessions on your account</p>
        </div>
        {devices.length > 1 && (
          <button
            onClick={onLogoutAllOtherDevices}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Logout Other Devices
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              device.isCurrent
                ? 'bg-[#1e1b4b]/20 border-teal-500/30'
                : 'bg-white/5 border-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                {device.os.toLowerCase().includes('windows') || device.os.toLowerCase().includes('mac') ? (
                  <Monitor className="h-4.5 w-4.5 text-indigo-400" />
                ) : (
                  <Smartphone className="h-4.5 w-4.5 text-teal-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">{device.name}</span>
                  {device.isCurrent && (
                    <span className="text-[8px] font-black uppercase bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded-full font-mono">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-mono">
                  <span>{device.browser} on {device.os}</span>
                  <span>&bull;</span>
                  <span>Active: {device.lastActivity}</span>
                </div>
              </div>
            </div>

            {!device.isCurrent && (
              <button
                onClick={() => onLogoutDevice(device.id)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                title="Revoke session"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoginHistory({
  history
}: {
  history: LoginHistoryItem[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400">Login Activity Logs</h5>
        <p className="text-[10px] text-slate-400 mt-0.5">Audit history of access requests to your wallet</p>
      </div>

      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">No records found.</div>
        ) : (
          history.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">{log.device}</span>
                  <span className="text-[9px] text-slate-400">({log.browser})</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                  <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {log.location}</span>
                  <span>&bull;</span>
                  <span>IP: {log.ip}</span>
                </div>
                <div className="text-[8px] text-slate-500 font-mono">
                  {log.date} &bull; {log.time}
                </div>
              </div>

              <div>
                {log.status === 'success' ? (
                  <span className="text-[8px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Success
                  </span>
                ) : log.status === 'locked' ? (
                  <span className="text-[8px] font-bold font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md">
                    LOCKED
                  </span>
                ) : (
                  <span className="text-[8px] font-bold font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    Failed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DevicesHistory({
  devices,
  onLogoutDevice,
  onLogoutAllOtherDevices,
  loginHistory,
  onBack
}: DevicesHistoryProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'devices' | 'history'>('devices');

  return (
    <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
        >
          &larr; Settings
        </button>
        <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Security Audits</h4>
      </div>

      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveSubTab('devices')}
          className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeSubTab === 'devices' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400'
          }`}
        >
          Devices ({devices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeSubTab === 'history' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400'
          }`}
        >
          Login History
        </button>
      </div>

      <GlassCard className="p-4 bg-slate-900/40 border-white/5">
        {activeSubTab === 'devices' ? (
          <DeviceManagement
            devices={devices}
            onLogoutDevice={onLogoutDevice}
            onLogoutAllOtherDevices={onLogoutAllOtherDevices}
          />
        ) : (
          <LoginHistory history={loginHistory} />
        )}
      </GlassCard>
    </div>
  );
}
