import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Inbox, 
  ArrowLeft, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Ticket, 
  RefreshCw, 
  Send, 
  Smartphone, 
  Wifi, 
  ShieldCheck, 
  Clock,
  Building2,
  User,
  Hash,
  Coins,
  ChevronRight
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead
}: NotificationsModalProps) {
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSelectNotif = (notif: NotificationItem) => {
    setSelectedNotif(notif);
    // Mark read automatically on open
    if (notif.unread) {
      onMarkRead(notif.id);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper to parse and extract structured fields cleanly
  const parseNotif = (notif: NotificationItem) => {
    const body = notif.body || '';
    const title = notif.title || '';
    const combined = `${title} ${body}`;

    // Category & Type
    let category = notif.category;
    if (!category) {
      if (/withdraw/i.test(combined)) category = 'Withdrawal';
      else if (/voucher|legacyVoucher/i.test(combined)) category = 'LEGACY_VOUCHER Voucher';
      else if (/daily|allocation|refreshed/i.test(combined)) category = 'Daily Refreshed Balance';
      else if (/transfer|cashout/i.test(combined)) category = 'Bank Transfer';
      else if (/airtime/i.test(combined)) category = 'Airtime Topup';
      else if (/data/i.test(combined)) category = 'Data Bundle';
      else if (/bill/i.test(combined)) category = 'Bill Payment';
      else if (/security|login|password/i.test(combined)) category = 'Account Security';
      else category = 'System Notice';
    }

    // Status
    let status = notif.status;
    if (!status) {
      if (/pending|review/i.test(combined)) status = 'Pending Review';
      else if (/verified|confirmed/i.test(combined)) status = 'Payment Verified';
      else if (/success|completed|active/i.test(combined)) status = 'Completed';
      else status = 'Completed';
    }

    // Amount
    let amount = notif.amount;
    if (!amount) {
      const amtMatch = combined.match(/(?:₦|NGN|\$)\s*([\d,]+(?:\.\d+)?)/i) || combined.match(/(?:amount|added|refreshed|of)\s*(?:of)?\s*(?:₦|NGN)?\s*([\d,]+)/i);
      if (amtMatch) amount = amtMatch[1];
    }

    // Voucher Code
    let voucherCode = notif.voucherCode;
    if (!voucherCode) {
      const vMatch = combined.match(/(LEGACY_VOUCHER-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}|LEGACY_VOUCHER-[A-Z0-9-]+)/i);
      if (vMatch) voucherCode = vMatch[1];
    }

    // Reference
    let reference = notif.reference;
    if (!reference) {
      const refMatch = combined.match(/(WDR-[\w\d]+|KORA_DVA_[\w\d]+|DVA_[\w\d]+|REF-[\w\d]+|Ref:\s*([\w\d_-]+))/i);
      if (refMatch) reference = refMatch[2] || refMatch[1];
    }

    // Recipient & Bank Name
    let recipientName = notif.recipientName;
    let bankName = notif.bankName;
    if (!recipientName) {
      const recMatch = combined.match(/to\s+([A-Z\s]{3,35})\s*(?:\(([^)]+)\))?/i);
      if (recMatch) {
        recipientName = recMatch[1].trim();
        if (!bankName && recMatch[2]) bankName = recMatch[2].trim();
      }
    }

    // Date & Time
    const d = new Date(notif.date);
    const isValidDate = !isNaN(d.getTime());
    const dateStr = isValidDate ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : notif.date;
    const timeStr = isValidDate ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

    return {
      category,
      status,
      amount,
      voucherCode,
      reference,
      recipientName,
      bankName,
      senderName: notif.senderName,
      phoneNumber: notif.phoneNumber,
      accountNumber: notif.accountNumber,
      dateStr,
      timeStr
    };
  };

  // Icon & Theme mapping
  const getIconAndStyle = (categoryStr: string) => {
    switch (categoryStr.toLowerCase()) {
      case 'withdrawal':
        return {
          icon: <Clock className="h-6 w-6 text-amber-500" />,
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          glow: 'bg-amber-500/10 border-amber-500/20'
        };
      case 'legacyVoucher voucher':
        return {
          icon: <Ticket className="h-6 w-6 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          glow: 'bg-emerald-500/10 border-emerald-500/20'
        };
      case 'daily refreshed balance':
      case 'wallet':
        return {
          icon: <RefreshCw className="h-6 w-6 text-indigo-400" />,
          badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          glow: 'bg-indigo-500/10 border-indigo-500/20'
        };
      case 'bank transfer':
        return {
          icon: <Send className="h-6 w-6 text-blue-400" />,
          badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          glow: 'bg-blue-500/10 border-blue-500/20'
        };
      case 'airtime topup':
        return {
          icon: <Smartphone className="h-6 w-6 text-purple-400" />,
          badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          glow: 'bg-purple-500/10 border-purple-500/20'
        };
      case 'data bundle':
        return {
          icon: <Wifi className="h-6 w-6 text-cyan-400" />,
          badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          glow: 'bg-cyan-500/10 border-cyan-500/20'
        };
      case 'account security':
        return {
          icon: <ShieldCheck className="h-6 w-6 text-teal-400" />,
          badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
          glow: 'bg-teal-500/10 border-teal-500/20'
        };
      default:
        return {
          icon: <Bell className="h-6 w-6 text-indigo-400" />,
          badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          glow: 'bg-indigo-500/10 border-indigo-500/20'
        };
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s.includes('pending')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s.includes('verified') || s.includes('confirmed')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('completed') || s.includes('success')) {
      return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container Sheet */}
      <div className="relative bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg mx-auto w-full z-10 transition-all duration-300 max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden text-white">
        
        {/* VIEW 1: NOTIFICATION DETAILS VIEW */}
        {selectedNotif ? (() => {
          const details = parseNotif(selectedNotif);
          const style = getIconAndStyle(details.category);
          const statusStyle = getStatusBadge(details.status);

          return (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
                <button
                  id="btn-back-to-notifs"
                  type="button"
                  onClick={() => setSelectedNotif(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 border border-slate-700/60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Notification Details</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Details Body */}
              <div className="overflow-y-auto no-scrollbar flex-1 space-y-4 pr-1">
                {/* Hero Header */}
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
                  <div className={`p-3.5 rounded-2xl border ${style.glow} mb-3 shadow-lg shadow-indigo-950/50`}>
                    {style.icon}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${style.badgeBg}`}>
                      {details.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusStyle}`}>
                      {details.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white mt-1 leading-snug">
                    {selectedNotif.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {details.dateStr} {details.timeStr ? `• ${details.timeStr}` : ''}
                  </p>
                </div>

                {/* Structured Metadata Grid */}
                <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80 space-y-3 text-xs">
                  
                  {/* Status row */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" /> Status
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusStyle}`}>
                      {details.status}
                    </span>
                  </div>

                  {/* Amount / Amount Added row */}
                  {details.amount !== undefined && details.amount !== null && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-teal-400" /> Amount
                      </span>
                      <span className="text-sm font-bold text-teal-400 font-mono">
                        ₦{typeof details.amount === 'number' ? details.amount.toLocaleString() : details.amount}
                      </span>
                    </div>
                  )}

                  {/* Recipient Name */}
                  {details.recipientName && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-500" /> Recipient
                      </span>
                      <span className="font-semibold text-slate-200 text-right uppercase tracking-tight">
                        {details.recipientName}
                      </span>
                    </div>
                  )}

                  {/* Bank Name */}
                  {details.bankName && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" /> Bank
                      </span>
                      <span className="font-semibold text-slate-200 text-right">
                        {details.bankName}
                      </span>
                    </div>
                  )}

                  {/* Account Number */}
                  {details.accountNumber && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-slate-500" /> Account Number
                      </span>
                      <span className="font-mono font-semibold text-slate-300">
                        {details.accountNumber}
                      </span>
                    </div>
                  )}

                  {/* Phone Number */}
                  {details.phoneNumber && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-slate-500" /> Phone Number
                      </span>
                      <span className="font-mono font-semibold text-slate-300">
                        {details.phoneNumber}
                      </span>
                    </div>
                  )}

                  {/* Voucher Code */}
                  {details.voucherCode && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 bg-teal-950/20 px-2.5 rounded-xl border-teal-900/30">
                      <span className="text-teal-300 font-semibold flex items-center gap-1.5">
                        <Ticket className="h-3.5 w-3.5 text-teal-400" /> Voucher Code
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(details.voucherCode!, 'voucher')}
                        className="flex items-center gap-1.5 font-mono font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 rounded-lg transition-all active:scale-95"
                      >
                        <span>{details.voucherCode}</span>
                        {copiedField === 'voucher' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-teal-400" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Submitted Date */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" /> Submitted
                    </span>
                    <span className="font-mono text-slate-300">
                      {details.dateStr} {details.timeStr ? `at ${details.timeStr}` : ''}
                    </span>
                  </div>

                  {/* Reference ID */}
                  {details.reference && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-slate-500" /> Reference
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(details.reference!, 'ref')}
                        className="flex items-center gap-1 font-mono text-[11px] text-slate-300 hover:text-white transition-colors"
                      >
                        <span>{details.reference}</span>
                        {copiedField === 'ref' ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-slate-500" />
                        )}
                      </button>
                    </div>
                  )}

                </div>

                {/* Description Card */}
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Description
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedNotif.body}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center gap-3 mt-2">
                {details.voucherCode && (
                  <button
                    type="button"
                    onClick={() => handleCopy(details.voucherCode!, 'voucher_btn')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all active:scale-95"
                  >
                    {copiedField === 'voucher_btn' ? (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span>Copied Voucher Code!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Voucher Code</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNotif(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700/60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Notifications</span>
                </button>
              </div>
            </div>
          );
        })() : (
          /* VIEW 2: NOTIFICATIONS LIST */
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Notifications</h3>
                  <p className="text-xs text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All announcements read'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    id="btn-mark-all-read"
                    type="button"
                    onClick={onMarkAllRead}
                    className="p-2 rounded-xl hover:bg-slate-800 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-500/20 bg-indigo-500/5"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Mark all read</span>
                  </button>
                )}
                <button
                  id="btn-close-notif-modal"
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="overflow-y-auto no-scrollbar flex-1 space-y-2.5 pr-1 py-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                  <Inbox className="h-10 w-10 text-slate-700 mb-2.5" />
                  <p className="text-sm font-medium text-slate-300">Your inbox is clear</p>
                  <p className="text-xs text-slate-500 mt-1">Notifications and transaction updates will appear here.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const details = parseNotif(notif);
                  const style = getIconAndStyle(details.category);

                  return (
                    <div
                      id={`notif-item-${notif.id}`}
                      key={notif.id}
                      onClick={() => handleSelectNotif(notif)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex items-start gap-3.5 ${
                        notif.unread
                          ? 'bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-slate-900 border-indigo-500/30 hover:border-indigo-400 shadow-lg shadow-indigo-950/20'
                          : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/30 hover:border-slate-700 opacity-80'
                      }`}
                    >
                      {/* Icon container */}
                      <div className={`p-2.5 rounded-xl border ${style.glow} shrink-0 mt-0.5`}>
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${style.badgeBg}`}>
                            {details.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono ml-auto">
                            {details.dateStr}
                          </span>
                        </div>

                        <h4 className={`text-xs font-bold truncate ${notif.unread ? 'text-white' : 'text-slate-300'}`}>
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {notif.body}
                        </p>
                      </div>

                      {/* Unread indicator / Chevron */}
                      <div className="flex items-center gap-1 shrink-0 self-center">
                        {notif.unread && (
                          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
