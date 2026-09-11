import React from 'react';
import { X, Bell, CheckCircle2, AlertCircle, Info, Check } from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../lib/api';

interface NotificationModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onRefresh,
}) => {
  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingle = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1A080E] border border-[#8F1D3A]/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1A080E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8F1D3A]/10 text-[#C13A5A] border border-[#8F1D3A]/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Notifications</h3>
              <p className="text-xs text-slate-400">Updates & Transaction alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#C13A5A] hover:text-[#D46A83] transition-colors flex items-center gap-1 bg-[#A52A4A]/10 px-3 py-1.5 rounded-xl border border-[#A52A4A]/20 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-400">No notifications yet</p>
              <p className="text-xs text-slate-500">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkSingle(n.id)}
                className={`pt-3 first:pt-0 p-3 rounded-2xl transition-all cursor-pointer ${
                  n.read
                    ? 'bg-transparent opacity-75'
                    : 'nivo-glass-surface border border-[#8F1D3A]/20 shadow-md'
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#A52A4A]" />
                    ) : n.type === 'alert' || n.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-[#C13A5A]" />
                    ) : (
                      <Info className="w-5 h-5 text-[#C13A5A]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
