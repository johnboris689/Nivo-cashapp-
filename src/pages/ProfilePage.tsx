import React from 'react';
import { User, Mail, Phone, Calendar, ShieldCheck, LogOut, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-orange-400" />
          My Profile & Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Manage your account information and security</p>
      </div>

      <div className="bg-[#12151c] border border-orange-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{user?.fullName}</h2>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Verified
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">@{user?.username}</p>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              Wallet Balance: ₦{user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#181d28] p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              Email Address
            </span>
            <p className="text-sm font-bold text-white truncate">{user?.email}</p>
          </div>

          <div className="bg-[#181d28] p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              Phone Number
            </span>
            <p className="text-sm font-bold text-white">{user?.phone}</p>
          </div>

          <div className="bg-[#181d28] p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Referral Code
            </span>
            <div className="flex items-center justify-between">
              <p className="text-base font-mono font-black text-amber-400">{user?.referralCode}</p>
              <button
                onClick={copyCode}
                className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="bg-[#181d28] p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Member Since
            </span>
            <p className="text-sm font-bold text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>

        {/* Security / Sign out */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Session Active</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
