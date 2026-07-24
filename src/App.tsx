import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// User Pages
import { DashboardPage } from './pages/DashboardPage';
import { WalletPage } from './pages/WalletPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { TasksPage } from './pages/TasksPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { ActivationPage } from './pages/ActivationPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDepositsPage } from './pages/admin/AdminDepositsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminTasksPage } from './pages/admin/AdminTasksPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminActivationsPage } from './pages/admin/AdminActivationsPage';

// UI Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { SplashScreen } from './components/SplashScreen';
import { ShieldCheck, Users, Building2, ArrowUpRight, CheckSquare, Sparkles, Settings, LogOut, Megaphone } from 'lucide-react';

// User Layout Component
const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, settings } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  if (loading) {
    return <SplashScreen message="Loading your dashboard..." subMessage="Fetching live wallet & referral data" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#F27D26] selection:text-black">
      {/* Announcement Banner */}
      {settings?.announcementBanner && (
        <div className="bg-gradient-to-r from-[#F27D26] via-[#E6721F] to-[#F27D26] text-black font-extrabold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md">
          <Megaphone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{settings.announcementBanner}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar onOpenDeposit={() => setShowDepositModal(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Sidebar for Desktop */}
        <div className="hidden md:block w-64 shrink-0">
          <Sidebar />
        </div>

        {/* Main Route Content */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {React.cloneElement(children as React.ReactElement, {
            onOpenDeposit: () => setShowDepositModal(true),
            onOpenWithdraw: () => setShowWithdrawModal(true),
          })}
        </main>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNav />

      {/* Global Modals */}
      {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} />}
      {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
    </div>
  );
};

// Admin Layout Component
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminUser, loading, adminLogout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen message="Connecting to Nivo Admin Portal..." subMessage="Authenticating administrative session" />;
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: ShieldCheck },
    { name: 'Users & Wallets', path: '/admin/users', icon: Users },
    { name: 'Activations', path: '/admin/activations', icon: Sparkles },
    { name: 'Deposits', path: '/admin/deposits', icon: Building2 },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpRight },
    { name: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    { name: 'Referrals', path: '/admin/referrals', icon: Sparkles },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-[#111111] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F27D26] text-black flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              NIVO <span className="text-[#F27D26]">ADMIN</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:inline">
              Logged in as <strong className="text-white">{adminUser.email}</strong>
            </span>
            <button
              onClick={adminLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Admin Navigation Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 bg-[#111111] border border-white/5 rounded-3xl p-4 h-fit sticky top-22">
          <p className="text-[10px] font-extrabold text-[#F27D26] uppercase tracking-wider px-3 mb-3">
            Admin Management
          </p>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#F27D26] text-black shadow-md shadow-orange-950/30 font-extrabold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Admin Page View */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* User Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <UserLayout>
                <DashboardPage onOpenDeposit={() => {}} onOpenWithdraw={() => {}} />
              </UserLayout>
            }
          />
          <Route
            path="/wallet"
            element={
              <UserLayout>
                <WalletPage onOpenDeposit={() => {}} onOpenWithdraw={() => {}} />
              </UserLayout>
            }
          />
          <Route
            path="/referrals"
            element={
              <UserLayout>
                <ReferralsPage />
              </UserLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <UserLayout>
                <TasksPage />
              </UserLayout>
            }
          />
          <Route
            path="/history"
            element={
              <UserLayout>
                <HistoryPage />
              </UserLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <UserLayout>
                <ProfilePage />
              </UserLayout>
            }
          />
          <Route
            path="/activation"
            element={
              <UserLayout>
                <ActivationPage />
              </UserLayout>
            }
          />

          {/* Admin Protected Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/activations"
            element={
              <AdminLayout>
                <AdminActivationsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/deposits"
            element={
              <AdminLayout>
                <AdminDepositsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/withdrawals"
            element={
              <AdminLayout>
                <AdminWithdrawalsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <AdminLayout>
                <AdminTasksPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/referrals"
            element={
              <AdminLayout>
                <AdminReferralsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
