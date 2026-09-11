import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100709] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7A1831]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#240A12]/90 backdrop-blur-xl border border-[#8F1D3A]/30 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7A1831] to-[#C13A5A] flex items-center justify-center shadow-lg shadow-[#8F1D3A]/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              NIVO <span className="text-[#C13A5A]">CASH</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-white mt-1">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your email address to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#8F1D3A]/10 border border-[#8F1D3A]/30 p-5 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#A52A4A] mx-auto" />
            <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have sent password reset instructions to <strong className="text-white">{email}</strong>. Follow the link in the email to restore your access.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 bg-gradient-to-r from-[#7A1831] to-[#A52A4A] text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#7A1831]/25"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full bg-[#240A12] border border-[#8F1D3A]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] text-white font-black text-sm py-3.5 rounded-xl shadow-lg shadow-[#7A1831]/25 transition-all cursor-pointer"
            >
              {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
