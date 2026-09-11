import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-[#100709] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7A1831]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#240A12]/90 backdrop-blur-xl border border-[#8F1D3A]/30 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7A1831] to-[#C13A5A] flex items-center justify-center shadow-lg shadow-[#8F1D3A]/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              NIVO <span className="text-[#C13A5A]">CASH</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-white mt-2">Welcome Back!</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to manage your wallet and earnings</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2.5 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="email@example.com or username"
                className="w-full bg-[#240A12] border border-[#8F1D3A]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#C13A5A] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#240A12] border border-[#8F1D3A]/20 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
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
            className="w-full bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-xl shadow-lg shadow-[#7A1831]/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In to Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/10 pt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-black text-[#C13A5A] hover:underline">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};
