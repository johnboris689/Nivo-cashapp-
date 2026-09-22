import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationModal } from './NotificationModal';
import { NotificationItem } from '../types';
import { api } from '../lib/api';
import NevoLogo from './NevoLogo';

interface NavbarProps {
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090506]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center group hover:scale-[1.01] transition-transform">
            <NevoLogo size={38} compact />
          </Link>

          {/* Desktop Nav Actions */}
          {user ? (
            <div className="hidden md:flex items-center gap-3.5">
              {/* Wallet Chip */}
              <div className="flex items-center gap-2 bg-[#071114] hover:nivo-glass-surface border border-[#00C9A7]/20 rounded-full px-4 py-1.5 transition-all shadow-inner">
                <Wallet className="w-4 h-4 text-[#C13A5A]" />
                <span className="text-xs text-slate-400 font-medium">Balance:</span>
                <span className="text-sm font-black text-white tracking-wide">
                  ₦{user.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Quick Deposit & Withdraw Buttons */}
              <button
                onClick={onOpenDeposit}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-[#008F7A]/20 hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Deposit
              </button>

              <button
                onClick={onOpenWithdraw}
                className="flex items-center gap-1.5 bg-[#071114] hover:bg-[#0D1B1C] text-slate-200 border border-[#00C9A7]/20 font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C13A5A]" />
                Withdraw
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-xl bg-[#071114] hover:bg-[#0D1B1C] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C13A5A] text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-[#090506] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-[#071114] hover:bg-[#0D1B1C] border border-[#00C9A7]/20 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00C9A7] to-[#C13A5A] text-white font-black text-xs flex items-center justify-center overflow-hidden border border-[#C13A5A]/30">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                    {user.username}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 nivo-glass-surface border border-[#00C9A7]/20 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-white/10 backdrop-blur-xl">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                      <p className="text-[10px] text-[#C13A5A] font-mono mt-1">
                        Code: {user.referralCode}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <UserIcon className="w-4 h-4 text-[#C13A5A]" />
                        My Account
                      </Link>
                      <Link
                        to="/referrals"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <Sparkles className="w-4 h-4 text-[#00BFA6]" />
                        Refer & Earn (₦1,200)
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#C13A5A] hover:text-[#D46A83] hover:bg-[#00C9A7]/10 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#008F7A]/20 transition-all hover:scale-105"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl nivo-glass-surface border border-[#00C9A7]/20 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A080E] border-b border-[#00C9A7]/20 px-4 py-4 space-y-3 shadow-2xl">
            {user ? (
              <>
                <div className="nivo-glass-surface rounded-xl p-3.5 border border-[#00C9A7]/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Wallet Balance</p>
                    <p className="text-lg font-black text-white">
                      ₦{user.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDeposit?.();
                      }}
                      className="bg-gradient-to-r from-[#008F7A] to-[#00BFA6] text-white font-bold text-xs px-3.5 py-2 rounded-xl"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenWithdraw?.();
                      }}
                      className="bg-white/10 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl nivo-glass-surface border border-white/10 text-slate-200 text-xs font-semibold text-center hover:border-[#00C9A7]/30"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl nivo-glass-surface border border-white/10 text-slate-200 text-xs font-semibold text-center hover:border-[#00C9A7]/30"
                  >
                    Wallet
                  </Link>
                  <Link
                    to="/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#00C9A7]/10 text-[#C13A5A] text-xs font-bold text-center border border-[#00C9A7]/30"
                  >
                    Referrals (₦1,200)
                  </Link>
                  <Link
                    to="/tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl nivo-glass-surface border border-white/10 text-slate-200 text-xs font-semibold text-center hover:border-[#00C9A7]/30"
                  >
                    Tasks
                  </Link>
                </div>


                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-[#C13A5A] bg-[#00C9A7]/10 rounded-xl border border-[#00C9A7]/20"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#071114] text-white rounded-xl font-semibold text-sm border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-gradient-to-r from-[#008F7A] to-[#00BFA6] text-white rounded-xl font-black text-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notifications Drawer/Modal */}
      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onRefresh={fetchNotifications}
        />
      )}
    </>
  );
};
