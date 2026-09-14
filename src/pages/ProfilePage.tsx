import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Calendar, ShieldCheck, LogOut, Copy, Check, Sparkles, CheckCircle2, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_AVATARS, DefaultAvatar } from '../data/avatars';
import { api } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleProfilePhoto = async (file?: File) => {
    if (!file) return;
    try {
      setUploadingPhoto(true);
      setMsg(null);
      await api.uploadProfilePicture(file);
      setMsg({ type: 'success', text: 'Profile picture updated successfully.' });
      await refreshUser();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile picture.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectAvatar = async (avatar: DefaultAvatar) => {
    if (user?.avatarUrl === avatar.url) return;

    try {
      setUpdatingAvatar(true);
      setMsg(null);
      await api.updateAvatar(avatar.url);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5A1024', '#7A1831', '#A52A4A', '#C13A5A', '#ffffff'],
      });

      setMsg({ type: 'success', text: `Avatar updated to "${avatar.name}"!` });
      await refreshUser();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update avatar' });
    } finally {
      setUpdatingAvatar(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-[#C13A5A]" />
          My Profile & Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage your identity, 3D avatar, account credentials, and security</p>
      </div>

      {/* Alert Message */}
      {msg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border transition-all ${
            msg.type === 'success'
              ? 'bg-[#8F1D3A]/10 text-[#A52A4A] border-[#8F1D3A]/20'
              : 'bg-[#8F1D3A]/10 text-[#C13A5A] border-[#8F1D3A]/20'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Account Card */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#A52A4A]/5 rounded-full blur-3xl pointer-events-none" />

        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Avatar display */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7A1831] to-[#C13A5A] p-0.5 shadow-xl shadow-[#8F1D3A]/20">
                <div className="w-full h-full rounded-[14px] bg-[#240A12] overflow-hidden flex items-center justify-center text-white font-black text-3xl">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{user?.fullName?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <label className="absolute -bottom-1 -right-1 nivo-glass-surface p-1 rounded-full border border-white/10 text-[#C13A5A] cursor-pointer" title="Upload profile picture">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadingPhoto} onChange={e => handleProfilePhoto(e.target.files?.[0])} />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{user?.fullName}</h2>
                <span className="bg-[#8F1D3A]/10 text-[#A52A4A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#8F1D3A]/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Account
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">@{user?.username}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs bg-[#A52A4A]/10 text-[#C13A5A] border border-[#A52A4A]/20 font-bold px-3 py-1 rounded-xl">
                  Wallet: ₦{user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D AVATAR SELECTION GALLERY */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#C13A5A]" />
                Select Default Profile Avatar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a default avatar or upload your own profile picture. Your selected image is stored with your Nevo account.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C13A5A] bg-[#A52A4A]/10 px-3 py-1 rounded-full border border-[#A52A4A]/20 self-start sm:self-auto">
              3D AI Rendered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {DEFAULT_AVATARS.map((av) => {
              const isSelected = user?.avatarUrl === av.url;
              return (
                <div
                  key={av.id}
                  onClick={() => handleSelectAvatar(av)}
                  className={`group relative nivo-glass-surface rounded-2xl border p-3 flex flex-col items-center text-center transition-all cursor-pointer hover:scale-[1.02] ${
                    isSelected
                      ? 'border-[#C13A5A] bg-[#A52A4A]/10 shadow-lg shadow-[#C13A5A]/20'
                      : 'border-white/10 hover:border-[#8F1D3A]/30'
                  }`}
                >
                  {/* Avatar image frame */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 border border-white/5 bg-black/40">
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-[#C13A5A] text-slate-950 rounded-full p-2 shadow-xl animate-bounce">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-black text-white">{av.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">{av.tag}</span>

                  <button
                    disabled={updatingAvatar || isSelected}
                    className={`mt-2.5 w-full text-[11px] font-black py-1.5 px-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#C13A5A] text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-300 group-hover:bg-gradient-to-r group-hover:from-[#7A1831] group-hover:to-[#A52A4A] group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Current Avatar' : 'Set Avatar'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <div className="nivo-glass-surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#C13A5A]" />
              Email Address
            </span>
            <p className="text-sm font-bold text-white truncate">{user?.email}</p>
          </div>

          <div className="nivo-glass-surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#C13A5A]" />
              Phone Number
            </span>
            <p className="text-sm font-bold text-white">{user?.phone || 'Not provided'}</p>
          </div>

          <div className="nivo-glass-surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C13A5A]" />
              Referral Code
            </span>
            <div className="flex items-center justify-between">
              <p className="text-base font-mono font-black text-[#C13A5A]">{user?.referralCode}</p>
              <button
                onClick={copyCode}
                className="text-xs font-bold text-[#C13A5A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#A52A4A]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="nivo-glass-surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C13A5A]" />
              Member Since
            </span>
            <p className="text-sm font-bold text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>

        {/* Security / Sign out */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#A52A4A]" />
            <span>Encrypted Session Active</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto bg-[#8F1D3A]/10 hover:bg-[#8F1D3A]/20 text-[#C13A5A] border border-[#8F1D3A]/30 font-extrabold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
