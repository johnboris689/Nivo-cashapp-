import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NevoBrandLockup } from '../components/NevoLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(emailOrUsername, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nevo-auth-shell min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-[460px] mx-auto z-10">
        {/* Centered Brand Lockup - Required by specification */}
        <div className="mb-6">
          <NevoBrandLockup
            logoSize={54}
            subtitle="Sign in to manage your wallet, tasks and earnings."
          />
        </div>

        <div className="nevo-auth-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          {/* Segmented Auth Switch */}
          <div className="p-1 bg-[#050C0E] border border-white/[0.08] rounded-xl flex items-center mb-5">
            <Link
              to="/register"
              className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-lg text-[#8E9A9A] hover:text-white border border-transparent transition-all"
            >
              Sign Up
            </Link>
            <div className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#008F7A]/30 to-[#00C9A7]/25 text-[#7EE8D3] border border-[#00C9A7]/30 shadow-[0_2px_12px_rgba(0,201,167,0.15)]">
              Sign In
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="john@example.com or username"
                  className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#7EE8D3] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-11 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-xs font-bold uppercase tracking-wider nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all mt-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In to Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.08] pt-4">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#7EE8D3] hover:underline ml-1">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

