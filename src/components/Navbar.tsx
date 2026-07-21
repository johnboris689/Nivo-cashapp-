import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wallet,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Zap,
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

interface NavbarProps {
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { user, logout, settings } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center font-bold text-black shadow-lg shadow-orange-950/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                NIVO <span className="text-[#F27D26]">CASH</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Actions */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              {/* Wallet Chip */}
              <div className="flex items-center gap-2 bg-[#141414] hover:bg-white/5 border border-white/5 rounded-full px-4 py-1.5 transition-all">
                <Wallet className="w-4 h-4 text-[#F27D26]" />
                <span className="text-xs text-gray-400 font-medium">Balance:</span>
                <span className="text-sm font-bold text-white tracking-wide">
                  ₦{user.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Quick Deposit & Withdraw Buttons */}
              <button
                onClick={onOpenDeposit}
                className="flex items-center gap-1.5 bg-[#F27D26] hover:bg-[#E6721F] text-black font-bold text-xs px-4 py-2 rounded-xl transition-all hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Deposit
              </button>

              <button
                onClick={onOpenWithdraw}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/5 font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#F27D26]" />
                Withdraw
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-xl bg-[#141414] hover:bg-white/5 border border-white/5 text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F27D26] text-black text-[10px] font-black flex items-center justify-center border-2 border-[#0A0A0A] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-[#141414] hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F27D26] text-black font-black text-xs flex items-center justify-center">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-200 max-w-[100px] truncate">
                    {user.username}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-white/5">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">@{user.username}</p>
                      <p className="text-[10px] text-[#F27D26] font-mono mt-1">
                        Code: {user.referralCode}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        <UserIcon className="w-4 h-4 text-[#F27D26]" />
                        My Account
                      </Link>
                      <Link
                        to="/referrals"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        <Sparkles className="w-4 h-4 text-[#F27D26]" />
                        Refer & Earn (₦1,200)
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#F27D26] hover:bg-[#F27D26]/10 font-bold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Portal
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
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
                className="text-xs font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-[#F27D26] hover:bg-[#E6721F] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-orange-950/20 transition-all hover:scale-105"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#141414] border border-white/5 text-gray-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111111] border-b border-white/5 px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="bg-[#141414] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Wallet Balance</p>
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
                      className="bg-[#F27D26] text-black font-bold text-xs px-3 py-1.5 rounded-lg"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenWithdraw?.();
                      }}
                      className="bg-white/10 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-gray-200 text-xs font-semibold text-center"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-gray-200 text-xs font-semibold text-center"
                  >
                    Wallet
                  </Link>
                  <Link
                    to="/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#F27D26]/10 text-[#F27D26] text-xs font-bold text-center border border-[#F27D26]/20"
                  >
                    Referrals (₦1,200)
                  </Link>
                  <Link
                    to="/tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-gray-200 text-xs font-semibold text-center"
                  >
                    Tasks
                  </Link>
                </div>

                {user.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-xs font-bold text-[#F27D26] bg-[#F27D26]/10 border border-[#F27D26]/20 rounded-xl"
                  >
                    🛡️ Admin Control Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-red-400 bg-red-500/10 rounded-xl"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#141414] text-white rounded-xl font-semibold text-sm border border-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#F27D26] text-black rounded-xl font-black text-sm"
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
